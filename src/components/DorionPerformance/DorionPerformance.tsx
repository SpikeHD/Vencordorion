/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { SettingsTab, wrapTab } from "@components/VencordSettings/shared";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { Button, Forms, React, showToast, Switch, useEffect, useState } from "@webpack/common";

const { invoke, process, dialog } = window.__TAURI__;

interface Settings {
    cache_css: boolean,
    streamer_mode_detection: boolean,
    rpc_server: boolean,
}

const cl = (className: string) => classes("dorion-" + className);

function DorionSettingsTab() {
    const [state, setState] = useState<Settings>({
        cache_css: false,
        streamer_mode_detection: false,
        rpc_server: false,
    });

    useEffect(() => {
        (async () => {
            const settings = await invoke("read_config_file");
            const defaultConf = await invoke("default_config");

            try {
                setState(JSON.parse(settings));
            } catch (e) {
                setState(JSON.parse(defaultConf));
            }
        })();
    }, []);

    const saveSettings = async () => {
        await invoke("write_config_file", {
            contents: JSON.stringify(state),
        });

        process.relaunch();
    };

    const clearCSSCache = async () => {
        await invoke("clear_css_cache");
        showToast("Cleared CSS cache");
    };

    const clearWebCache = async () => {
        const doClear = await dialog.confirm(
            "Are you sure you want to clear the web cache? This will log you out and close Dorion.",
            "Clear Web Cache",
        );

        if (doClear) await invoke("set_clear_cache");
    };

    return (
        <SettingsTab title="Dorion Performance Settings">
            <Forms.FormSection title="Cache" className={Margins.top16}>
                <Switch
                    value={state.cache_css}
                    onChange={v => setState({
                        ...state,
                        cache_css: v,
                    })}
                    note="Save CSS to disk that would otherwise be loaded from the web, decreasing load times."
                >
                    Cache CSS
                </Switch>
            </Forms.FormSection>

            <Forms.FormSection title="Optional Features" className={Margins.top16}>
                <Switch
                    value={state.streamer_mode_detection}
                    onChange={v => setState({
                        ...state,
                        streamer_mode_detection: v,
                    })}
                    note="Detect OBS and Streamlabs OBS and automatically enable streamer mode when they are running."
                >
                    Streamer Mode detection
                </Switch>

                {/* Adding this now so I don't have to do it later */}
                <Switch
                    value={state.rpc_server}
                    onChange={v => setState({
                        ...state,
                        rpc_server: v,
                    })}
                    tooltipNote="This is a work in progress, and won't do EVERYTHING arRPC does quite yet."
                    note="Enable the integrated RPC server, eliminating the need for a separate arRPC server running. Remember to enable the arRPC plugin!"
                >
                    Integrated rich presence server
                </Switch>
            </Forms.FormSection>

            <div className={cl("buttons")}>
                <Button
                    onClick={saveSettings}
                    className={cl("save-button") + " " + Margins.top16}
                >
                    Save and Restart
                </Button>

                <Button
                    onClick={clearWebCache}
                    className={cl("clear-cache-button") + " " + Margins.top16}
                >
                    Clear Web/UserData Cache
                </Button>

                <Button
                    onClick={clearCSSCache}
                    className={cl("clear-cache-button") + " " + Margins.top16}
                >
                    Clear CSS Cache
                </Button>
            </div>
        </SettingsTab >
    );
}

export default wrapTab(DorionSettingsTab, "Dorion Settings");
