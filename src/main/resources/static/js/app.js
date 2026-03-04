/*
 * DolphinStudio - https://github.com/NeonAngelThreads/DolphinStudio
 * Copyright (C) 2025 NeonAngelThreads (https://github.com/NeonAngelThreads)
 *
 *    This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public
 *    License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any
 *    later version.
 *
 *    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 *    implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
 *    License for more details. You should have received a copy of the GNU General Public License along with this
 *    program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * https://space.bilibili.com/386644641
 */

let bots = [];
let currentBot = '';
terminalManager = new TerminalManager();
modalManager = new ModalManager();
notificationManager = new NotificationManager();

function showAlert(title, message, type = 'info') {
    modalManager.show(title, `
        <div class="flex items-start">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle text-red-500' : type === 'success' ? 'check-circle text-green-500' : 'info-circle text-blue-500'} text-xl mr-3 mt-1"></i>
            <p class="text-gray-700">${message}</p>
        </div>
    `, null,"Ok");
}

function showConfirm(title, message, onConfirm, onCancel) {
    modalManager.show(title, `
        <div class="flex items-start">
            <i class="fas fa-question-circle text-blue-500 text-xl mr-3 mt-1"></i>
            <p class="text-gray-700">${message}</p>
        </div>
    `, onConfirm, onCancel);
}

function showAddBotModal() {
    modalManager.show('Add New Bot', `
        <form id="add-bot-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" id="username" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Enter bot username" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="text" id="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" value="default_password" placeholder="Enter bot password" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Server IP</label>
                <input type="text" id="server" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" style="width: 59%; float: left" placeholder="mc.example.com" required>
                <input type="text" id="server-port" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" style="width: 39%; float: right" value="25565" placeholder="Port: 0~65535" >

            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Enable proxy</label>
                <div id="proxy-toggle" class="cursor-pointer h-6 w-10 rounded-full p-1 ring-1 transition duration-200 ease-in-out ring-inset bg-slate-900/10 ring-slate-900/5 ring-black/20" onclick="toggleProxy()">
                    <div id="proxy-toggle-handle" class="size-4 rounded-full bg-white ring-1 shadow-xs ring-slate-700/10 transition duration-200 ease-in-out"></div>
                </div>
                <input type="hidden" id="proxy" value="false">
            </div>

            <section id="proxy-section">

                <label class="block text-sm font-medium text-gray-700 mb-1">Remote proxy server address</label>
                <input type="text" id="proxy-ip" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" style="width: 59%; float: left" placeholder="XX.XXX.XXX.XX" disabled>

                <input type="text" id="proxy-port" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" style="width: 39%; float: right" placeholder="Port: 0~65535" disabled>

                <label class="block text-sm font-medium text-gray-700 mb-1">Proxy mode</label>
                <select id="proxy-mode" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" disabled>
                    <option value="zh">SOCKS4</option>
                    <option value="en">SOCKS5</option>
                </select>
            </section>
        </form>
    `, async () => openCreateBotDialog()
        , "Cancel");
}

function toggleProxy() {
    const toggle = document.getElementById('proxy-toggle');
    const handle = document.getElementById('proxy-toggle-handle');
    const proxyInput = document.getElementById('proxy');
    const proxySection = document.getElementById('proxy-ip');
    const proxyPort = document.getElementById('proxy-port');
    const proxyMode = document.getElementById('proxy-mode');
    
    if (proxyInput.value === 'false') {
        toggle.classList.remove('bg-slate-900/10');
        toggle.classList.add('bg-indigo-600');
        handle.classList.add('translate-x-4');
        proxyInput.value = 'true';
        proxySection.disabled = false;
        proxyPort.disabled = false;
        proxyMode.disabled = false;
    } else {
        toggle.classList.remove('bg-indigo-600');
        toggle.classList.add('bg-slate-900/10');
        handle.classList.remove('translate-x-4');
        proxyInput.value = 'false';
        proxySection.disabled = true;
        proxyPort.disabled = true;
        proxyMode.disabled = true;
    }
}

