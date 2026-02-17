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
    const [scope, setScopeState] = useState<'workspace' | 'user'>('workspace');

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.type === 'updateData') {
                setCommands(message.commands);
                setFlows(message.flows);
                setCommandCategoryOrder(message.commandCategoryOrder || []);
                setFlowCategoryOrder(message.flowCategoryOrder || []);
                if (message.scope) setScopeState(message.scope);
            }
        };

        window.addEventListener('message', handleMessage);
        // @ts-ignore
        vscode.postMessage({ type: 'refresh' });

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const sendMessage = (type: string, payload?: Record<string, unknown>) => {
        // @ts-ignore
        vscode.postMessage({ type, ...(payload || {}) });
    };

    const setScope = (newScope: 'workspace' | 'user') => {
        setScopeState(newScope);
        sendMessage('saveScope', { scope: newScope });
    };

    return {
        commands,
        flows,
        commandCategoryOrder,
        flowCategoryOrder,
        scope,
        setScope,
        sendMessage
    };
};
