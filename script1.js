document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем инициализацию Telegram Web App SDK
    if (window.Telegram && window.Telegram.WebApp) {
        // Получаем userId из Telegram Web App
        const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id;
        const name = window.Telegram.WebApp.initDataUnsafe?.user?.first_name;

        console.log("User ID from Telegram:", userId, name); // Выводим userId в консоль для отладки

        // Проверка наличия userId
        if (!userId) {
            console.log("User ID not found, redirecting to bot...");
            window.location.replace("https://t.me/MrROBOT_helper_bot");
            return;
        }
        
        // Найдите элемент с id 'keyCountLabel'
        let keyCountLabel = document.getElementById('keyCountLabel');

        // Измените текстовое содержимое элемента
        keyCountLabel.innerHTML = `Knock, knock, ${name}`;

        // Загрузка базы данных
        const response = await fetch('https://neo19867.github.io/Keys003/userp.db'); // Убедитесь, что путь правильный
        if (!response.ok) {
            console.log("Failed to load database, redirecting to bot...");
            window.location.replace("https://t.me/MrROBOT_helper_bot");
            return;
        }

        const buffer = await response.arrayBuffer();

        // Подключение к базе данных SQLite
        const SQL = await initSqlJs({locateFile: file => `https://neo19867.github.io/Keys003/sql-wasm.wasm`});

        const db = new SQL.Database(new Uint8Array(buffer));

        // Проверка userId в базе данных
        const stmt = db.prepare("SELECT COUNT(*) AS count FROM allowed_users WHERE user_id = ?");
        stmt.bind([String(userId)]);

        let isAllowed = false;
        while (stmt.step()) {
            const row = stmt.getAsObject();
            isAllowed = row.count > 0;
        }
        stmt.free();
        
        if (isAllowed) {
            console.log("User is allowed, enabling11 ...");
            blackScreen.style.display = 'none';
        }    else {
                document.getElementById('blackScreen').classList.remove('hidden');
                console.log("User is not allowed, enabling1 ...");
            initGame();
            
        }
    } 

    function initGame() {
        // Ваша логика игры, которая активируется для разрешенных пользователей
        console.log('Game features initialized');
    }
});