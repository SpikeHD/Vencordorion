/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "Dorion Link Fix",
    description: "Fixes weird link behavior in Dorion.",
    authors: [Devs.SpikeHD],
    required: true,

    patches: [
        {
            find: "[\"onClick\",\"trusted\",",
            replacement: [
                {
                    match: /target:"_blank"/,
                    replace: "target:$self.maybeRemoveTargets(e.href)"
                }
            ]
        },
        {
            find: "[\"href\",\"onClick\",",
            replacement: [
                {
                    match: /;(.{1,2}).target="_blank"/,
                    replace: ";$1.target=$self.maybeRemoveTargets($1.href)"
                }
            ]
        }
    ],

    maybeRemoveTargets: (url: string) => {
        if (!url) return "_blank";

        return url.startsWith("https://discord.com/channels/") ? "_self" : "_blank";
    }
});
