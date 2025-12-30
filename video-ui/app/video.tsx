'use client'

import TimePicker from "react-time-picker";
import {VideoRequest} from "@/src/model/request";
import {secondsToTimeStr, timeStrToSeconds} from "@/src/helper/helper";
import React, {useRef, useState} from "react";
import {ApiConfig, VideoProcessType} from "@/src/config/config";
import {uploadVideo} from "@/src/service/api";
import { useRouter } from 'next/navigation';
import {AlertComponent} from "@/src/component/alert";

import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

export function VideoFormPage() {
    const defaultData: VideoRequest = {
        endTime: 0,
        url: "",
        processType: VideoProcessType.GIF,
        startTime: 0,
    }


    const [data, setData] = useState(defaultData);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>();
    const router = useRouter();
    const [alertMessage, setAlertMessage] = useState("");

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setAlertMessage("")
        const newErrors: { [key: string]: string } = {};
        if (!data.url && !data.file) {
            newErrors.file = "Video file or url not found.";
        }

        if (!data.processType) {
            newErrors.processType = "Invalid process type.";
        }

        if (!data.processType) {
            newErrors.processType = "Invalid process type.";
        }

        if (data.startTime == null || data.startTime < 0) {
            newErrors.startTime = "Invalid start time.";

        }
        if (data.endTime == null || data.endTime < 0 || data.endTime <= data.startTime) {
            newErrors.endTime = "Invalid end time.";
        }

        if (data.processType == VideoProcessType.GIF && data.endTime - data.startTime > ApiConfig.GIF_START_END_TIME_RANGE) {
            newErrors.endTime = "Invalid time range.";
        }

        if (data.processType == VideoProcessType.CUT && data.endTime - data.startTime > ApiConfig.CUT_START_END_TIME_RANGE) {
            newErrors.endTime = "Invalid time range.";
        }

        console.log("Starting request", newErrors);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const formBody = new FormData(e.currentTarget);
        formBody.set("startTime", String(data.startTime));
        formBody.set("endTime", String(data.endTime));

        uploadVideo(formBody).then((res) => {
            console.log("Routing....");
            router.push(`?transactionId=${res.transactionId}`);
        }).catch((err) => {
            setAlertMessage(err.message)
        })

    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        if (e.target instanceof HTMLSelectElement) {
            const {id, value} = e.target;
            setData(prev => ({
                ...prev,
                [id]: value,
            }));
            setErrors(prev => ({...prev, [id]: ""}));
            return;
        }

        const {id, value, type, files} = e.target;
        if (id === 'videoFile' && type === "file" && files) {
            setData(prev => ({
                ...prev,
                file: files[0] || null,
                url: '',
            }));
            setErrors(prev => ({...prev, file: ""}));
        }

        if (id === 'videoUrl') {
            setData(prev => ({
                ...prev,
                url: value,
                file: null,
            }));
            setErrors(prev => ({...prev, file: ""}));
        }
    }

    const handleTime = (value: string | null, id: string) => {
        setData(prev => ({
            ...prev,
            [id]: timeStrToSeconds(String(value)),
        }));
        setErrors(prev => ({...prev, [id]: ""}));
    }

    const clearSelection = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setData(prev => ({
            ...prev,
            file: null,
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-8">
                        {alertMessage &&
                            <AlertComponent variant="danger" show={true} message={alertMessage} header="An error occurred." />
                        }
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold text-dark">🎥 Video Processor Tool</h2>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="processType" className="form-label fw-bold">Process Type</label>
                                        <select className={`form-control ${errors?.processType ? 'is-invalid' : ''}`} name="processType" id="processType"
                                                onChange={handleChange} value={data.processType}>
                                            <option value="GIF">Video To GIF</option>
                                            <option value="CUT">Cut The Video</option>
                                        </select>
                                        {errors?.processType && <div className="text-danger small mt-2">{errors.processType}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="videoFile" className="w-100 position-relative">
                                            <div
                                                className={`border-2 border-dashed rounded-4 p-5 text-center transition-all ${
                                                    data.file ? 'border-success bg-success bg-opacity-10' : 'border-primary bg-primary bg-opacity-10'
                                                }`}
                                                style={{ cursor: 'pointer', borderStyle: 'dashed', transition: '0.3s' }}
                                            >
                                                {/* Remove Button */}
                                                {data.file && (
                                                    <button
                                                        onClick={clearSelection}
                                                        className="btn btn-sm btn-dark position-absolute top-0 end-0 m-3 rounded-circle"
                                                        style={{ zIndex: 10, width: '32px', height: '32px', padding: '0', lineHeight: '1' }}
                                                        title="Remove file"
                                                        type="button"
                                                    >
                                                        ✕
                                                    </button>
                                                )}

                                                <div className="mb-3">
                                                    {data.file ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-check2-circle text-success" viewBox="0 0 16 16">
                                                            <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z"/>
                                                            <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z"/>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-cloud-arrow-up text-primary" viewBox="0 0 16 16">
                                                            <path fillRule="evenodd" d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2z"/>
                                                            <path fillRule="evenodd" d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 9.127 15 7.773c0-1.146-.933-2.087-2.042-2.087a.5.5 0 0 1-.459-.301A4.53 4.53 0 0 0 8 1c-2.125 0-3.956 1.39-4.633 3.212a.5.5 0 0 1-.61.33A3.487 3.487 0 0 0 0 7.891C0 9.837 1.625 11 3.484 11H6a.5.5 0 0 1 0 1H3.484C1.508 12 0 10.395 0 8.243c0-1.74 1.353-3.134 3.123-3.414A5.526 5.526 0 0 1 4.406 1.342z"/>
                                                        </svg>
                                                    )}
                                                </div>

                                                <h5 className={`fw-bold ${data.file ? 'text-success' : ''} ${errors?.file ? 'text-danger' : ''}`}>
                                                    {data.file ? 'Ready to Upload!' : 'Drag & drop video here'}
                                                </h5>

                                                <p className="small text-secondary mb-0">
                                                    {data.file ? (
                                                        <span className="badge bg-dark p-2 mt-2">{data.file.name}</span>
                                                    ) : (
                                                        'or click to browse files'
                                                    )}
                                                </p>

                                                <input
                                                    type="file"
                                                    name="file"
                                                    id="videoFile"
                                                    ref={fileInputRef}
                                                    className="d-none"
                                                    accept="video/*"
                                                    onChange={handleChange}
                                                    disabled={!!data.url}
                                                />

                                            </div>
                                        </label>
                                        {errors?.file && <div className="text-danger small mt-2">{errors.file}</div>}
                                    </div>
                                    <div className="text-center my-3">
                                        <span className="badge bg-secondary">OR</span>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="videoUrl"
                                               className="form-label fw-semibold text-secondary small uppercase">Video
                                            Url</label>
                                        <input type="text" name="url" id="videoUrl"
                                               className={`form-control form-control-lg rounded-3 fs-6 ${errors?.file ? 'is-invalid' : ''}`}
                                               placeholder="E.g.: https://www.youtube.com/watch?v=..."
                                               value={data.url}
                                               onChange={handleChange} disabled={!!data.file}/>
                                        <div className="invalid-feedback">{errors?.file}</div>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="startTime" className="form-label fw-bold">Start Time</label>
                                            <TimePicker
                                                format="HH:mm:ss"
                                                disableClock={true}
                                                maxDetail="second"
                                                clearIcon={null}
                                                className={`form-control ${errors?.startTime ? 'is-invalid' : ''}`}
                                                id="startTime"
                                                name="startTime"
                                                onChange={(value) => handleTime(value, "startTime")}
                                                value={secondsToTimeStr(data.startTime)}
                                                required
                                            />
                                            <div className="form-text">The second where the video trimming should
                                                start.
                                            </div>
                                            <div className="invalid-feedback">{errors?.starTime}</div>
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="endTime" className="form-label fw-bold">End Time</label>
                                            <TimePicker
                                                format="HH:mm:ss"
                                                disableClock={true}
                                                maxDetail="second"
                                                clearIcon={null}
                                                className={`form-control ${errors?.endTime ? 'is-invalid' : ''}`}
                                                id="endTime"
                                                name="endTime"
                                                onChange={(value) => handleTime(value, "endTime")}
                                                value={secondsToTimeStr(data.endTime)}
                                                required
                                            />
                                            <div className="form-text">The second where the video trimming should end.</div>
                                            <div className="invalid-feedback">{errors?.endTime}</div>
                                        </div>
                                    </div>

                                    <br/>
                                    <button type="submit"
                                            className="btn btn-primary btn-lg w-100 rounded-3 fw-bold py-3 shadow-sm transition">
                                        Start Process
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
