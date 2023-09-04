/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
// import { FluxDispatcher } from "@webpack/common";

export default definePlugin({
    name: "Dorion Notifications",
    description: "Enable notification functionality for Dorion",
    authors: [Devs.SpikeHD],
    required: true,

    patches: [
        {
            find: "requestPermission:function",
            replacement: [{
                match: /requestPermission:function\((.{1,2})\){.+?},/,
                replace: "requestPermission:function($1) { $1(true) },",
            }]
        }
    ]
});
