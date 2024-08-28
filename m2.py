import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.fsm.storage.memory import MemoryStorage
import aiosqlite
from colorama import Fore, Style, init
from aiogram.filters.callback_data import CallbackData
from aiogram import F

# Настройки
API_TOKEN = '7417605772:AAHmsaWxCyU_FLQdEtovgisJ2oJ1WBvy0RM'  # Замените на свой токен API
CHANNELS = ["@MrROBOTcommunityRUS", "@combohamsterdaiIy"]  # Список каналов для проверки подписки
WEB_APP_URL = "https://keys002.pages.dev/"  # URL для мини-приложения
LOG_LEVEL = logging.INFO  # Уровень логирования

# Инициализация colorama и настройка логирования
init(autoreset=True)
logging.getLogger('aiogram.event').setLevel(logging.WARNING)

# Определение кастомных обработчиков логов с цветами
class ColoredFormatter(logging.Formatter):
    def format(self, record):
        if record.levelno == logging.INFO:
            record.msg = Fore.GREEN + record.msg + Style.RESET_ALL
        elif record.levelno == logging.WARNING:
            record.msg = Fore.YELLOW + record.msg + Style.RESET_ALL
        elif record.levelno == logging.ERROR:
            record.msg = Fore.RED + record.msg + Style.RESET_ALL
        return super().format(record)

formatter = ColoredFormatter('%(asctime)s - %(levelname)s - %(message)s')
handler = logging.StreamHandler()
handler.setFormatter(formatter)

logger = logging.getLogger(__name__)
logger.setLevel(LOG_LEVEL)
logger.addHandler(handler)

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
    logger.info("Таблица all_users создана или уже существует.")

    await userp_db.execute('''CREATE TABLE IF NOT EXISTS allowed_users (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              user_id INTEGER UNIQUE)''')
    await userp_db.commit()
    logger.info("Таблица allowed_users создана или уже существует.")
    logger.info("Базы данных инициализированы.")

# Функция добавления пользователя в users.db
async def add_user_to_all(user_id):
    try:
        await users_db.execute('INSERT OR IGNORE INTO all_users (user_id) VALUES (?)', (user_id,))
        await users_db.commit()
        logger.info(f"Пользователь с ID: {user_id} добавлен в базу данных users.db.")
    except sqlite3.OperationalError as e:
        logger.error(f"Ошибка при добавлении пользователя в all_users: {e}")

# Функция добавления пользователя в userp.db (если подписан)
async def add_user_to_allowed(user_id):
    try:
        await userp_db.execute('INSERT OR IGNORE INTO allowed_users (user_id) VALUES (?)', (user_id,))
        await userp_db.commit()
        logger.info(f"Пользователь с ID: {user_id} добавлен в базу данных userp.db.")
    except sqlite3.OperationalError as e:
        logger.error(f"Ошибка при добавлении пользователя в allowed_users: {e}")

# Функция удаления пользователя из userp.db
async def remove_user_from_allowed(user_id):
    try:
        await userp_db.execute('DELETE FROM allowed_users WHERE user_id = ?', (user_id,))
        await userp_db.commit()
        logger.info(f"Пользователь с ID: {user_id} удален из базы данных userp.db.")
    except sqlite3.OperationalError as e:
        logger.error(f"Ошибка при удалении пользователя из allowed_users: {e}")

# Функция проверки подписки на каналы и возврат только тех, на которые не подписан
async def get_unsubscribed_channels(user_id):
    unsubscribed_channels = []
    logger.info(f"Проверка подписки пользователя с ID: {user_id} на каналы: {CHANNELS}")
    for channel in CHANNELS:
        try:
            logger.info(f"Проверка канала: {channel}")
            member = await bot.get_chat_member(channel, user_id)
            if member.status in ['left', 'kicked']:
                logger.info(f"Пользователь с ID: {user_id} не подписан на канал {channel}.")
                unsubscribed_channels.append(channel)
            else:
                logger.info(f"Пользователь с ID: {user_id} подписан на канал {channel}.")
        except Exception as e:
            logger.error(f"Ошибка при проверке подписки на канал {channel} для пользователя {user_id}: {e}")
            unsubscribed_channels.append(channel)
    return unsubscribed_channels

