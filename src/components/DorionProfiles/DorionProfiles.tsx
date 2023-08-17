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

import "./DorionProfiles.css";

import { SettingsTab, wrapTab } from "@components/VencordSettings/shared";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { Button, Forms, React, Select, TextInput, useEffect, useState } from "@webpack/common";

const { invoke, process } = window.__TAURI__;
const cl = (className: string) => classes("dorion-" + className);

function DorionProfilesTab() {
    const [profileList, setProfileList] = useState<string[]>([]);
    const [profile, setProfile] = useState<string>("");
    const [internalProfile, setInternalProfile] = useState<string>("");
    const [newProfile, setNewProfile] = useState<string>("");

    useEffect(() => {
        (async () => {
            const profiles = await invoke("get_profile_list");
            setProfileList(profiles);

            const config = JSON.parse(await invoke("read_config_file"));
            setProfile(config.profile || "default");
            setInternalProfile(config.profile || "default");
        })();
    }, []);

    const saveProfile = async () => {
        const config = JSON.parse(await invoke("read_config_file"));

        config.profile = profile;

        await invoke("write_config_file", {
            contents: JSON.stringify(config)
        });

        // Relaunch
        process.relaunch();
    };

    const deleteProfile = async () => {
        await invoke("delete_profile", {
            name: profile
        });

        // Set profile back to internal profile
        setProfile(internalProfile);
    };

    const createProfile = async () => {
        await invoke("create_profile", {
            name: newProfile
        });

        // if the profile isn't in the state list, add it
        if (!profileList.includes(newProfile)) {
            setProfileList([...profileList, newProfile]);
        }

        // Also set it as the select profile in the list
        setProfile(newProfile);
    };

    const handleNewProfileChange = (value: any) => {
        setNewProfile(value);
    };

    return (
        <SettingsTab title="Profiles">
            <Forms.FormSection title="Select Profile" className={Margins.top16}>
                <Select
                    options={profileList.map((p: string) => {
                        return {
                            label: p,
                            value: p,
                        };
                    })}
                    placeholder={"Select profile..."}
                    maxVisibleItems={5}
                    closeOnSelect={true}
                    select={v => setProfile(v)}
                    isSelected={v => v === profile}
                    serialize={v => String(v)}
                />
            </Forms.FormSection>

            <Forms.FormSection title="Create Profile" className={Margins.top16}>
                <TextInput
                    type="text"
                    value={newProfile}
                    onChange={handleNewProfileChange}
                    placeholder={"Enter a name for the new profile..."}
                />

                <Button
                    onClick={createProfile}
                    className={cl("save-button") + " " + Margins.top16}
                >
                    Create Profile
                </Button>
            </Forms.FormSection>

            <div className={cl("buttons")}>
                <Button
                    onClick={saveProfile}
                    className={cl("save-button") + " " + Margins.top16}
                >
                    Save and Restart
                </Button>

                <Button
                    onClick={deleteProfile}
                    className={cl("delete-button") + " " + Margins.top16}
                    disabled={profile === "default" || internalProfile === profile}
                >
                    Delete Selected Profile
                </Button>
            </div>
        </SettingsTab >
    );
}

export default wrapTab(DorionProfilesTab, "Profiles");
