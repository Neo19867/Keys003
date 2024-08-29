import asyncio
import logging
import aiosqlite
from colorama import Fore, Style, init

# Инициализация colorama
init(autoreset=True)

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Функция копирования user_id из users в all_users
async def copy_users_to_all_users():
    logger.info("Запуск копирования пользователей из users в all_users...")

    async with aiosqlite.connect('users.db') as db:
        # Создание таблицы all_users, если она не существует
        await db.execute('''
            CREATE TABLE IF NOT EXISTS all_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE
            )
        ''')
        await db.commit()

        # Копирование user_id из users в all_users с игнорированием дублирующихся значений
        await db.execute('''
            INSERT OR IGNORE INTO all_users (user_id)
            SELECT user_id FROM users
        ''')
        await db.commit()

        logger.info(f"{Fore.GREEN}Копирование пользователей завершено.")

# Основная функция
async def main():
    await copy_users_to_all_users()

if __name__ == '__main__':
    asyncio.run(main())
