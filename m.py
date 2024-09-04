import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, ReplyKeyboardMarkup, KeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.fsm.storage.memory import MemoryStorage
import aiosqlite
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from colorama import Fore, Style, init

# Настройки
API_TOKEN = '7343786423:AAHB-ET104-F1bf_t0FZz6Klf6yL1Q2dnpU'  # Замените на свой токен API
CHANNELS = ["@MrROBOTcommunityRUS", "@combohamsterdaiIy"]  # Список каналов для проверки подписки
WEB_APP_URL = "https://neo19867.github.io/Keys003/"  # URL для мини-приложения
LOG_LEVEL = logging.INFO  # Уровень логирования
CHECK_INTERVAL_MINUTES = 1  # Интервал проверки подписки на каналы в минутах

# Инициализация colorama и настройка логирования
init(autoreset=True)
logging.getLogger('aiogram.event').setLevel(logging.WARNING)
logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger(__name__)

# Создаем экземпляр бота и диспетчера
bot = Bot(token=API_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

# Глобальные соединения с базами данных
users_db = None
userp_db = None

# Инициализация баз данных
async def init_db():
    global users_db, userp_db
    logger.info("Инициализация базы данных...")
    
    users_db = await aiosqlite.connect('users.db')
    userp_db = await aiosqlite.connect('userp.db')
    
    await users_db.execute('''CREATE TABLE IF NOT EXISTS all_users (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              user_id INTEGER UNIQUE)''')
    await users_db.commit()

    await userp_db.execute('''CREATE TABLE IF NOT EXISTS allowed_users (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              user_id INTEGER UNIQUE)''')
    await userp_db.commit()

    logger.info("Базы данных инициализированы.")

# Функция для логирования количества пользователей в базах данных
async def log_user_counts():
    try:
        async with users_db.execute('SELECT COUNT(*) FROM all_users') as cursor:
            all_users_count = await cursor.fetchone()
        async with userp_db.execute('SELECT COUNT(*) FROM allowed_users') as cursor:
            allowed_users_count = await cursor.fetchone()
        
        logger.info(f"{Fore.CYAN}Количество пользователей в all_users: {all_users_count[0]}")
        logger.info(f"{Fore.CYAN}Количество пользователей в allowed_users: {allowed_users_count[0]}")
    except sqlite3.OperationalError as e:
        logger.error(f"Ошибка при подсчете пользователей: {e}")

# Функция добавления пользователя в users.db с проверкой на существование
async def add_user_to_all(user_id):
    try:
        async with users_db.execute('SELECT 1 FROM all_users WHERE user_id = ?', (user_id,)) as cursor:
            exists = await cursor.fetchone()

        if not exists:
            await users_db.execute('INSERT INTO all_users (user_id) VALUES (?)', (user_id,))
            await users_db.commit()
            logger.info(f"{Fore.YELLOW}Пользователь с ID: {user_id} добавлен в базу данных users.db.")
        else:
            logger.info(f"{Fore.YELLOW}Пользователь с ID: {user_id} уже существует в базе данных users.db.")
    except sqlite3.OperationalError as e:
        logger.error(f"Ошибка при добавлении пользователя в all_users: {e}")

    # Логируем количество пользователей в базах
    await log_user_counts()

# Функция добавления пользователя в userp.db (если подписан) с проверкой на существование
async def add_user_to_allowed(user_id):
    try:
        async with userp_db.execute('SELECT 1 FROM allowed_users WHERE user_id = ?', (user_id,)) as cursor:
            exists = await cursor.fetchone()

        if not exists:
            await userp_db.execute('INSERT INTO allowed_users (user_id) VALUES (?)', (user_id,))
            await userp_db.commit()
            logger.info(f"{Fore.GREEN}Пользователь с ID: {user_id} добавлен в базу данных userp.db.")
        else:
            logger.info(f"{Fore.GREEN}Пользователь с ID: {user_id} уже существует в базе данных userp.db.")
    except sqlite3.OperationalError as e:
        logger.error(f"Ошибка при добавлении пользователя в allowed_users: {e}")

    # Логируем количество пользователей в базах
    await log_user_counts()

# Функция удаления пользователя из userp.db
async def remove_user_from_allowed(user_id):
    try:
        await userp_db.execute('DELETE FROM allowed_users WHERE user_id = ?', (user_id,))
        await userp_db.commit()
        logger.info(f"{Fore.RED}Пользователь с ID: {user_id} удален из базы данных userp.db.")
    except sqlite3.OperationalError as e:
        logger.error(f"Ошибка при удалении пользователя из allowed_users: {e}")

    # Логируем количество пользователей в базах
    await log_user_counts()

# Функция проверки подписки на каналы и возврат только тех, на которые не подписан
async def get_unsubscribed_channels(user_id):
    unsubscribed_channels = []
    for channel in CHANNELS:
        try:
            member = await bot.get_chat_member(channel, user_id)
            if member.status in ['left', 'kicked']:
                unsubscribed_channels.append(channel)
        except Exception as e:
            logger.error(f"Ошибка при проверке подписки на канал {channel}: {e}")
            unsubscribed_channels.append(channel)
    return unsubscribed_channels

# Функция проверки подписки всех пользователей в базе данных userp.db
async def check_all_users():
    logger.info("Запуск проверки подписки всех пользователей...")
    try:
        async with userp_db.execute('SELECT user_id FROM allowed_users') as cursor:
            async for row in cursor:
                user_id = row[0]
                unsubscribed_channels = await get_unsubscribed_channels(user_id)
                if unsubscribed_channels:
                    await remove_user_from_allowed(user_id)
    except sqlite3.OperationalError as e:
        logger.error(f"Ошибка при проверке всех пользователей: {e}")

# Обработка команды /start
@dp.message(Command(commands=["start"]))
@dp.message()
async def handle_commands(message: types.Message):
    user_id = message.from_user.id

    if message.text and message.text.lower() == "таблица прокачки hamster":
        await message.answer(
            "Ссылка на таблицу: [Прокачка Хомяка](https://docs.google.com/spreadsheets/d/1mVCjBu9-HfKn3l7UtoWAT37PDYoq757aQg0-lMCQe9w)",
            disable_web_page_preview=True,
            parse_mode="Markdown"
        )
        return





    # Внесение пользователя в базу данных users.db
    await add_user_to_all(user_id)

    logger.info(f"{Fore.BLUE}Пользователь {user_id} запустил бота.")

    # Проверяем подписку на каналы
    unsubscribed_channels = await get_unsubscribed_channels(user_id)

    if (unsubscribed_channels):
        # Если пользователь не подписан на все каналы
        keyboard = InlineKeyboardBuilder()
        for channel in unsubscribed_channels:
            button = InlineKeyboardButton(text=f"{channel}", url=f"https://t.me/{channel.lstrip('@')}")
            keyboard.row(button)
        # Создаем обычную клавиатуру
        reply_kb = ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="Проверить доступ / Check access")],
                [KeyboardButton(text="таблица прокачки hamster")]
            ],
            resize_keyboard=True
        )
        await message.answer("Для получения доступа, подпишитесь на каналы:", reply_markup=keyboard.as_markup(),)
        await message.answer(f"To gain access, subscribe to the channels", reply_markup=reply_kb)
    else:
        # Если пользователь подписан на все каналы
        await add_user_to_allowed(user_id)
        
        # Создаем обычную клавиатуру
        reply_kb = ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="Проверить доступ / Check access")],
                [KeyboardButton(text="таблица прокачки hamster")]
            ],
            resize_keyboard=True
        )

        await message.answer(f"Доступ будет подтвержден через 1 минуту.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Получить ключи / Get the keys", web_app=WebAppInfo(url=WEB_APP_URL))]
        ]))
      
        await message.answer("Access will be confirmed in 1 minute.", reply_markup=reply_kb)

# Запуск планировщика для периодической проверки подписки
async def on_startup():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(check_all_users, IntervalTrigger(minutes=CHECK_INTERVAL_MINUTES), coalesce=True, max_instances=1)
    scheduler.start()

    await init_db()

# Основная асинхронная функция
async def main():
    await on_startup()
    await dp.start_polling(bot)

# Запуск бота
if __name__ == "__main__":
    asyncio.run(main())
