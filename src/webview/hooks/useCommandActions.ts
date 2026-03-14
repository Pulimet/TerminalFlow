import { Command } from '../types';

interface UseCommandActionsProps {
    scope: 'workspace' | 'user';
    setView: (view: 'list' | 'form') => void;
    setEditingItem: (item: Command | undefined) => void;
    sendMessage: (type: string, payload?: any) => void;
}

export const useCommandActions = ({ scope, setView, setEditingItem, sendMessage }: UseCommandActionsProps) => {
    const handleSave = (data: Command) => {
        if (!data.source) data.source = scope;
        sendMessage('saveCommand', { data });
        setView('list');
        setEditingItem(undefined);
    };

    const handleDelete = (id: string) => {
        sendMessage('deleteCommand', { id });
    };

    const handleMove = (id: string) => {
        const targetSource = scope === 'workspace' ? 'user' : 'workspace';
        sendMessage('moveCommand', { id, targetSource });
    };

    const handleDuplicate = (command: Command) => {
        const duplicatedCommand = {
            ...command,
            id: crypto.randomUUID(),
            title: `${command.title} (copy)`
        };
        sendMessage('saveCommand', { data: duplicatedCommand });
    };

    const handleExport = (id?: string) => {
        sendMessage('exportCommands', { ids: id ? [id] : undefined });
    };

    const handleImport = () => {
        sendMessage('importCommands');
    };

    return { handleSave, handleDelete, handleMove, handleDuplicate, handleExport, handleImport };
};
