/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

const discordDomains = [
    "discord.com",
    "discord.com",
    "discord.gg",
    "discord.com",
    "discordapp.com",
    "discord.media",
    "discordapp.net",
    "discordcdn.com",
    "discord.dev",
    "discord.new",
    "discord.gift",
    "discordstatus.com",
    "dis.gd",
    "discord.co",
    "discordstatus.com",
];

export default definePlugin({
    name: "Dorion Link Fix",
    description: "Fixes weird link behavior in Dorion.",
    authors: [Devs.SpikeHD],
    required: true,

    patches: [
        {
            // Hidden/masked links
            find: "[\"onClick\",\"trusted\",",
            replacement: [
                {
                    match: /target:"_blank"/,
                    replace: "target:$self.maybeRemoveTargets(e.href, e.trusted)"
                }
            ]
        },
        {
            // Normal links, including various "normal" links rendered within the Discord UI
            find: "[\"href\",\"onClick\",",
            replacement: [
                {
                    match: /;(.{1,2}).target="_blank"/,
                    replace: ";$1.target=$self.maybeRemoveTargets($1.href, null, e.className, e.title)"
                }
            ]
        },
        {
            // When I find a better way to do this, I will do it
            find: "r.isTrustedDomain=function(e){",
            replacement: [
                {
                    match: /;(.{1,2})\.isTrustedDomain=(.+?);/,
                    replace: ";$1.isTrustedDomain=$2;window.isTrustedDomain=$2;"
                }
            ]
        },
        {
            // Component buttons
            find: "().component",
            replacement: [
                {
                    match: /;(.{1,2})=.{1,2}\?function\(\){.+?};/,
                    replace: ";$1=function(){ window.open(e.url) };"
                }
            ]
        }
    ],

    maybeRemoveTargets: (url: string, isTrusted, className, title) => {
        if (!url) return "_blank";
        if (url.match(/^https?:\/\/(?:www\.)?(?:ptb\.|canary\.)?discord\.com\/channels\//)) return "_self";

        // If it's a discord-owned domain, automatically make _blank
        if (discordDomains.some(d => url.split(/\/\/(?:www\.|ptb\.|canary\.)?/)[1].startsWith(d))) return "_blank";

        // This is a regular link, not a hidden one
        if (!isTrusted) {
            isTrusted = () => {
                // If classname isn't null, this is definitely a regular Discord UI link of some sort
                if (className) return true;

                // If the title is a link, it's also "trusted" because it should be a naked link
                if (title) {
                    try {
                        new URL(title.split("(")[0]);
                        return true;
                    } catch (e) { }
                }

                return window.isTrustedDomain(url);
            };
        }

        return !isTrusted() ? "_self" : "_blank";
    }
});
