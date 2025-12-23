// Admin Panel Logic
document.addEventListener('DOMContentLoaded', function() {
    loadPlayersList();
    updateDashboard();
    
    // Auto-refresh every 30 seconds
    setInterval(updateDashboard, 30000);
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById('tab-' + tabName).style.display = 'block';
    
    // Activate selected button
    event.target.classList.add('active');
    
    // Update tab content if needed
    if (tabName === 'players') {
        loadPlayersList();
    }
}

function loadPlayersList() {
    const players = [
        { id: 1, name: "Alex", balance: 1250, games: 42, status: "online" },
        { id: 2, name: "Maria", balance: 890, games: 28, status: "online" },
        { id: 3, name: "John", balance: 2150, games: 67, status: "away" },
        { id: 4, name: "Sofia", balance: 560, games: 15, status: "online" },
        { id: 5, name: "Mike", balance: 3400, games: 92, status: "online" },
        { id: 6, name: "Anna", balance: 1200, games: 31, status: "offline" },
        { id: 7, name: "David", balance: 750, games: 19, status: "online" },
        { id: 8, name: "Elena", balance: 2900, games: 78, status: "online" }
    ];
    
    const container = document.getElementById('admin-players-list');
    container.innerHTML = '';
    
    players.forEach(player => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div>#${player.id}</div>
            <div>
                <strong>${player.name}</strong>
                <div style="font-size: 12px; color: #8e8e93;">ID: ${player.id.toString().padStart(6, '0')}</div>
            </div>
            <div style="color: #34c759; font-weight: bold;">${player.balance.toLocaleString()} TON</div>
            <div>${player.games}</div>
            <div>
                <span class="status-badge ${player.status === 'online' ? 'status-online' : 
                                         player.status === 'away' ? 'status-offline' : 'status-offline'}">
                    ${player.status.toUpperCase()}
                </span>
            </div>
            <div class="action-buttons">
                <button class="btn-small btn-edit" onclick="editPlayerAdmin(${player.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-small btn-delete" onclick="deletePlayer(${player.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        container.appendChild(row);
    });
}

function updateDashboard() {
    // Simulate live updates
    const totalPlayers = document.getElementById('admin-total-players');
    const totalVolume = document.getElementById('admin-total-volume');
    const houseProfit = document.getElementById('admin-house-profit');
    const activeGames = document.getElementById('admin-active-games');
    
    // Add some random fluctuations
    const currentPlayers = parseInt(totalPlayers.textContent.replace(',', ''));
    const currentVolume = parseInt(totalVolume.textContent.replace(',', '').split(' ')[0]);
    const currentProfit = parseInt(houseProfit.textContent.replace(',', '').split(' ')[0]);
    
    totalPlayers.textContent = (currentPlayers + Math.floor(Math.random() * 3)).toLocaleString();
    totalVolume.textContent = (currentVolume + Math.floor(Math.random() * 100)).toLocaleString() + ' TON';
    houseProfit.textContent = (currentProfit + Math.floor(Math.random() * 10)).toLocaleString() + ' TON';
}

function editPlayerAdmin(playerId) {
    const newBalance = prompt('Enter new balance for player #' + playerId + ':');
    if (newBalance !== null && !isNaN(newBalance)) {
        alert(`Player #${playerId} balance updated to ${newBalance} TON`);
        // In real app, you would make API call here
        loadPlayersList(); // Refresh the list
    }
}

function deletePlayer(playerId) {
    if (confirm(`Are you sure you want to delete player #${playerId}? This action cannot be undone.`)) {
        alert(`Player #${playerId} has been deleted`);
        // In real app, you would make API call here
        loadPlayersList(); // Refresh the list
    }
}

function saveGameSettings() {
    alert('Game settings saved successfully!');
    // In real app, you would save to server here
}

function savePlatformSettings() {
    alert('Platform settings saved successfully!');
    // In real app, you would save to server here
}