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

class TerminalManager {
    constructor() {
        this.terminals = new Map();
        this.activeBot = '';
        this.ws = null;
        this.logWs = null;
        this.bots = [];
        const isMobile = window.innerWidth < 768;
        
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleResize() {
        this.terminals.forEach((terminal) => {
            if (terminal.name === this.activeBot){
                terminal.fitAddon.fit();
            }
       });
    }

    initWebSockets() {
        this.connectCommandWebSocket();
        this.connectLogWebSocket();
    }

    connectCommandWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/terminal`;

        console.log("Terminal url opened at: " + wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            document.getElementById('ws-status').className = 'flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 bg-green-100';
            document.getElementById('ws-status').innerHTML = '<i class="fas fa-circle text-xs mr-1 text-green-500"></i> WS Connected';
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onclose = () => {
            document.getElementById('ws-status').className = 'flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 bg-red-800';
            document.getElementById('ws-status').innerHTML = '<i class="fas fa-circle text-xs mr-1 text-red-500"></i> WS Disconnected';
            
            setTimeout(() => this.connectCommandWebSocket(), 3000);
        };

        this.handleResize()
    }

    connectLogWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const apiHost = window.location.hostname;
        const logWsUrl = `${protocol}//${apiHost}:25561`;
        
        this.logWs = new WebSocket(logWsUrl);

        this.logWs.onopen = () => {
            console.log('Log WebSocket connected');
        };

        this.logWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            let terminal;
            if (data.type === 'log') {
                const targetBot = data.target;
                if (targetBot !== '') {
                    terminal = this.terminals.get(targetBot);
                    terminal.term.write('\x1b[2K\r');
                    terminal.term.write(data.content.replaceAll('\n', '\r\n'));
                }else {
                    for (let value of this.terminals.values()) {
                        value.term.write('\x1b[2K\r');
                        value.term.write(data.content.replaceAll('\n', '\r\n'));
                    }
                }
                terminal.term.write(terminal.placeholder + terminal.command);
            } else if (data.type === 'completion') {
                const activeTerminal = this.terminals.get(this.activeBot);
                if (activeTerminal) {
                    this.handleCompletion(activeTerminal, data);
                }
            }
        };

        this.logWs.onerror = (error) => {
            console.error('Log WebSocket error:', error);
        };

