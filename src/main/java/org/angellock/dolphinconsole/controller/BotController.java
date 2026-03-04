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

package org.angellock.dolphinconsole.controller;

import org.angellock.dolphinconsole.service.BotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bots")
@CrossOrigin(origins = "*")
public class BotController {

    @Autowired
    private BotService botApiService;

    @GetMapping
    public ResponseEntity<?> getBots() {
        try {
            List<Map<String, Object>> bots = botApiService.getBots();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", bots
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch bots: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{botName}/start")
    public ResponseEntity<?> startBot(@PathVariable String botName) {
        try {
            boolean success = botApiService.startBot(botName);
            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Bot started successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Failed to start bot"
                ));
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to start bot: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{botName}/stop")
    public ResponseEntity<?> stopBot(@PathVariable String botName) {
        try {
            boolean success = botApiService.stopBot(botName);
            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Bot stopped successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Failed to stop bot"
                ));
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to stop bot: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/bot/create")
    public ResponseEntity<?> createBot(@RequestBody Map<String, String> request) {
        try {
            if (this.botApiService.createBot(request)) {
                return ResponseEntity.status(200).body(Map.of(
                        "success", true
                ));
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to create bot: " + e.getMessage()
            ));
        }
        return ResponseEntity.status(400).body(Map.of(
                "success", false
        ));
    }

    @PostMapping("/{botName}/delete")
    public ResponseEntity<?> deleteBot(@PathVariable String botName){
        try {
            if (this.botApiService.deleteBot(botName)) {
                return ResponseEntity.status(200).body(Map.of(
                        "success", true
                ));
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to create bot: " + e.getMessage()
            ));
        }
        return ResponseEntity.status(400).body(Map.of(
                "success", false
        ));
    }

    @PostMapping("/{botName}/command")
    public ResponseEntity<?> sendCommand(@PathVariable String botName, @RequestBody Map<String, String> request) {
        String command = request.get("command");
        if (command == null || command.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Command is required"
            ));
        }
        try {
            boolean success = botApiService.sendCommand(botName, command);
            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Command sent successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Failed to send command"
                ));
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to send command: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> checkHealth() {
        boolean available = botApiService.isApiAvailable();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("available", available)
        ));
    }
}
