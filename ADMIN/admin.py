import logging
import asyncio
import aiosqlite
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import (
    ReplyKeyboardMarkup,
    KeyboardButton,
    ForceReply,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)
from datetime import datetime
import os
import sys
import config
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_CONCURRENT_TASKS = 1

def log_action(log_file, action):
    log_entry = f"{datetime.now().isoformat()} - {action}"
    logger.info(log_entry)
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(f"{log_entry}\n")

def update_console_status(current, total, successful, errors, bot_name):
    sys.stdout.write(f"\r[{bot_name}] Пользователи: {current}/{total} | Успехи: {successful} | Ошибки: {errors}")
    sys.stdout.flush()

def escape_markdown(text):
    """
    Экранирует специальные символы для использования с MarkdownV2.
    """
    escape_chars = r'\_*[]()~`>#+-=|{}.!'
    return re.sub(f'([{re.escape(escape_chars)}])', r'\\\1', text)

async def send_message(bot, user_id, message_text, semaphore, db, bot_name):
    async with semaphore:
        try:
            escaped_text = escape_markdown(message_text)
            await bot.send_message(user_id, escaped_text, parse_mode="MarkdownV2")
            return "success"
        except Exception as e:
            log_action(config.ADMIN_BOT['LOG_FILE'], f"Ошибка рассылки для пользователя {user_id} в боте {bot_name}: {e}")
            if "blocked by the user" in str(e) or "chat not found" in str(e):
                try:
                    await db.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
                    await db.commit()
                except Exception as db_err:
                    log_action(config.ADMIN_BOT['LOG_FILE'], f"Ошибка удаления пользователя {user_id} из базы данных: {db_err}")
            return "error"

