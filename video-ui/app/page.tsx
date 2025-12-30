'use client'

import {VideoFormPage} from "@/app/video";
import {useSearchParams} from "next/navigation";
import {VideoProcessPage} from "@/app/video-process";
import {Suspense} from "react";

export default function Home() {
    return (
        <Suspense>
            <VideoPage />
        </Suspense>
    )
}

export function VideoPage() {
    const searchParams = useSearchParams();
    const transactionId = searchParams.get("transactionId");
    return (
        transactionId ?
            <VideoProcessPage transactionId={transactionId}/>
            :
            <VideoFormPage/>
    );
}
