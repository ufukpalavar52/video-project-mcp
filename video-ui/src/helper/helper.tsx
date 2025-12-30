import React from "react";

export type allType = React.JSX.Element | null | undefined | string | number | boolean | never;

export type buildQueryType = string|null|number|Array<string|null|number>

export function timeStrToSeconds(time: string) {
    const [h, m, s] = time.split(":").map(Number);
    return h * 3600 + m * 60 + s;
}

export function secondsToTimeStr(second: number) {
    const h = Math.trunc(second / 3600);
    const v = second % 3600;
    const m = Math.trunc(v / 60);
    const s = v % 60;

    return `${h > 9 ? h : `0${h}`}:${m > 9 ? m : `0${m}`}:${s > 9 ? s : `0${s}`}`;
}

export const httpBuildQuery = (url: string, params: Record<string, buildQueryType>) => {
    const paramList:string[] = [];

    for (const key in params) {
        if (!Array.isArray(params[key])) {
            paramList.push(`${key}=${params[key]}`);
            continue;
        }

        for (const i in params[key]) {
            const value = params[key][i];
            paramList.push(`${key}[]=${value}`)
        }
    }

    if (paramList.length == 0) {
        return url;
    }

    return `${url}?${paramList.join('&')}`;
}