# Конфигурационный файл config.py

BOTS = {
    'bot1': {
        'TOKEN': '7343786423:AAHB-ET104-F1bf_t0FZz6Klf6yL1Q2dnpU',
        'DB_FILE': 'users_bot1.db',
        'LOG_FILE': 'bot1_actions.log',
        'CHANNELS': ['@MrROBOTcommunityRUS', '@combohamsterdaiIy','@hamster_free_key','@cryptomigos'],
    }
}

ADMIN_BOT = {
    'TOKEN': '7074777948:AAEHVneqEm798vcNlHLnXFCE5N95e0u66yw',
    'LOG_FILE': 'admin_bot_actions.log'
}

API_ID = '25896410'
API_HASH = 'a836b3e117ab8e14b068b90654039cd5'

KEYS_FILES = {
    'Bike': 'KeysBike.txt',
    'Train': 'KeysTrain.txt',
    'Clone': 'KeysClone.txt',
    'Chain': 'KeysChain.txt',
    'Merge': 'KeysMerge.txt',
    'Race': 'KeysRace.txt',
    'MudRacing': 'KeysMudracing.txt',
    'Mom': 'KeysMom.txt',
    'Polysphere': 'KeysPolysphere.txt'
}

INTERVAL_MINUTES = 5
DROP_PENDING_UPDATES = True  # True = не обробатывает тухляк

MESSAGES = {
    'START_MESSAGE': "🐹 Привет, CEO. Получай ключи ко всем играм без лимита!\n🐹 Hello, CEO. Get keys to all games without limit!",
    'WAIT_MESSAGE': "🐹Пожалуйста, подождите, пока обрабатывается ваш запрос.",
    'ALREADY_REQUESTED_MESSAGE': "🐹Вы уже запросили ключи для этой игры сегодня. Попробуйте снова через {hours} часов и {minutes} минут.",
    'ALL_MESSAGES_SENT': "🐹Все коды для этой игры закончились. Попробуйте повторить запрос через 10 минут.",
    'SUBSCRIBE_MESSAGE': "🐹Для получения ключей необходимо подписаться на следующие каналы:",
    'SOON_MESSAGE': "🐹Если вам не хватает дневного лимита то вы можете приобрести свой собственный софт для фарма ключей в виде EXE файла - программы для Windows. Подробности: @irathai2024",
    'SUBSCRIBE_BUTTON_TEXT': "🐹Подписаться",
    'TIME_MESSAGE': "🐹Вы сможете получить ключи для '{game}' через {hours} часов и {minutes} минут.",
    'READY_NOW_MESSAGE': "🐹Вы можете получить ключи прямо сейчас!",
    'ERROR_MESSAGE': "🐹Произошла ошибка: {error}",
    'CHANNELS_MESSAGE': "🐹Убедитесь, что вы подписаны на следующие каналы:\n{channels}",
    'STALE_REQUEST_MESSAGE': "🐹Ваш запрос устарел. Пожалуйста, попробуйте снова."
}

BUTTONS = {
    'Bike': "🚴 Bike🐹",
    'Train': "🚂 Train🐹",
    'Clone': "👯 Clone🐹",
    'Chain': "⛓️ Chain🐹",
    'Merge': "🔀 Merge🐹",
    'Race': "🏁Race🐹",
    'Polysphere': '🌀 Polysphere',
    'MudRacing': '🏎 MUDRACING',
    'Mom': "👩‍👧‍👦 MOM",
    'Soon..': "💻 Софт🐹",
    'Time': "🕒🔥🔥Время до следующего запроса🔥🔥🕒",
    'Keys': "🔥🔥Keys🔥🔥"
}

ADMINS = [290044142]
