/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "Dorion Updater",
    description: "Enable automatic updates/update notifications for Dorion.",
    authors: [Devs.SpikeHD],
    required: true,

    start: async () => {
        // This returns an array of what to update, if anything.
        const update_check = await window.__TAURI__.invoke("update_check");
        const { autoupdate } = JSON.parse(await window.__TAURI__.invoke("read_config_file"));

        console.log(`Dorion things to update: ${update_check}`);

        if (update_check.includes("vencordorion") || update_check.includes("dorion")) {
            const updateConfirm = autoupdate || await window.__TAURI__.dialog.confirm(
                "There are updates to Dorion available. Would you like to update?\n\nYou can enable auto-updates in Dorion settings.",
            );

            if (updateConfirm) {
                await window.__TAURI__.invoke("do_update", {
                    toUpdate: update_check,
                });
            }
        }
    }
});
