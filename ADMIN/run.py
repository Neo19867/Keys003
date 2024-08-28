import multiprocessing
import sys
import time
from bot import start_bot
import config

def run_bot(bot_name):
    try:
        bot_config = config.BOTS[bot_name]
        start_bot(bot_config)
    except Exception as e:
        print(f"Ошибка в процессе {bot_name}: {e}", file=sys.stderr)

if __name__ == "__main__":
    multiprocessing.set_start_method('spawn')
    
    while True: 
        processes = []
       
        for bot_name in config.BOTS.keys():
            p = multiprocessing.Process(target=run_bot, args=(bot_name,))
            p.start()
            processes.append(p)

        time.sleep(10 * 60)

        for p in processes:
            p.terminate()
            p.join()

        print("Перезапуск ботов...")
