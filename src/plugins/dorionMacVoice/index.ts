import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

import { UserStore, FluxDispatcher } from "@webpack/common";

export default definePlugin({
    name: "Dorion MacOS Voice Support",
    description: "Enable voice support on MacOS for Dorion.",
    authors: [Devs.SpikeHD],
    required: true,

    patches: [
        {
            find: "getMediaEngine=",
            replacement: [
                {
                    match: /getMediaEngine=function\(\)\{return (.{1,2})\}/,
                    replace: 'getMediaEngine=function(){console.log($1);return $1}'
                }
            ]
        },
        {
            find: "WebRTC is not supported on",
            replacement: [
                {
                    match: /.{1,2}\.info\("WebRTC is not supported on",.{1,2}\(\)\.name,.{1,2}\(\)\.version\);return.{1,2}/g,
                    replace: "console.log('WebRTC forcefully supported >:)');return true;"
                }
            ]
        }
    ],

    start: () => {
        // Trick Discord into thinking getMediaEngine() exists
        // @ts-ignore
        return;
    }
});
