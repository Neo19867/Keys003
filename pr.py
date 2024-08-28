import asyncio
import logging
import aiosqlite
from aiogram import Bot
from colorama import Fore, Style, init

# Инициализация colorama
init(autoreset=True)

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_TOKEN = '7343786423:AAHB-ET104-F1bf_t0FZz6Klf6yL1Q2dnpU'

# Список каналов для проверки подписки
channels = ["@MrROBOTcommunityRUS", "@combohamsterdaiIy"]  # Замените на свои каналы

# Функция проверки подписки на каналы и возврат только тех, на которые не подписан
async def get_unsubscribed_channels(bot, user_id):
    unsubscribed_channels = []
    for channel in channels:
        try:
            member = await bot.get_chat_member(channel, user_id)
            if member.status in ['left', 'kicked']:
                unsubscribed_channels.append(channel)
        except Exception as e:
            logger.error(f"Ошибка при проверке подписки на канал {channel}: {e}")
            unsubscribed_channels.append(channel)
    return unsubscribed_channels

# Функция добавления пользователя в userp.db (если подписан)
async def add_user_to_allowed(user_id):
    async with aiosqlite.connect('userp.db') as db:
        await db.execute('INSERT OR IGNORE INTO allowed_users (user_id) VALUES (?)', (user_id,))
        await db.commit()
    logger.info(f"{Fore.GREEN}Пользователь с ID: {user_id} добавлен в базу данных userp.db.")

# Функция проверки всех пользователей из users.db
async def check_users_and_transfer(bot):
    logger.info("Запуск проверки подписки всех пользователей из users.db...")

    async with aiosqlite.connect('users.db') as users_db:
        async with users_db.execute('SELECT user_id FROM users') as cursor:
            async for row in cursor:
                user_id = row[0]
                unsubscribed_channels = await get_unsubscribed_channels(bot, user_id)
                if not unsubscribed_channels:
                    # Если пользователь подписан на все каналы, переносим его в userp.db
                    await add_user_to_allowed(user_id)
                else:
                    logger.info(f"{Fore.RED}Пользователь с ID: {user_id} не подписан на все каналы и не будет перенесен.")

# Основная функция
async def main():
    bot = Bot(token=API_TOKEN)

    try:
        await check_users_and_transfer(bot)
    finally:
        # Корректное закрытие сессии бота
        await bot.session.close()

if __name__ == '__main__':
    asyncio.run(main())
