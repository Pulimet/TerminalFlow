import { useState, useEffect } from 'react';
import { Command, Flow } from '../types';

// Acquire VS Code API
// @ts-ignore
const vscode = acquireVsCodeApi();

export const useExtensionData = () => {
    const [commands, setCommands] = useState<Command[]>([]);
    const [flows, setFlows] = useState<Flow[]>([]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.type === 'updateData') {
                setCommands(message.commands);
                setFlows(message.flows);
            }
        };

        window.addEventListener('message', handleMessage);
        vscode.postMessage({ type: 'refresh' });

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const sendMessage = (type: string, payload?: any) => {
        vscode.postMessage({ type, ...(payload || {}) });
    };

    return {
        commands,
        flows,
        sendMessage
    };
};