        this.logWs.onclose = () => {
            console.log('Log WebSocket disconnected, reconnecting...');
            setTimeout(() => this.connectLogWebSocket(), 3000);
        };
    }

    handleCompletion(terminal, data) {
        const candidates = data.candidates;
        if (candidates && candidates.length > 0) {
            if (candidates.length === 1) {
                const input = data.input;
                const commonPrefix = this.findCommonPrefix(candidates);
                if (commonPrefix.length > input.length) {
                    terminal.term.write('\x1b[2K\r' + terminal.placeholder);
                    terminal.command = commonPrefix;
                    terminal.term.write(commonPrefix);
                }
            } else {
                terminal.term.write('\e[1F');
                terminal.term.write('\r\n' + candidates.join('  ') + '\r\n');
                terminal.term.write(terminal.placeholder + terminal.command);
            }
        }
    }

    findCommonPrefix(strings) {
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

    createTerminal(botName) {
        if (this.terminals.has(botName)) {
            return this.terminals.get(botName);
        }

        const container = document.createElement('div');
        container.id = `terminal-${botName}`;
        container.className = 'w-full h-[600px]';
        document.getElementById('terminal-container').appendChild(container);

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: '"Cascadia Code", Menlo, monospace',
            lineHeight: 1.2,
            cols: 120,
            windowWidth: container.clientWidth,
            theme: {
                background: '#1D2129',
                foreground: '#FFFFFF',
                cursor: '#FFFFFF',
                selection: '#44475A',
                black: '#000000',
                red: '#a80000',
                green: '#00a42d',
                yellow: '#fda01e',
                blue: '#0f43b4',
                magenta: '#ab0064',
                cyan: '#00917c',
                white: '#BFBFBF',
                brightBlack: '#4D4D4D',
                brightRed: '#ff443b',
                brightGreen: '#00ff53',
                brightYellow: '#f6ff6c',
                brightBlue: '#3fa0ff',
                brightMagenta: '#ff55b7',
                brightCyan: '#59e3ff',
                brightWhite: '#E6E6E6'
            }
        });

        term.width = container.clientWidth;

        const fitAddon = new FitAddon.FitAddon();
        term.loadAddon(fitAddon);
        
        const webLinksAddon = new WebLinksAddon.WebLinksAddon();
        term.loadAddon(webLinksAddon);

        term.open(container);
        fitAddon.fit();

        const placeholder = `${botName}> `;
        const terminalInfo = {
            term: term,
            fitAddon: fitAddon,
            command: '',
            placeholder: placeholder,
            name: botName
        };

        term.onKey(({ key, domEvent }) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
            
            if (domEvent.key === 'Enter') {
                this.ws.send(JSON.stringify({
                    type: 'command',
                    botName: botName,
                    command: terminalInfo.command.trim()
                }));
                console.log(`Command sent to ${botName}: ${terminalInfo.command}`);
                term.write('\x1b[2K\r');
                term.write(placeholder);
                terminalInfo.command = '';
            } else if (domEvent.key === 'Tab') {
                domEvent.preventDefault();
                const cursor = term.buffer.active.cursorX - placeholder.length;
                
                if (this.logWs && this.logWs.readyState === WebSocket.OPEN) {
                    this.logWs.send(JSON.stringify({
                        type: 'complete',
                        input: terminalInfo.command,
                        cursor: cursor
                    }));
                }
            }
        });

        term.onData(e => {
            switch (e) {
                case '\u0003':
                    term.write('^C');
                    term.write('\r\n' + placeholder);
                    terminalInfo.command = '';
                    break;
                case '\r':
                    terminalInfo.command = '';
                    break;
                case '\u007F':
                    if (terminalInfo.command.length > 0 || term._core.buffer.x > placeholder.length) {
                        term.write('\b \b');
                        if (terminalInfo.command.length > 0) {
                            terminalInfo.command = terminalInfo.command.slice(0, terminalInfo.command.length - 1);
                        }
                    }
                    break;
                default:
                    if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
                        terminalInfo.command += e;
                        term.write(e);
                    }
                    console.log(term._core.buffer)
            }
            this.handleResize();
        });

        term.writeln(`\x1b[32mConnected to Dolphin terminal, player: ${botName}\x1b[0m`);
        term.write(placeholder);

        this.terminals.set(botName, terminalInfo);

        this.createTerminalTab(botName);

        return terminalInfo;
    }

    createTerminalTab(botName) {
        const tabsContainer = document.getElementById('terminal-tabs');
        
        const tab = document.createElement('button');
        tab.className = 'px-4 py-2 text-sm font-medium rounded-t-md focus:outline-none';
        tab.textContent = botName;
        tab.dataset.botName = botName;
        
        tab.addEventListener('click', () => {
            this.switchTerminal(botName);
        });

        tabsContainer.appendChild(tab);
    }

    switchTerminal(botName) {
        if (!this.terminals.has(botName)) {
            this.createTerminal(botName);
        }

        this.terminals.forEach((terminal, name) => {
            document.getElementById(`terminal-${name}`).classList.add('hidden');
            const tab = document.querySelector(`[data-bot-name="${name}"]`);
            if (tab) {
                tab.className = 'px-4 py-2 text-sm font-medium rounded-t-md focus:outline-none';
            }
        });

        document.getElementById(`terminal-${botName}`).classList.remove('hidden');
        const activeTab = document.querySelector(`[data-bot-name="${botName}"]`);
        if (activeTab) {
            activeTab.className = 'px-4 py-2 text-sm font-medium rounded-t-md bg-white border border-gray-200 border-b-0 focus:outline-none';
        }

        this.activeBot = botName;
    }

    updateBots(botsList) {
        this.bots = botsList;

        this.terminals.keys()

        botsList.forEach(bot => {
            this.createTerminal(bot.name);
        });

        if (!this.activeBot && botsList.length > 0) {
            this.switchTerminal(botsList[0].name);
        }
    }

    clearAllTerminals() {
        this.terminals.forEach((terminal, botName) => {
            terminal.term.clear();
            terminal.term.write(terminal.placeholder);
        });
    }
}