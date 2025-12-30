
import {ApiData, doRequest} from "@/src/service/fetcher";

import {ApiConfig} from "@/src/config/config";
import {VideoResponse, VideoStatusResponse} from "@/src/model/response";

export async function uploadVideo(request: BodyInit): Promise<VideoResponse> {
    const endpoint = ApiConfig.VIDEO_BASE_ENDPOINT;
    const headers: Record<string, string> = {
        "Accept": "application/json"
    }

    const apiData: ApiData = {
        method: "POST",
        data: request,
        endpoint: endpoint,
        headers: headers

    }
    return doRequest(apiData)
}

export async function getVideo(transactionId: string): Promise<VideoStatusResponse> {
    const endpoint = `${ApiConfig.VIDEO_BASE_ENDPOINT}/${transactionId}`;
    const apiData: ApiData = {
        method: "GET",
        endpoint: endpoint,
    }
    return doRequest(apiData)
}