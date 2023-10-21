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

// ./message1.mp3
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

export default definePlugin({
    name: "SoundChanger",
    authors: [Devs.SpikeHD],
    description: "Change Discord sounds to be your own!",

    patches: [{
        find: "./message1.mp3",
        replacement: [
            // This only runs once, making it a good source for dynamically retrieving all of the sounds the user can change
            {
                match: /var (.{1,2})=(\{.+?\});/g,
                replace: "var $1=$2;$self.registerSoundFilenames($1);",
            },
            {
                match: /(var .{1,2}=.{1,2}\((.{1,2})\));return (.{1,2}\(.{1,2}\))/g,
                replace: "$1;return $self.getSound($2) ?? $3"
            }
        ]
    }],

    registerSoundFilenames: (names: Record<string, number>) => {
        // helper to convert the ./sound_name.mp3 formatted names to camelCase names
        const prettyName = (name: string) => name.replace("./", "").replace(".mp3", "");

        console.log("Register:");
        console.log(names);

        // Dynamically define plugin settings using the file names
        Vencord.Plugins.plugins.SoundChanger.settings = definePluginSettings(
            Object.keys(names).reduce((acc, name) => {
                acc[prettyName(name)] = {
                    type: OptionType.STRING,
                    description: `Sound to play instead of ${prettyName(name)}`,
                    default: "",
                };
                return acc;
            }, {} as Record<string, any>)
        );
    },

    getSound: (name: string) => {
        console.log("Get sound:");
        // If there is a custom sound stored for this, return it. Otherwise, return null.
        console.log(name);
        return null;
    }
});
