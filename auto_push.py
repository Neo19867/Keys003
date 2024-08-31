import subprocess
import os
from datetime import datetime
import time

# Определите путь к вашему проекту
project_path = "D:/GIT/Keys003"

# Переходите в директорию проекта
os.chdir(project_path)

def commit_and_push():
    try:
        # Выполните команду git add
        subprocess.run(["git", "add", "."], check=True)
        
        # Выполните команду git commit с текущей датой и временем
        commit_message = f"Auto-commit: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        
        # Выполните команду git push
        subprocess.run(["git", "push", "origin", "main"], check=True)
        
        print("Changes committed and pushed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"An error occurred: {e}")

# Бесконечный цикл для проверки изменений каждые 10 секунд
while True:
    commit_and_push()
    time.sleep(40)  # Интервал в 10 секунд
