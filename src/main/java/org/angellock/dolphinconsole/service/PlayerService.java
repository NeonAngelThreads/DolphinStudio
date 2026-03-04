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

package org.angellock.dolphinconsole.service;

import com.google.gson.Gson;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.angellock.dolphinconsole.DolphinAPIService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class PlayerService extends DolphinAPIService{
    private static final Gson gson = DolphinAPIService.getGson();
    private static final Type type = DolphinAPIService.getType();

    public List<Map<String, Object>> getPlayers() throws IOException {
        Request players = new Request.Builder()
                .url(apiBaseUrl + "/server/players")
                .build();

        try (ResponseBody response = getClient().newCall(players).execute().body()) {
            Map<String, Object> playersMap;
            if (response != null) {
                //log.info(response.string());
                String s =response.string();
                playersMap = gson.fromJson(s, type);
            } else {
                return null;
            }
            return (List<Map<String, Object>>) playersMap.get("data");
        }
    }
}
