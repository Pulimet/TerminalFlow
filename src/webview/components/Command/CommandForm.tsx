import React, { useState } from 'react';
import { Command } from '../../types';

/**
 * Props for the CommandForm component.
 */
interface CommandFormProps {
    initialCommand?: Command;
    onSave: (command: Command) => void;
    onCancel: () => void;
}

/**
 * Form for creating or editing a command.
 * @param props The component props.
 * @returns The rendered CommandForm component.
 */
export const CommandForm: React.FC<CommandFormProps> = ({ initialCommand, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialCommand?.title || '');
    const [description, setDescription] = useState(initialCommand?.description || '');
    const [category, setCategory] = useState(initialCommand?.category || '');
    const [commandString, setCommandString] = useState(initialCommand?.command || '');
    const [runInNewTerminal, setRunInNewTerminal] = useState(initialCommand?.runInNewTerminal || false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialCommand?.id || crypto.randomUUID(),
            title: title.trim(),
            description: description.trim(),
            category: category.trim() || 'General',
            command: commandString,
            runInNewTerminal,
            source: initialCommand?.source
        });
    };

    return (
        <form className="command-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Build Project" />
            </div>
            <div className="form-group">
                <label>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description..." />
            </div>
            <div className="form-group">
                <label>Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Build, Test, Deploy" />
            </div>
            <div className="form-group">
                <label>Command</label>
                <textarea value={commandString} onChange={e => setCommandString(e.target.value)} required placeholder="npm run build" rows={3} className="code-input" />
            </div>
            <div className="form-group checkbox-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={runInNewTerminal}
                        onChange={e => setRunInNewTerminal(e.target.checked)}
                    />
                    Run in new terminal
                </label>
            </div>
            <div className="form-actions">
                <button type="button" onClick={onCancel}>Cancel</button>
                <button type="submit" className="primary">Save</button>
            </div>
        </form>
    );
};
