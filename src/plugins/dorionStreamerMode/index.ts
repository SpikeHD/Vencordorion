/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { FluxDispatcher } from "@webpack/common";

export default definePlugin({
    name: "Dorion Streamer Mode",
    description: "Enable automatic streamer mode functionality",
    authors: [Devs.SpikeHD],
    required: true,

    start: () => {
        window.__TAURI__.event.listen("streamer_mode_toggle", event => {
            const enabled = event.payload;

            FluxDispatcher.dispatch({
                type: "STREAMER_MODE_UPDATE",
                key: "enabled",
                value: enabled
            });
        });
    }
});
