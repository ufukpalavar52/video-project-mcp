'use client'

import {useEffect, useState} from "react";
import {getVideo} from "@/src/service/api";
import {VideoErrorLogResponse, VideoResponse} from "@/src/model/response";
import {ApiConfig, VideoProcessType, VideoStatus} from "@/src/config/config";
import {RawErrorLog, VideoDownload, VideoError, VideoMainPage, VideoProgress} from "@/src/component/video-process";

export interface VideoProcessProps {
    transactionId: string;
}

export interface VideoProps {
    loading: boolean;
    video: VideoResponse | undefined;
    logs: VideoErrorLogResponse[]
}

export function VideoProcessPage(props: VideoProcessProps) {
    const pollingInterval = 5000

    const [video, setVideo] = useState<VideoResponse>();
    const [errorLogs, setErrorLogs] = useState<VideoErrorLogResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);


    useEffect(() => {
        const transactionId = props.transactionId;
        if (!transactionId) {
            return
        }
        const completeStatuses = [VideoStatus.SUCCESS, VideoStatus.ERROR]

        const fetchData = async () => {
            try {
                const response = await getVideo(transactionId);
                setVideo(response.video);
                setErrorLogs(response.errorLogs);
                setLoading(true);
                return response;
            } catch (error) {
                setLoading(true);
                throw error;
            }
        }

        const checkStatus = (response: VideoResponse) => {
            if (completeStatuses.indexOf(response.status) > -1) {
                clearInterval(intervalId);
            }
        }

        const intervalId = setInterval(async () => {
            const response = await fetchData();
            checkStatus(response.video);
        }, pollingInterval);

        fetchData().then((res) => {
            checkStatus(res.video);
        });

        return () => {
            clearInterval(intervalId);
        }

    }, [props]);

    return (
        <VideoProcessPageHelper video={video} loading={loading} logs={errorLogs} />
    )
}

export function VideoProcessPageHelper(props: VideoProps) {
    if (props.loading && !props.video) {
        return (
            <VideoMainPage>
                <VideoError>
                    <code>Video not found.</code>
                </VideoError>
            </VideoMainPage>
        )
    }

    if (props.video?.status === VideoStatus.ERROR) {
        return (
            <>
                <VideoMainPage>
                    <VideoError>
                        <code>An error occurred while converting the video to a {props.video.processType}.</code>
                    </VideoError>
                    <RawErrorLog logs={props.logs}></RawErrorLog>
                </VideoMainPage>
            </>
        )
    }

    const processType = props.video?.processType === VideoProcessType.GIF ? "GIF" : "Video";
    const isVideoProcessed = props.video?.status === VideoStatus.SUCCESS
    const downloadLink = ApiConfig.DOWNLOAD_URL.replace("{transactionId}", String(props.video?.transactionId))
    return (
        <VideoMainPage>
            { isVideoProcessed ?
                <VideoDownload downloadLink={downloadLink} processType={processType}/>
                :
                <VideoProgress />
            }
        </VideoMainPage>
    );
}