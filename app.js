// Основная логика TON Play Clone со скрытой админкой
let adminMode = false;
let clickCount = 0;
let lastClickTime = 0;
let players = [];
let gameStats = {
    totalPlayers: 0,
    totalBets: 0,
    houseProfit: 0,
    activeGames: 4,
    globalLuck: 50,
    commission: 3
};

// Инициализация Telegram Web App
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Получаем данные пользователя
        const user = tg.initDataUnsafe?.user;
        if (user) {
            document.getElementById('username').textContent = user.first_name || 'Player';
            document.getElementById('userId').textContent = user.id.toString().substring(0, 3);
        }
        
        // Устанавливаем главную кнопку
        tg.MainButton.setText("🎮 Play Now");
        tg.MainButton.onClick(() => {
            launchGame('slots');
        });
        tg.MainButton.show();
    }
    
    // Инициализация админ-панели
    initAdminPanel();
    
    // Загружаем демо-игроков
    loadDemoPlayers();
    
    // Обновляем статистику каждые 10 секунд
    setInterval(updateLiveStats, 10000);
    
    // Слушатель для скрытой админ-панели (тройной клик по логотипу)
    document.getElementById('logoClickArea').addEventListener('click', function(e) {
        const currentTime = new Date().getTime();
        if (currentTime - lastClickTime < 500) {
            clickCount++;
            if (clickCount >= 3) {
                toggleAdminPanel();
                clickCount = 0;
            }
        } else {
            clickCount = 1;
        }
        lastClickTime = currentTime;
    });
    
    // Инициализация игр
    initGames();
});

// Админ-функции
function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const toggleBtn = document.getElementById('adminToggle');
    
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-user-secret"></i>';
        toggleBtn.style.background = '#007bff';
    } else {
        panel.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
        toggleBtn.style.background = '#dc3545';
        updateAdminPanel();
    }
}

function initAdminPanel() {
    // Инициализация значений
    document.getElementById('globalLuck').value = gameStats.globalLuck;
    document.getElementById('luckValue').textContent = gameStats.globalLuck + '%';
    document.getElementById('commission').value = gameStats.commission;
}

function updateAdminPanel() {
    // Обновление счетчиков
    document.getElementById('onlineCount').textContent = players.length;
    document.getElementById('totalPlayers').textContent = gameStats.totalPlayers;
    document.getElementById('totalBets').textContent = gameStats.totalBets.toLocaleString();
    document.getElementById('houseProfit').textContent = gameStats.houseProfit.toLocaleString() + ' TON';
    document.getElementById('activeGames').textContent = gameStats.activeGames;
    
    // Обновление списка игроков
    updatePlayersList();
}

function loadDemoPlayers() {
    // Демо-игроки
    players = [
        { id: 1, name: "Alex", balance: 1250, gamesPlayed: 42, status: "online" },
        { id: 2, name: "Maria", balance: 890, gamesPlayed: 28, status: "online" },
        { id: 3, name: "John", balance: 2150, gamesPlayed: 67, status: "away" },
        { id: 4, name: "Sofia", balance: 560, gamesPlayed: 15, status: "online" },
        { id: 5, name: "Mike", balance: 3400, gamesPlayed: 92, status: "online" }
    ];
    
    gameStats.totalPlayers = players.length + 1245; // Демо-число
    gameStats.totalBets = 1245678;
    gameStats.houseProfit = 24567.89;
}

function updatePlayersList() {
    const list = document.getElementById('playersList');
    list.innerHTML = '';
    
    players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.innerHTML = `
            <div>
                <strong>${player.name}</strong>
                <span style="color: var(--text-secondary); font-size: 12px;">#${player.id}</span>
                <div style="font-size: 12px;">${player.status === 'online' ? '🟢 Online' : '🟡 Away'}</div>
            </div>
            <div>
                <div style="font-weight: bold;">${player.balance.toLocaleString()} TON</div>
                <div style="font-size: 12px; color: var(--text-secondary);">${player.gamesPlayed} games</div>
            </div>
            <button onclick="editPlayer(${player.id})" style="background: none; border: 1px solid var(--primary); color: var(--primary); padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                Edit
            </button>
        `;
        list.appendChild(playerItem);
    });
}

function updateGlobalLuck(value) {
    gameStats.globalLuck = parseInt(value);
    document.getElementById('luckValue').textContent = value + '%';
    
    // Применяем "удачу" ко всем играм
    const games = ['dice', 'slots', 'plinko', 'mines'];
    games.forEach(game => {
        const gameCard = document.getElementById('game-' + game);
        if (gameCard) {
            const rtpElement = gameCard.querySelector('.stat:nth-child(2)');
            if (rtpElement) {
                const baseRTP = parseInt(rtpElement.textContent.replace('% RTP', ''));
                const newRTP = Math.min(99, Math.max(85, baseRTP + (value - 50) / 10));
                rtpElement.innerHTML = `<i class="fas fa-bolt"></i> ${newRTP.toFixed(1)}% RTP`;
            }
        }
    });
    
    showNotification(`Global luck set to ${value}%`);
}