async function openCreateBotDialog(){
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const server = document.getElementById('server').value;
    const port = document.getElementById('server-port').value || '25565';

    const isEnableProxy = document.getElementById('proxy').value;
    let proxySection;
    let proxyPort;
    let proxyMode;
    if (isEnableProxy === 'true'){
        proxySection = document.getElementById('proxy-ip').value;
        proxyPort = document.getElementById('proxy-port').value;
        proxyMode = document.getElementById('proxy-mode').value;
        if (!proxyMode || !proxyPort || !proxySection) {
            showAlert('Please fill in proxy settings', "error");
            return;
        }
    }

    if (!username || !password || !server) {
        showAlert('Please fill in all required fields', "error");
        return;
    }

    try {
        const res = await fetch(`/api/bots/bot/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: username,
                server: server,
                port: port,
                password: password,
                proxy: document.getElementById('proxy').value === 'true',
                proxyIP: proxySection,
                proxyPort: proxyPort,
                proxyMode: proxyMode,
            })
        });
        const data = await res.json();
        if (data.success){
            notificationManager.success(`Bot "${username}" added successfully!`);
            terminalManager.switchTerminal(name);
            await fetchBots();
        } else {
            notificationManager.error(`Error creating bot "${username}": ${data.message}`);
        }
    } catch (error) {
        notificationManager.error(`Failed to add bot: ${error.message}`);
    }
}

function findCommonPrefix(strings) {
    if (strings.length === 0) return '';
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
        while (strings[i].indexOf(prefix) !== 0) {
            prefix = prefix.substring(0, prefix.length - 1);
            if (prefix === '') break;
        }
    }
    return prefix;
}

async function fetchBots() {
    try {
        const res = await fetch('/api/bots/health');
        const healthData = await res.json();
        
        if (healthData.data.available) {
            document.getElementById('api-status').className = 'flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 bg-green-100';
            document.getElementById('api-status').innerHTML = '<i class="fas fa-circle text-xs mr-2 text-green-500"></i> API Connected';
        } else {
            document.getElementById('api-status').className = 'flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 bg-red-100';
            document.getElementById('api-status').innerHTML = '<i class="fas fa-circle text-xs mr-2 text-red-500"></i> API Disconnected';
            notificationManager.error("API Error: Could not connect to localhost:25560, please make sure DolphinBot client started.")
        }

        const botsRes = await fetch('/api/bots');
        const botsData = await botsRes.json();
        
        if (botsData.success) {
            bots = botsData.data;
            renderBotsTable();
            updateStats();
            terminalManager.updateBots(bots);
            await fetchPlayers();
        }
    } catch (error) {
        console.error('Failed to fetch bots:', error);
        document.getElementById('api-status').className = 'flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 bg-red-100';
        document.getElementById('api-status').innerHTML = '<i class="fas fa-circle text-xs mr-2 text-red-500"></i> API Disconnected';
    }
}

function renderBotsTable() {
    const tbody = document.getElementById('bots-table-body');
    
    if (bots.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-inbox mr-2"></i>
                    No bots found
                </td>
            </tr>
        `;
        return;
    }

    console.log(bots)
    currentBot = bots[0].name;

    tbody.innerHTML = bots.map(bot => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">${bot.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                ${bot.profileName || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bot.isConnected ? 'bg-green-100 bg-green-100' : 'bg-red-100 bg-red-100'}">
                    ${bot.isConnected ? 'Online' : 'Offline'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                ${bot.gameMode || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                ${bot.address}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                ${bot.isConnected ? `X: ${bot.position.x.toFixed(1)}, Y: ${bot.position.y.toFixed(1)}, Z: ${bot.position.z.toFixed(1)}` : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                ${bot.isConnected ? `
                    <button onclick="stopBot('${bot.name}')" class="text-danger p-2 rounded-md hover:bg-gray-200 text-red-500 transition-colors">
                        <i class="fas fa-stop"></i> Stop
                    </button>
                    <button onclick="selectBotForTerminal('${bot.name}')" class="text-sky p-2 rounded-md hover:bg-gray-200 text-sky-500 transition-colors">
                        <i class="fas fa-terminal"></i> Terminal
                    </button>
                    <button onclick="deleteBot('${bot.profileName}')" class="p-2 rounded-md hover:bg-red-300 text-red-200 transition-colors">
                        <i class="fas fa-trash-alt text-gray-600"></i>
                    </button>
                ` : `
                    <button onclick="startBot('${bot.profileName}')" class="text-success p-2 rounded-md hover:bg-gray-200 text-green-500 transition-colors">
                        <i class="fas fa-play"></i> Start
                    </button>
                    <button onclick="deleteBot('${bot.profileName}')" class="p-2 rounded-md hover:bg-red-300 text-red-200 transition-colors">
                        <i class="fas fa-trash-alt text-gray-600"></i>
                    </button>
                `}
            </td>
        </tr>
    `).join('');
}

function deleteBot(name){
    showConfirm("Delete Confirm",`Do you want to delete bot "${name}"?`, async () => {
        try {
            const res = await fetch(`/api/bots/${name}/delete`, { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                notificationManager.success('Bot deleted successfully!');
                onBotRemove(name);
                await fetchBots();
            } else {
                showAlert('Failed to Delete Bot', data.message, 'error');
            }
        } catch (error) {
            showAlert('Error Deleting Bot', error.message, 'error');
        }
    }, "Cancel");

}

function onBotRemove(botName){
    document.getElementById(`terminal-${botName}`).classList.add('hidden');
    document.getElementById(`terminal-${botName}`).remove()
    terminalManager.terminals.delete(botName);
    document.querySelector(`[data-bot-name="${botName}"]`).remove();
    bots = bots.filter(b=>b.botName===botName)
    terminalManager.updateBots(bots);
}

function cropPlayerAvatar(skinUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 8;
            canvas.height = 8;
            
            ctx.drawImage(img, 8, 8, 8, 8, 0, 0, 8, 8);
            
            const displayCanvas = document.createElement('canvas');
            const displayCtx = displayCanvas.getContext('2d');
            displayCanvas.width = 32;
            displayCanvas.height = 32;
            displayCtx.imageSmoothingEnabled = false;
            displayCtx.drawImage(canvas, 0, 0, 8, 8, 0, 0, 32, 32);
            
            resolve(displayCanvas.toDataURL());
        };
        img.onerror = reject;
        img.src = skinUrl;
    });
}

// 根据玩家名称生成0-6的索引，用于选择默认皮肤
function getDefaultSkinIndex(playerName) {
    let hash = 0;
    for (let i = 0; i < playerName.length; i++) {
        const char = playerName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash) % 7; // 取0-6的索引
}

// 获取默认皮肤路径
function getDefaultSkinPath(playerName) {
    const index = getDefaultSkinIndex(playerName);
    const skinFiles = [
        '015b8af09770d2d7.png',
        '069f740e11523d1d.png',
        '1351a035a6921001.png',
        '64cf8da7dac26f7c.png',
        '74a241cff2ecf0fa.png',
        '86d7625ab28b17c3.png',
        'b8c61cf07b087b66.png'
    ];
    return `default_skins/${skinFiles[index]}`;
}

async function fetchPlayers() {
    try {
        const res = await fetch('/api/info/server/players');
        const data = await res.json();
        
        const container = document.getElementById('players-container');
        
        if (data.length === 0) {
            container.innerHTML = `
                <div class="flex items-center justify-center py-12 text-gray-500">
                    <i class="fas fa-user-slash mr-2"></i>
                    No players online
                </div>
            `;
            return;
        }

        document.getElementById("players").innerHTML = `Online Players (${data.length})`
        
        const players = data;
        
        const playerCards = await Promise.all(players.map(async (player) => {
            try {
                // 如果玩家没有皮肤URL，使用默认皮肤
                const skinUrl = player.skin || getDefaultSkinPath(player.name);
                const avatarDataUrl = await cropPlayerAvatar(skinUrl);
                return `
                    <div class="player-card flex items-center p-3 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                        <div class="player-avatar-container relative">
                            <img src="${avatarDataUrl}" alt="${player.name}" class="player-avatar w-8 h-8 image-pixelated transition-all duration-200 hover:scale-125 hover:border-2 hover:border-gray-400 rounded">
                        </div>
                        <span class="ml-3 text-sm font-medium text-gray-900">${player.name}</span>
                    </div>
                `;
            } catch (error) {
                console.error(`Failed to load avatar for ${player.name}:`, error);
                // 失败时也使用默认皮肤
                const defaultSkinPath = getDefaultSkinPath(player.name);
                return `
                    <div class="player-card flex items-center p-3 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                        <div class="player-avatar-container relative">
                            <img src="${defaultSkinPath}" alt="${player.name}" class="player-avatar w-8 h-8 image-pixelated transition-all duration-200 hover:scale-125 hover:border-2 hover:border-gray-400 rounded">
                        </div>
                        <span class="ml-3 text-sm font-medium text-gray-900">${player.name}</span>
                    </div>
                `;
            }
        }));
        
        container.innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                ${playerCards.join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Failed to fetch players:', error);
        const container = document.getElementById('players-container');
        container.innerHTML = `
            <div class="flex items-center justify-center py-12 text-gray-500">
                <i class="fas fa-exclamation-circle mr-2"></i>
                Failed to load players
            </div>
        `;
    }
}

function updateStats() {
    const total = bots.length;
    const online = bots.filter(b => b.isConnected).length;
    const offline = total - online;
    
    document.getElementById('total-bots').textContent = total;
    document.getElementById('offline-bots').textContent = offline;
    
    const percentage = total > 0 ? Math.round((online / total) * 100) : 0;
    document.getElementById('online-percentage').textContent = percentage + '%';
    document.getElementById('online-count').textContent = `${online}/${total}`;
    
    const progressCircle = document.getElementById('online-progress');
    const circumference = 251.2;
    const offset = circumference - (percentage / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;

    if (percentage === 100) {
        progressCircle.setAttribute('stroke', '#00B42A');
    } else if (percentage >= 50) {
        progressCircle.setAttribute('stroke', '#FF7D00');
    } else {
        progressCircle.setAttribute('stroke', '#F53F3F');
    }
}

async function startBot(profileName) {
    try {
        const res = await fetch(`/api/bots/${encodeURIComponent(profileName)}/start`, { method: 'POST' });
        const data = await res.json();
        
        if (data.success) {
            notificationManager.success('Bot started successfully!');
            await fetchBots();
        } else {
            showAlert('Failed to Start Bot', data.message, 'error');
        }
    } catch (error) {
        showAlert('Error Starting Bot', error.message, 'error');
    }
}

async function stopBot(botName) {
    showConfirm('Stop Bot', `Are you sure you want to stop bot "${botName}"?`, async () => {
        try {
            const res = await fetch(`/api/bots/${encodeURIComponent(botName)}/stop`, { method: 'POST' });
            const data = await res.json();
            
            if (data.success) {
                notificationManager.success('Bot stopped successfully!');
                await fetchBots();
            } else {
                showAlert('Failed to Stop Bot', data.message, 'error');
            }
        } catch (error) {
            showAlert('Error Stopping Bot', error.message, 'error');
        }
    }, "Cancel");
}

function selectBotForTerminal(botName) {
    terminalManager.switchTerminal(botName);
}

document.addEventListener('DOMContentLoaded', () => {
    terminalManager.initWebSockets();
    fetchBots();
    fetchPlayers();

    document.getElementById('refresh-btn').addEventListener('click', () => {
        fetchBots();
        fetchPlayers();
    });

    document.getElementById('clear-all-terminals').addEventListener('click', () => {
        terminalManager.clearAllTerminals();
    });

    document.getElementById('add-bot-btn').addEventListener('click', () => {
        showAddBotModal();
    });

    setInterval(fetchBots, 10000);
    terminalManager.handleResize();
});