
export interface VideoRequest {
    file?: File | null;
    url?: string;
    startTime: number;
    endTime: number;
    processType: string;
}