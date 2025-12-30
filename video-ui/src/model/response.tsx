export interface ErrorResponse {
    message: string;
    code: number;
    errors?: never
}

export interface VideoErrorLogResponse {
    id: number;
    message: string;
    transactionId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface VideoResponse {
    id: number;
    transactionId: string;
    isUrl: boolean;
    path: string;
    processType: string;
    status: string;
    startTime: number;
    endTime: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface VideoStatusResponse {
    video: VideoResponse;
    errorLogs: VideoErrorLogResponse[];
}