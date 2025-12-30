'use client'

import {useState} from 'react';
import Alert from 'react-bootstrap/Alert';

export interface AlertProps {
    variant: "success" | "warning" | "info" | "danger";
    header?: string;
    message: string;
    show: boolean;
}

export function AlertComponent(props: AlertProps) {
    const [show, setShow] = useState(props.show);
    return (
        <>
            { show &&
                <Alert variant={props.variant} onClose={() => setShow(false)} dismissible>
                    {props.header &&
                        <Alert.Heading>{props.header}</Alert.Heading>
                    }
                    <p>
                        {props.message}
                    </p>
                </Alert>
            }
        </>
    );
}