# Функция циклической проверки подписки всех пользователей в базе данных userp.db
async def check_all_users_loop():
    logger.info("Запуск циклической проверки подписки всех пользователей...")
    while True:
        try:
            # Подсчет общего числа пользователей
            async with userp_db.execute('SELECT COUNT(*) FROM allowed_users') as count_cursor:
                total_users = (await count_cursor.fetchone())[0]
            logger.info(f"Всего пользователей для проверки: {total_users}")
            
            # Проверка пользователей
            async with userp_db.execute('SELECT user_id FROM allowed_users') as cursor:
                user_count = 0
                async for row in cursor:
                    user_id = row[0]
                    user_count += 1
                    logger.info(f"Проверка пользователя {user_count}/{total_users} с ID: {user_id}")
                    unsubscribed_channels = await get_unsubscribed_channels(user_id)
                    if unsubscribed_channels:
                        logger.info(f"Пользователь с ID: {user_id} не подписан на каналы: {unsubscribed_channels}. Удаляем его из базы allowed_users.")
                        await remove_user_from_allowed(user_id)
                    else:
                        logger.info(f"Пользователь с ID: {user_id} подписан на все каналы.")
            logger.info("Проверка завершена. Ожидание перед следующей проверкой...")
            await asyncio.sleep(60)  # Настроить задержку перед следующей проверкой (например, 60 секунд)
        except sqlite3.OperationalError as e:
            logger.error(f"Ошибка при проверке всех пользователей: {e}")
            logger.info("Ожидание перед повторной попыткой...")
            await asyncio.sleep(60)  # В случае ошибки, подождать перед повтором

# Обработка команды /start
@dp.message(Command(commands=["start"]))
async def send_welcome(message: types.Message):
    user_id = message.from_user.id

    # Внесение пользователя в базу данных users.db
    await add_user_to_all(user_id)

    logger.info(f"Пользователь {user_id} запустил бота.")

    # Проверяем подписку на каналы
    unsubscribed_channels = await get_unsubscribed_channels(user_id)

    if unsubscribed_channels:
        # Если пользователь не подписан на все каналы
        keyboard = InlineKeyboardBuilder()
        logger.info(f"Пользователь с ID: {user_id} не подписан на следующие каналы: {unsubscribed_channels}")
        for channel in unsubscribed_channels:
            button = InlineKeyboardButton(text=f"Подписаться на {channel}", url=f"https://t.me/{channel.lstrip('@')}")
            keyboard.row(button)

        # Кнопка для проверки подписки
        check_button = InlineKeyboardButton(text="Проверить подписку", callback_data="check_subscription")
        keyboard.row(check_button)

        await message.answer("Для получения доступа подпишитесь на каналы:", reply_markup=keyboard.as_markup())
    else:
        # Если пользователь подписан на все каналы
        await add_user_to_allowed(user_id)
        logger.info(f"Пользователь с ID: {user_id} подписан на все каналы и может использовать бота.")
        await message.answer(f"Доступ подтвержден. Вы можете использовать бота.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Получить ключи.", web_app=WebAppInfo(url=WEB_APP_URL))]
        ]))

# Обработка команды /check_subscription
@dp.message(Command(commands=["check_subscription"]))
async def check_subscription(message: types.Message):
    user_id = message.from_user.id
    unsubscribed_channels = await get_unsubscribed_channels(user_id)

    if unsubscribed_channels:
        keyboard = InlineKeyboardBuilder()
        logger.info(f"Пользователь с ID: {user_id} не подписан на следующие каналы: {unsubscribed_channels}")
        for channel in unsubscribed_channels:
            button = InlineKeyboardButton(text=f"Подписаться на {channel}", url=f"https://t.me/{channel.lstrip('@')}")
            keyboard.row(button)
        check_button = InlineKeyboardButton(text="Проверить подписку", callback_data="check_subscription")
        keyboard.row(check_button)
        await message.answer("Для получения доступа подпишитесь на все необходимые каналы. Пожалуйста, подпишитесь:", reply_markup=keyboard.as_markup())
    else:
        await add_user_to_allowed(user_id)
        logger.info(f"Пользователь с ID: {user_id} подписан на все каналы и может использовать бота.")
        await message.answer("Теперь у вас есть доступ. Вы можете использовать бота.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Получить ключи.", web_app=WebAppInfo(url=WEB_APP_URL))]
        ]))

# Обработка нажатия на кнопку "Проверить подписку"
@dp.callback_query(F.data == "check_subscription")
async def process_callback_check_subscription(callback_query: types.CallbackQuery):
    await check_subscription(callback_query.message)
    await callback_query.answer()

# Главная функция для запуска бота
async def main():
    await init_db()  # Инициализация базы данных
    asyncio.create_task(check_all_users_loop())  # Запуск цикла проверки подписки всех пользователей
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