function addTonToAll() {
    const amount = parseInt(document.getElementById('addTon').value) || 100;
    
    players.forEach(player => {
        player.balance += amount;
    });
    
    // Обновляем основной баланс
    const mainBalance = document.getElementById('mainBalance');
    const currentBalance = parseFloat(mainBalance.textContent.replace(',', ''));
    mainBalance.textContent = (currentBalance + amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    showNotification(`Added ${amount} TON to all players`);
    updatePlayersList();
}

function updateCommission(value) {
    gameStats.commission = parseInt(value);
    showNotification(`Commission updated to ${value}%`);
}

function toggleGame(gameId, enabled) {
    const gameCard = document.getElementById('game-' + gameId);
    if (gameCard) {
        if (enabled) {
            gameCard.style.opacity = '1';
            gameCard.style.pointerEvents = 'auto';
            gameStats.activeGames++;
        } else {
            gameCard.style.opacity = '0.5';
            gameCard.style.pointerEvents = 'none';
            gameStats.activeGames--;
        }
        document.getElementById('activeGames').textContent = gameStats.activeGames;
        showNotification(`${gameId.charAt(0).toUpperCase() + gameId.slice(1)} ${enabled ? 'enabled' : 'disabled'}`);
    }
}

function simulateNewPlayer() {
    const names = ['Max', 'Anna', 'David', 'Elena', 'Tom', 'Lisa', 'Paul', 'Julia'];
    const name = names[Math.floor(Math.random() * names.length)];
    
    const newPlayer = {
        id: players.length + 1,
        name: name,
        balance: Math.floor(Math.random() * 3000) + 500,
        gamesPlayed: Math.floor(Math.random() * 50),
        status: 'online'
    };
    
    players.push(newPlayer);
    gameStats.totalPlayers++;
    gameStats.totalBets += Math.floor(Math.random() * 1000) + 100;
    gameStats.houseProfit += Math.random() * 100;
    
    showNotification(`New player joined: ${name}`);
    updateAdminPanel();
}

function resetAllStats() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
        gameStats = {
            totalPlayers: 0,
            totalBets: 0,
            houseProfit: 0,
            activeGames: 4,
            globalLuck: 50,
            commission: 3
        };
        
        players = [];
        loadDemoPlayers();
        
        // Сброс игр
        ['game1', 'game2', 'game3', 'game4'].forEach(id => {
            document.getElementById(id).checked = true;
        });
        
        ['dice', 'slots', 'plinko', 'mines'].forEach(gameId => {
            toggleGame(gameId, true);
        });
        
        document.getElementById('globalLuck').value = 50;
        document.getElementById('luckValue').textContent = '50%';
        
        showNotification('All statistics have been reset');
        updateAdminPanel();
    }
}

function exportData() {
    const data = {
        timestamp: new Date().toISOString(),
        statistics: gameStats,
        players: players,
        settings: {
            globalLuck: gameStats.globalLuck,
            commission: gameStats.commission,
            activeGames: gameStats.activeGames
        }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tonplay-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully');
}

function editPlayer(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        const newBalance = prompt(`Edit ${player.name}'s balance:`, player.balance);
        if (newBalance !== null) {
            player.balance = parseInt(newBalance) || player.balance;
            updatePlayersList();
            showNotification(`Updated ${player.name}'s balance to ${player.balance} TON`);
        }
    }
}

// Игровые функции
function initGames() {
    // Инициализация значений RTP на основе удачи
    const games = [
        { id: 'dice', baseRTP: 97 },
        { id: 'slots', baseRTP: 96 },
        { id: 'plinko', baseRTP: 95 },
        { id: 'mines', baseRTP: 98 }
    ];
    
    games.forEach(game => {
        const gameCard = document.getElementById('game-' + game.id);
        if (gameCard) {
            const adjustedRTP = Math.min(99, Math.max(85, game.baseRTP + (gameStats.globalLuck - 50) / 10));
            const rtpElement = gameCard.querySelector('.stat:nth-child(2)');
            if (rtpElement) {
                rtpElement.innerHTML = `<i class="fas fa-bolt"></i> ${adjustedRTP.toFixed(1)}% RTP`;
            }
        }
    });
}

function launchGame(gameId) {
    // Увеличиваем статистику
    gameStats.totalBets++;
    
    // Симуляция выигрыша/проигрыша на основе удачи
    const winChance = (gameStats.globalLuck + 10) / 120; // От 0.5 до 1.0
    const isWin = Math.random() < winChance;
    
    // Обновляем баланс
    const mainBalance = document.getElementById('mainBalance');
    let currentBalance = parseFloat(mainBalance.textContent.replace(',', ''));
    
    if (isWin) {
        const winAmount = Math.floor(Math.random() * 100) + 10;
        currentBalance += winAmount;
        gameStats.houseProfit -= winAmount * (gameStats.commission / 100);
        
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            Telegram.WebApp.showAlert(`You won ${winAmount} TON! 🎉`);
        } else {
            alert(`You won ${winAmount} TON! 🎉`);
        }
    } else {
        const betAmount = Math.floor(Math.random() * 50) + 5;
        currentBalance -= betAmount;
        gameStats.houseProfit += betAmount * (gameStats.commission / 100);
        
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            Telegram.WebApp.showAlert(`You lost ${betAmount} TON. Try again!`);
        }
    }
    
    mainBalance.textContent = currentBalance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Обновляем статистику в админ-панели
    if (document.getElementById('adminPanel').style.display === 'block') {
        updateAdminPanel();
    }
    
    // Симуляция запуска игры
    const gameNames = {
        dice: "Dice Roll",
        slots: "Slot Machine",
        plinko: "Plinko Drop",
        mines: "Minesweeper"
    };
    
    console.log(`Launching ${gameNames[gameId]}...`);
}

function updateLiveStats() {
    // Симуляция живой активности
    if (Math.random() > 0.7) {
        gameStats.totalBets += Math.floor(Math.random() * 100);
        gameStats.houseProfit += Math.random() * 50;
        
        if (Math.random() > 0.9) {
            simulateNewPlayer();
        }
    }
    
    // Обновляем онлайн счетчик случайным образом
    const onlineCount = document.getElementById('onlineCount');
    if (onlineCount) {
        const current = parseInt(onlineCount.textContent);
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, или +1
        onlineCount.textContent = Math.max(1, current + change);
    }
}

function showNotification(message) {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10001;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);