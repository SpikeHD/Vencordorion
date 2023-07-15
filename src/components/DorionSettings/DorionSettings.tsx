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

import { Flex } from "@components/Flex";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { downloadSettingsBackup, uploadSettingsBackup } from "@utils/settingsSync";
import { Button, Card, Select, Slider, Text, useEffect, useState } from "@webpack/common";
import { Alerts, Button, Forms, Switch, Tooltip } from "@webpack/common";

import { SettingsTab, wrapTab } from "../VencordSettings/shared";

interface Settings {
  zoom: number,
  client_type: string,
  sys_tray: boolean,
  block_telemetry: boolean,
  push_to_talk: boolean,
  push_to_talk_keys: string[],
  theme: string | null,
}

interface Theme {
  label: string,
  value: string,
}

function DorionSettingsTab() {
  const [state, setState] = useState<Settings>({
    zoom: 100,
    client_type: "stable",
    sys_tray: false,
    block_telemetry: false,
    push_to_talk: false,
    push_to_talk_keys: [],
    theme: null,
  });
  const [themeList, setThemeList] = useState<Theme[]>([]);

  useEffect(() => {
    (async () => {
      const themes = await getThemes();
      setThemeList(themes);
    })();
  }, []);

  const getThemes = async () => {
    // TODO
    return [];
  };

  const handleThemeChange = (value: string) => {
    // TODO
  };

  return (
    <SettingsTab title="Dorion Settings">
      <Forms.FormSection title="Theme" className={Margins.top16}>
        <Select
          options={themeList}
          placeholder={"Select a theme..."}
          maxVisibleItems={5}
          closeOnSelect={true}
          select={handleThemeChange}
          isSelected={v => v === state.theme}
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
    </SettingsTab>
  );
}

export default wrapTab(DorionSettingsTab, "Dorion Settings");
