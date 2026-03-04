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

package org.angellock.dolphinconsole.websocket;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.angellock.dolphinconsole.service.BotService;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TerminalWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private BotService botApiService;

    private static final Gson gson = new Gson();
    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private static final Type MAP_TYPE = new TypeToken<Map<String, String>>(){}.getType();

    @Override
    public void afterConnectionEstablished(@NotNull WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        sendMessage(session, Map.of(
                "type", "system",
                "content", "\u001B[32mWelcome to DolphinBot Web Terminal!\u001B[0m\r\nConnected to WebSocket server.\r\nType 'help' for available commands.\r\n"
        ));
    }

    @Override
    protected void handleTextMessage(@NotNull WebSocketSession session, @NotNull TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            Map<String, String> data = gson.fromJson(payload, MAP_TYPE);
            
            String type = data.get("type");
            if ("command".equals(type)) {
                String botName = data.get("botName");
                String command = data.get("command");
                
                if (botName == null || botName.isEmpty()) {
                    sendMessage(session, Map.of(
                            "type", "error",
                            "content", "\u001B[31mError: Bot name is required\u001B[0m\r\n"
                    ));
                    return;
                }
                
                if (command == null || command.isEmpty()) {
                    return;
                }
                
                // Echo the command
                sendMessage(session, Map.of(
                        "type", "output",
                        "content", "\u001B[36m$ " + command + "\u001B[0m\r\n"
                ));
                
                // Send command to bot
                try {
                    boolean success = botApiService.sendCommand(botName, command);
                    if (!success) {
                        sendMessage(session, Map.of(
                                "type", "error",
                                "content", "\u001B[31mFailed to send command to bot '" + botName + "'\u001B[0m\r\n"
                        ));
                    }
                } catch (IOException e) {
                    sendMessage(session, Map.of(
                            "type", "error",
                            "content", "\u001B[31mError: " + e.getMessage() + "\u001B[0m\r\n"
                    ));
                }
            } else if ("resize".equals(type)) {
                // Handle terminal resize if needed
            }
            
        } catch (Exception e) {
            sendMessage(session, Map.of(
                    "type", "error",
                    "content", "\u001B[31mError processing message: " + e.getMessage() + "\u001B[0m\r\n"
            ));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, @NotNull CloseStatus status) throws Exception {
        sessions.remove(session.getId());
    }

    private void sendMessage(WebSocketSession session, Map<String, String> message) throws IOException {
        synchronized (session) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(gson.toJson(message)));
            }
        }
    }

    // Broadcast message to all connected clients
    public void broadcastMessage(Map<String, String> message) {
        String json = gson.toJson(message);
        TextMessage textMessage = new TextMessage(json);
        for (WebSocketSession session : sessions.values()) {
            try {
                synchronized (session) {
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                    }
                }
            } catch (IOException e) {
                // Ignore closed sessions
            }
        }
    }
}
