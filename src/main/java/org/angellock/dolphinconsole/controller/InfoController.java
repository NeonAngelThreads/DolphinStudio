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

import com.google.gson.Gson;
import okhttp3.OkHttpClient;
import org.angellock.dolphinconsole.DolphinAPIService;
import org.angellock.dolphinconsole.service.BotService;
import org.angellock.dolphinconsole.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/info")
@CrossOrigin("*")
public class InfoController {
    @Autowired
    private PlayerService playerService;

    @GetMapping("/server/players")
    public ResponseEntity<?> getPlayerList(){
        List<Map<String, Object>> playerMap;
        try {
            playerMap = playerService.getPlayers();
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Failed to fetch bots: " + e.getMessage()));
        }
        return ResponseEntity.ok(playerMap);
    }
}
