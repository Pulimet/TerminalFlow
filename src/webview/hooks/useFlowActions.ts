import { Flow } from '../types';

interface UseFlowActionsProps {
    scope: 'workspace' | 'user';
    setView: (view: 'list' | 'form') => void;
    setEditingItem: (item: Flow | undefined) => void;
    sendMessage: (type: string, payload?: any) => void;
}

export const useFlowActions = ({ scope, setView, setEditingItem, sendMessage }: UseFlowActionsProps) => {
    const handleSave = (data: Flow) => {
        if (!data.source) data.source = scope;
        sendMessage('saveFlow', { data });
        setView('list');
        setEditingItem(undefined);
    };

    const handleDelete = (id: string) => sendMessage('deleteFlow', { id });

    const handleMove = (id: string) => {
        const targetSource = scope === 'workspace' ? 'user' : 'workspace';
        sendMessage('moveFlow', { id, targetSource });
    };

    const handleDuplicate = (flow: Flow) => {
        const duplicatedFlow = {
            ...flow,
            id: crypto.randomUUID(),
            title: `${flow.title} (copy)`
        };
        sendMessage('saveFlow', { data: duplicatedFlow });
    };

    const handleExport = (id?: string) => sendMessage('exportFlows', { ids: id ? [id] : undefined });

    const handleImport = () => sendMessage('importFlows');

    return { handleSave, handleDelete, handleMove, handleDuplicate, handleExport, handleImport };
};