class AdminBot:
    def __init__(self, token, log_file):
        self.bot = Bot(token=token)
        self.dp = Dispatcher()
        self.log_file = log_file
        self.broadcast_text = None

        self.dp.message(Command("start"))(self.start)
        self.dp.message(Command("admin"))(self.admin_panel)
        self.dp.message(lambda message: message.text == "Сделать рассылку")(self.ask_broadcast_text)
        self.dp.message(lambda message: message.reply_to_message and message.reply_to_message.text == "Введите сообщение для рассылки:")(self.set_broadcast_text)
        self.dp.message(lambda message: message.text == "Подсчитать строки в файлах ключей")(self.count_keys)
        self.dp.message(lambda message: message.text == "Снять ограничения")(self.remove_restrictions_confirm)
        self.dp.callback_query.register(self.handle_bot_choice, lambda c: c.data.startswith("choose_"))
        self.dp.callback_query.register(self.handle_restrictions_confirmation, lambda c: c.data.startswith("confirm_remove_restrictions_"))

    async def start(self, message: types.Message):
        if message.from_user.id not in config.ADMINS:
            await self.bot.send_message(message.from_user.id, "У вас нет доступа к этой команде.")
            return

        username = message.from_user.username or "Неизвестный пользователь"
        log_action(self.log_file, f"Админ {username} зашел в бота")
        await self.bot.send_message(
            message.from_user.id,
            "Привет, админ! Используй /admin для доступа к панели."
        )

    async def admin_panel(self, message: types.Message):
        if message.from_user.id not in config.ADMINS:
            await self.bot.send_message(message.from_user.id, "У вас нет доступа к этой команде.")
            return

        kb = ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="Сделать рассылку")],
                [KeyboardButton(text="Подсчитать строки в файлах ключей")],
                [KeyboardButton(text="Снять ограничения")]
            ],
            resize_keyboard=True
        )
        await self.bot.send_message(
            message.from_user.id,
            "Админ панель:",
            reply_markup=kb
        )

    async def ask_broadcast_text(self, message: types.Message):
        await self.bot.send_message(
            message.from_user.id,
            "Введите сообщение для рассылки:",
            reply_markup=ForceReply(selective=True)
        )

    async def set_broadcast_text(self, message: types.Message):
        self.broadcast_text = message.text
        await self.choose_bots(message.from_user.id)

    async def choose_bots(self, user_id):
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=bot_name, callback_data=f"choose_{bot_name}") for bot_name in config.BOTS],
            [InlineKeyboardButton(text="Рассылка по всем ботам", callback_data="choose_all")]
        ])
        await self.bot.send_message(user_id, "Выберите бота для рассылки:", reply_markup=kb)

    async def handle_bot_choice(self, callback_query: types.CallbackQuery):
        data = callback_query.data
        if data.startswith("choose_"):
            bot_name = data.split("_")[1]
            if bot_name == "all":
                selected_bots = list(config.BOTS.keys())
            else:
                selected_bots = [bot_name]

            await self.broadcast_to_bots(callback_query.from_user.id, selected_bots)
            await callback_query.answer(f"Рассылка начата для: {', '.join(selected_bots)}")

    async def broadcast_to_bots(self, user_id, selected_bots):
        if not self.broadcast_text:
            await self.bot.send_message(user_id, "Сообщение для рассылки не задано.")
            return

        semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)

        for bot_name in selected_bots:
            bot_config = config.BOTS[bot_name]
            total_users = 0
            errors = 0
            successful = 0

            async with aiosqlite.connect(bot_config['DB_FILE']) as db:
                async with db.execute("SELECT user_id FROM users") as cursor:
                    user_ids = await cursor.fetchall()
                    total_users = len(user_ids)

                async with Bot(token=bot_config['TOKEN']) as bot:
                    tasks = []

                    for i, user_id_tuple in enumerate(user_ids):
                        task = send_message(bot, user_id_tuple[0], self.broadcast_text, semaphore, db, bot_name)
                        tasks.append(task)

                    for i, task in enumerate(asyncio.as_completed(tasks)):
                        result = await task
                        if result == "success":
                            successful += 1
                        else:
                            errors += 1
                        update_console_status(i + 1, total_users, successful, errors, bot_name)

                    update_console_status(total_users, total_users, successful, errors, bot_name)
                    sys.stdout.write("\n")

            summary_message = (
                f"Рассылка завершена для бота {bot_name}.\n"
                f"Общее количество пользователей для рассылки: {total_users}\n"
                f"Успешно отправлено сообщений: {successful}\n"
                f"Ошибки: {errors}\n"
            )

            await self.bot.send_message(user_id, summary_message)

    async def count_keys(self, message: types.Message):
        keys_files = {
            'Bike': 'KeysBike.txt',
            'Train': 'KeysTrain.txt',
            'Clone': 'KeysClone.txt',
            'Chain': 'KeysChain.txt',
            'Merge': 'KeysMerge.txt',  # Новый файл для Merge
            'Race': 'KeysRace.txt',
            'Polysphere': 'KeysPolysphere.txt',
            'Mom': 'KeysMom.txt',
            'Polysphere': 'KeysPolysphere.txt',
            'MudRacing': 'KeysMudracing.txt'
        }

        lines_count = {}

        for key, filename in keys_files.items():
            file_path = os.path.join(os.path.dirname(__file__), filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    lines_count[key] = len(lines)
            except Exception as e:
                lines_count[key] = f"Ошибка при чтении файла: {e}"

        result_message = "Количество строк в файлах ключей:\n"
        for key, count in lines_count.items():
            result_message += f"{key}: {count}\n"

        await self.bot.send_message(message.from_user.id, result_message)

    async def remove_restrictions_confirm(self, message: types.Message):
        kb = InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="Да", callback_data="confirm_remove_restrictions_yes")],
                [InlineKeyboardButton(text="Нет", callback_data="confirm_remove_restrictions_no")]
            ]
        )
        await self.bot.send_message(
            message.from_user.id,
            "Вы действительно хотите снять ограничения для всех пользователей?",
            reply_markup=kb,
        )

    async def handle_restrictions_confirmation(self, callback_query: types.CallbackQuery):
        if callback_query.data == "confirm_remove_restrictions_yes":
            await self.remove_restrictions(callback_query.from_user.id)
            await callback_query.answer("Ограничения сняты.")
        elif callback_query.data == "confirm_remove_restrictions_no":
            await self.bot.send_message(callback_query.from_user.id, "Операция отменена.")
            await callback_query.answer("Операция отменена.")

    async def remove_restrictions(self, user_id):
        for bot_name, bot_config in config.BOTS.items():
            async with aiosqlite.connect(bot_config['DB_FILE']) as db:
                try:
                    await db.execute("""
                        UPDATE users
                        SET last_request_bike = NULL, count_bike = 0,
                            last_request_train = NULL, count_train = 0,
                            last_request_clone = NULL, count_clone = 0,
                            last_request_chain = NULL, count_chain = 0,
                            last_request_merge = NULL, count_merge = 0
                    """)
                    await db.commit()
                    log_action(self.log_file, f"Сняты ограничения для всех пользователей в боте {bot_name}")
                except Exception as e:
                    log_action(self.log_file, f"Ошибка при снятии ограничений для всех пользователей в боте {bot_name}: {e}")
                    await self.bot.send_message(user_id, f"Ошибка при снятии ограничений в боте {bot_name}: {e}")

        await self.bot.send_message(user_id, "Ограничения сняты для всех пользователей во всех ботах.")

    async def start_bot(self):
        await self.dp.start_polling(self.bot)

if __name__ == "__main__":
    admin_bot = AdminBot(token=config.ADMIN_BOT['TOKEN'], log_file=config.ADMIN_BOT['LOG_FILE'])
    asyncio.run(admin_bot.start_bot())
