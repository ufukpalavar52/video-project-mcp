'use client'

import {AnimatedDot} from "@/src/component/commont";
import {ReactNode, useState} from "react";
import Head from "next/head";
import { Button, Collapse, Card } from 'react-bootstrap';
import {VideoErrorLogResponse} from "@/src/model/response";

export interface VideoChildProps {
    children: ReactNode
}

export interface VideoDownloadProps {
    downloadLink: string;
    processType: string;
}

export interface RawErrorLogProps {
    logs: VideoErrorLogResponse[];
}

export function VideoProgress() {
    return (
        <>
            <div className="mb-4 text-primary display-4">
                <AnimatedDot />
            </div>
            <h1 className="mb-3 fs-3 fw-bold">Video is Processing</h1>
            <p className="text-muted mb-4">
                This may take a few minutes. Please keep this page open or check back later.
            </p>

            {/* Minimalist Progress Bar */}
            <div className="progress mb-3" style={{ height: '8px' }}>
                <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                    role="progressbar"
                    style={{ width: '100%' }}
                    aria-valuenow={100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                ></div>
            </div>
            <small className="text-muted">Status: Analyzing content...</small>
        </>
    )
}

export function VideoError(props: VideoChildProps) {
    return (
        <>
            <div className="mb-4 text-danger display-4">
                x
            </div>
            <h1 className="mb-3 fs-3 fw-bold">An error occurred</h1>
            <p className="text-muted mb-4">
                {props.children}
            </p>
        </>
    )
}

export function VideoDownload(props: VideoDownloadProps) {
    return (
        <>
            <div className="mb-4 text-success display-4">
                ✓
            </div>
            <h1 className="mb-3 fs-3 fw-bold">{props.processType} Ready for Download</h1>
            <p className="text-muted mb-4">
                Your video has been successfully processed and is ready to be accessed.
            </p>
            <a
                href={props.downloadLink}
                download
                className="btn btn-primary w-100 fw-bold"
            >
                Download {props.processType}
            </a>
        </>
    )
}

export function VideoMainPage(props: VideoChildProps) {
    return (
        <>
            <Head>
                <title>Video Status</title>
                <meta name="description" content="Check the status of your video processing job." />
            </Head>
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <div className="container" style={{ maxWidth: '500px' }}>
                    <div className="p-4 p-md-5 bg-white border rounded-3 text-center">
                        <a href={"/"} className="d-flex align-items-start justify-content-start">Back</a>
                        {props.children}
                    </div>
                </div>
            </div>
        </>
    )
}

export function RawErrorLog(props: RawErrorLogProps){

    const logs = props.logs.sort((a, b) => {
        return b.id - a.id;
    })
    const [open, setOpen] = useState(false);

    return (
        <div className="mt-3">
            <Button
                onClick={() => setOpen(!open)}
                variant="outline-danger"
                className="w-100 mb-2 d-flex justify-content-between align-items-center shadow-sm"
            >
        <span>
          <i className="bi bi-terminal me-2"></i>
            {logs.length} Logs {open ? 'Hide' : 'Show'}
        </span>
                <span style={{ fontSize: '0.8rem' }}>{open ? '▲' : '▼'}</span>
            </Button>
            <Collapse in={open}>
                <div id="raw-log-panel">
                    <Card className="bg-dark border-0 shadow-lg">
                        <Card.Body className="p-0">
                            <div
                                style={{
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    backgroundColor: '#1e1e1e', // VS Code tarzı koyu gri
                                    padding: '1rem',
                                    borderRadius: '4px'
                                }}
                            >
                                {logs.map((log, index) => (
                                    <div key={index} className="mb-2 border-bottom border-secondary pb-2 last-child-noborder">
                                        <div className="d-flex text-secondary mb-1" style={{ fontSize: '0.7rem' }}>
                                            <span className="me-2 text-warning">[{index + 1}]</span>
                                            <span>{String(log.createdAt)} - LOG ENTRY</span>
                                        </div>
                                        <code style={{
                                            color: '#ce9178',
                                            fontSize: '0.85rem',
                                            wordBreak: 'break-all',
                                            display: 'block'
                                        }}>
                                            {log.message}
                                        </code>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </Collapse>
        </div>
    );
};