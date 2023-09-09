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

import "./DorionSettings.css";

import { SettingsTab, wrapTab } from "@components/VencordSettings/shared";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { Button, Card, Forms, React, Select, Slider, Switch, Text, useEffect, useState } from "@webpack/common";

const { invoke, process, dialog } = window.__TAURI__;

interface Settings {
    zoom: number | string,
    client_type: string,
    sys_tray: boolean,
    block_telemetry: boolean,
    push_to_talk: boolean,
    push_to_talk_keys: string[],
    theme: string,
    use_native_titlebar: boolean,
    start_maximized: boolean,
}

interface Theme {
    label: string,
    value: string,
}

interface Plugin {
    name: string,
    preload: boolean,
    disabled: boolean,
}

const cl = (className: string) => classes("dorion-" + className);

function DorionSettingsTab() {
    const [state, setState] = useState<Settings>({
        zoom: "1.0",
        client_type: "default",
        sys_tray: false,
        block_telemetry: false,
        push_to_talk: false,
        push_to_talk_keys: [],
        theme: "none",
        use_native_titlebar: false,
        start_maximized: false,
    });
    const [themeList, setThemeList] = useState<Theme[]>([]);
    const [pluginList, setPluginList] = useState<Plugin[]>([]);

    useEffect(() => {
        (async () => {
            const themes = await getThemes();
            const plugins = await getPlugins();
            const settings = await invoke("read_config_file");

            themes.push({
                label: "None",
                value: "none",
            });

            setThemeList(themes);
            setPluginList(plugins);
            setState(JSON.parse(settings));
        })();
    }, []);

    const getThemes = async () => {
        const themes = await invoke("get_theme_names");
        return themes.map((t: string) => (
            {
                label: t.replace(/"/g, "").replace(".css", "").replace(".theme", ""),
                value: t.replace(/"/g, ""),
            }
        ));
    };

    const getPlugins = async () => {
        const plugins = await invoke("get_plugin_list");

        return plugins;
    };

    const openPluginsFolder = () => {
        invoke("open_plugins");
    };

    const openThemesFolder = () => {
        invoke("open_themes");
    };

    const saveSettings = async () => {
        await invoke("write_config_file", {
            contents: JSON.stringify(state),
        });

        process.relaunch();
    };

    return (
        <SettingsTab title="Dorion Settings">
            <Forms.FormSection title="Theme" className={Margins.top16}>
                <Select
                    options={themeList}
                    placeholder={"Select a theme..."}
                    maxVisibleItems={5}
                    closeOnSelect={true}
                    select={v => setState({
                        ...state,
                        theme: v,
                    })}
                    isSelected={v => v === state.theme}
                    serialize={v => String(v)}
                />
            </Forms.FormSection>

            <Forms.FormSection title="Client Type" className={Margins.top16}>
                <Select
                    options={[
                        {
                            label: "Default",
                            value: "default",
                        },
                        {
                            label: "Canary",
                            value: "canary",
                        },
                        {
                            label: "PTB",
                            value: "ptb",
                        }
                    ]}
                    placeholder={"Select a client type..."}
                    maxVisibleItems={5}
                    closeOnSelect={true}
                    select={v => setState({
                        ...state,
                        client_type: v,
                    })}
                    isSelected={v => (!state.client_type && v === "default") || v === state.client_type}
                    serialize={v => String(v)}
                />
            </Forms.FormSection>

            <Forms.FormSection title="Window" className={Margins.top16 + " " + Margins.bottom16}>
                <Slider
                    className={Margins.top16 + " " + Margins.bottom16}
                    markers={
                        // Create an array with number from 50-125 with a step of 5
                        Array.from(Array(16).keys()).map(i => i * 5 + 50)
                    }
                    minValue={50}
                    maxValue={125}
                    initialValue={(typeof state.zoom === "string" ? parseFloat(state.zoom) : state.zoom) * 100}
                    onValueChange={v => {
                        setState({
                            ...state,
                            zoom: "" + (v / 100),
                        });

                        // Also change the zoom level LIVE (wow!)
                        invoke("change_zoom", {
                            zoom: v / 100,
                        });
                    }}
                    onValueRender={v => v + "%"}
                    onMarkerRender={v => v + "%"}
                    stickToMarkers={true}
                />

                <Switch
                    value={state.sys_tray}
                    onChange={v => setState({
                        ...state,
                        sys_tray: v,
                    })}
                    note="Instead of closing, Dorion will run in the background and will be accessible via the system tray."
                >
                    Minimize to System Tray
                </Switch>


                <Switch
                    value={state.start_maximized}
                    onChange={v => setState({
                        ...state,
                        start_maximized: v,
                    })}
                >
                    Start Maximized
                </Switch>
            </Forms.FormSection>

            <Forms.FormSection title="Misc." className={Margins.top16}>
                <Switch
                    value={state.block_telemetry}
                    onChange={v => setState({
                        ...state,
                        block_telemetry: v,
                    })}
                >
                    Block Discord Telemetry
                </Switch>

                <Switch
                    value={state.use_native_titlebar}
                    onChange={v => setState({
                        ...state,
                        use_native_titlebar: v,
                    })}
                    note="Disable the custom titlebar and use your systems native one instead."
                >
                    Use Native Titlebar
                </Switch>
            </Forms.FormSection>

            <Forms.FormSection title="Folders" className={Margins.top16}>
                <Card className={cl("folders")}>
                    <div>
                        <Text variant="text-md/normal" className={Margins.left16}>
                            Plugins Folder
                        </Text>

                        <div className={cl("folder-icon")} onClick={openPluginsFolder}>
                            <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20 7H12L10.553 5.106C10.214 4.428 9.521 4 8.764 4H3C2.447 4 2 4.447 2 5V19C2 20.104 2.895 21 4 21H20C21.104 21 22 20.104 22 19V9C22 7.896 21.104 7 20 7Z"></path></svg>
                        </div>
                    </div>

                    <div>
                        <Text variant="text-md/normal" className={Margins.left16}>
                            Themes Folder
                        </Text>

                        <div className={cl("folder-icon")} onClick={openThemesFolder}>
                            <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20 7H12L10.553 5.106C10.214 4.428 9.521 4 8.764 4H3C2.447 4 2 4.447 2 5V19C2 20.104 2.895 21 4 21H20C21.104 21 22 20.104 22 19V9C22 7.896 21.104 7 20 7Z"></path></svg>
                        </div>
                    </div>
                </Card>
            </Forms.FormSection>

            <Forms.FormSection title="Plugins" className={Margins.top16}>
                <Card className={cl("plugins")}>
                    <div className={cl("plugin-header ") + cl("plugin-row" + " " + Margins.top16)}>
                        <div className={"main-cell"}>
                            <Text variant="text-md/bold" className={Margins.left16}>
                                Plugin Name
                            </Text>
                        </div>

                        <div className={"switch-cell"}>
                            <Text variant="text-md/bold" className={Margins.left16}>
                                Enabled?
                            </Text>
                        </div>

                        <div className={"switch-cell"}>
                            <Text variant="text-md/bold" className={Margins.left16}>
                                Preload?
                            </Text>
                        </div>
                    </div>

                    {
                        pluginList.map(plugin => (
                            <div key={plugin.name} className={cl("plugin-row")}>
                                <div className={"main-cell"}>
                                    <Text variant="text-md/normal" className={Margins.left16}>
                                        {plugin.name}
                                    </Text>
                                </div>

                                <div className={"switch-cell"}>
                                    <Switch
                                        value={!plugin.disabled}
                                        onChange={v => {
                                            invoke("toggle_plugin", {
                                                name: plugin.name
                                            });

                                            setPluginList(pluginList.map(p => {
                                                if (p.name === plugin.name) {
                                                    p.disabled = !p.disabled;
                                                }

                                                return p;
                                            }));
                                        }}
                                        style={{
                                            flexDirection: "column-reverse",
                                        }}
                                    />
                                </div>

                                <div className={"switch-cell"}>
                                    <Switch
                                        value={plugin.preload}
                                        onChange={v => {
                                            invoke("toggle_preload", {
                                                name: plugin.name
                                            });

                                            setPluginList(pluginList.map(p => {
                                                if (p.name === plugin.name) {
                                                    p.preload = !p.preload;
                                                }

                                                return p;
                                            }));
                                        }}
                                        style={{
                                            flexDirection: "column-reverse",
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    }
                </Card>
            </Forms.FormSection>

            <Button
                onClick={saveSettings}
                className={cl("save-button") + " " + Margins.top16}
            >
                Save and Restart
            </Button>
        </SettingsTab >
    );
}

export default wrapTab(DorionSettingsTab, "Dorion Settings");
