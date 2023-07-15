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

import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { Button, Card, Forms, Select, Slider, Switch, Text, useEffect, useState, React } from "@webpack/common";

import { SettingsTab, wrapTab } from "../VencordSettings/shared";

import "./DorionSettings.css";

const { invoke, process } = window.__TAURI__;

interface Settings {
  zoom: number,
  client_type: string,
  sys_tray: boolean,
  block_telemetry: boolean,
  push_to_talk: boolean,
  push_to_talk_keys: string[],
  theme: string,
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
    zoom: 100,
    client_type: "stable",
    sys_tray: false,
    block_telemetry: false,
    push_to_talk: false,
    push_to_talk_keys: [],
    theme: "none",
  });
  const [themeList, setThemeList] = useState<Theme[]>([]);
  const [pluginList, setPluginList] = useState<Plugin[]>([]);

  useEffect(() => {
    (async () => {
      const themes = await getThemes();
      const plugins = await getPlugins();
      setThemeList(themes);
      setPluginList(plugins);
    })();
  }, []);

  const getThemes = async () => {
    const themes = await invoke('get_theme_names');
    return themes.map((t: string) => (
      {
        label: t.replace(/"/g, '').replace('.css', '').replace('.theme', ''),
        value: t.replace(/"/g, ''),
      }
    ));
  };

  const getPlugins = async () => {
    const plugins = await invoke('get_plugin_list');

    return plugins;
  };

  const openPluginsFolder = () => {
    invoke('open_plugins');
  };

  const openThemesFolder = () => {
    invoke('open_themes');
  };

  const saveSettings = async () => {
    await invoke('write_config_file', {
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
          select={(v) => setState(prev => {
            prev.theme = v;
            return prev;
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
          select={(v) => setState(prev => {
            prev.client_type = v;
            return prev;
          })}
          isSelected={v => (!state.client_type && v === 'default') || v === state.client_type}
          serialize={v => String(v)}
        />
      </Forms.FormSection>

      <Forms.FormSection title="Zoom Level" className={Margins.top16}>
        <Slider
          markers={[50, 75, 100, 125]}
          minValue={0}
          maxValue={125}
          initialValue={state.zoom}
          onValueChange={v => setState(prev => {
            prev.zoom = v;
            return prev;
          })}
          onValueRender={v => v + "%"}
          onMarkerRender={v => v + "%"}
          stickToMarkers={true}
        />
      </Forms.FormSection>

      <Forms.FormSection title="Misc." className={Margins.top16}>
        <Switch
          value={state.sys_tray}
          onChange={v => setState(prev => {
            prev.sys_tray = v;
            return prev;
          })}
        >
          Minimize to System Tray
        </Switch>

        <Switch
          value={state.block_telemetry}
          onChange={v => setState(prev => {
            prev.sys_tray = v;
            return prev;
          })}
        >
          Block Discord Telemetry
        </Switch>
      </Forms.FormSection>

      <Forms.FormSection title="Folders" className={Margins.top16}>
        <Card className={cl("folders")}>
          <div>
            <Text variant="text-md/normal" className={Margins.left16}>
              Plugins Folder
            </Text>

            <div className={cl('folder-icon')}>
              <img src="https://via.placeholder.com/16x16" alt="Folder Icon" onClick={openThemesFolder} />
            </div>
          </div>

          <div>
            <Text variant="text-md/normal" className={Margins.left16}>
              Themes Folder
            </Text>

            <div className={cl('folder-icon')}>
              <img src="https://via.placeholder.com/16x16" alt="Folder Icon" onClick={openThemesFolder} />
            </div>
          </div>
        </Card>
      </Forms.FormSection>

      <Forms.FormSection title="Plugins" className={Margins.top16}>
        <Card className={cl("plugins")}>
          {
            pluginList.map(plugin => (
              <div key={plugin.name} className={cl('plugin-row')}>
                <div className={'main-cell'}>
                  <Text variant="text-md/normal" className={Margins.left16}>
                    {plugin.name}
                  </Text>
                </div>

                <div className={'switch-cell'}>
                  <Switch
                    value={!plugin.disabled}
                    onChange={v => {
                      // TODO
                    }}
                    style={{
                      flexDirection: 'column-reverse',
                    }}
                  />
                </div>

                <div className={'switch-cell'}>
                  <Switch
                    value={plugin.preload}
                    onChange={v => {
                      // TODO
                    }}
                    style={{
                      flexDirection: 'column-reverse',
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
        className={cl("save-button") + ' ' + Margins.top16}
      >
        Save and Restart
      </Button>
    </SettingsTab >
  );
}

export default wrapTab(DorionSettingsTab, "Dorion Settings");
