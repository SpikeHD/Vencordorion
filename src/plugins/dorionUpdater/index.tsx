/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Alerts } from "@webpack/common";

export default definePlugin({
    name: "Dorion Updater",
    description: "Enable automatic updates/update notifications for Dorion.",
    authors: [Devs.SpikeHD],
    required: true,

    start: async () => {
        // This returns an array of what to update, if anything.
        const update_check = await window.__TAURI__.invoke("update_check");
        const { autoupdate } = JSON.parse(await window.__TAURI__.invoke("read_config_file"));

        const doUpdate = () => {
            window.__TAURI__.invoke("do_update", {
                toUpdate: update_check,
            });
        };

        console.log(`Dorion things to update: ${update_check}`);

        if (update_check.includes("vencordorion") || update_check.includes("dorion")) {
            // If autoupdate is enabled, just do it, otherwise ask the user.
            if (autoupdate) {
                doUpdate();
                return;
            }

            Alerts.show({
                title: "Updates Available!",
                body: (
                    <>
                        <p>There are Dorion-related updates available. Would you like to apply them?</p>
                    </>
                ),
                confirmText: "Yes please!",
                cancelText: "Nope!",
                onConfirm: () => doUpdate()
            });
        }

        // Listen for update_complete eevent
        window.__TAURI__.event.listen("update_complete", () => {
            Alerts.show({
                title: "Update Complete!",
                body: (
                    <>
                        <p>The update has been applied! Please restart to apply the changes.</p>
                    </>
                ),
                confirmText: "Okay!",
                onConfirm: () => window.__TAURI__.process.relaunch()
            });
        });
    }
});
