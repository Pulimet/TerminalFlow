import { useState, useEffect } from 'react';
import { Command, Flow } from '../types';

// Acquire VS Code API
// @ts-ignore
const vscode = acquireVsCodeApi();

export const useExtensionData = () => {
    const [commands, setCommands] = useState<Command[]>([]);
    const [flows, setFlows] = useState<Flow[]>([]);
    const [commandCategoryOrder, setCommandCategoryOrder] = useState<string[]>([]);
    const [flowCategoryOrder, setFlowCategoryOrder] = useState<string[]>([]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.type === 'updateData') {
                setCommands(message.commands);
                setFlows(message.flows);
                setCommandCategoryOrder(message.commandCategoryOrder || []);
                setFlowCategoryOrder(message.flowCategoryOrder || []);
            }
        };

        window.addEventListener('message', handleMessage);
        // @ts-ignore
        vscode.postMessage({ type: 'refresh' });

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const sendMessage = (type: string, payload?: any) => {
        // @ts-ignore
        vscode.postMessage({ type, ...(payload || {}) });
    };

    return {
        commands,
        flows,
        commandCategoryOrder,
        flowCategoryOrder,
        sendMessage
    };
};
