import React, { useState } from 'react';

interface Command {
    id: string;
    title: string;
    description: string;
    category: string;
    command: string;
}

interface Props {
    initialCommand?: Command;
    onSave: (command: Command) => void;
    onCancel: () => void;
}

export const CommandForm: React.FC<Props> = ({ initialCommand, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialCommand?.title || '');
    const [description, setDescription] = useState(initialCommand?.description || '');
    const [category, setCategory] = useState(initialCommand?.category || '');
    const [commandString, setCommandString] = useState(initialCommand?.command || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newCommand: Command = {
            id: initialCommand?.id || crypto.randomUUID(),
            title,
            description,
            category: category || 'General',
            command: commandString
        };

        onSave(newCommand);
    };

    return (
        <form className="command-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Build Project"
                />
            </div>

            <div className="form-group">
                <label>Description</label>
                <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Short description..."
                />
            </div>

            <div className="form-group">
                <label>Category</label>
                <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Build, Test, Deploy"
                />
            </div>

            <div className="form-group">
                <label>Command</label>
                <textarea
                    value={commandString}
                    onChange={e => setCommandString(e.target.value)}
                    required
                    placeholder="npm run build"
                    rows={3}
                    className="code-input"
                />
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel}>Cancel</button>
                <button type="submit" className="primary">Save</button>
            </div>
        </form>
    );
};
