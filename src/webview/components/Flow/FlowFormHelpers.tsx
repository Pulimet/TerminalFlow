import React from 'react';

/**
 * Props for the SleepAdder component.
 */
interface SleepAdderProps {
    sleepMs: string;
    setSleepMs: (ms: string) => void;
    onAdd: () => void;
}

/**
 * Component for adding a sleep step to a flow.
 * @param props The component props.
 * @returns The rendered SleepAdder component.
 */
export const SleepAdder: React.FC<SleepAdderProps> = ({ sleepMs, setSleepMs, onAdd }) => (
    <div className="sleep-adder">
        <h4>Built-in: Sleep</h4>
        <div className="sleep-controls">
            <input type="number" min="100" step="100" value={sleepMs} onChange={e => setSleepMs(e.target.value)} placeholder="ms" className="sleep-input" />
            <span className="sleep-unit">ms</span>
            <button type="button" className="sleep-add-btn" onClick={onAdd}>+ Add Sleep</button>
        </div>
    </div>
);

/**
 * Props for the EchoAdder component.
 */
interface EchoAdderProps {
    echoText: string;
    setEchoText: (text: string) => void;
    onAdd: () => void;
}

/**
 * Component for adding an echo step to a flow.
 * @param props The component props.
 * @returns The rendered EchoAdder component.
 */
export const EchoAdder: React.FC<EchoAdderProps> = ({ echoText, setEchoText, onAdd }) => (
    <div className="echo-adder">
        <h4>Built-in: Echo</h4>
        <div className="echo-controls">
            <input type="text" value={echoText} onChange={e => setEchoText(e.target.value)} placeholder="Message to echo..." className="echo-input" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }} />
            <button type="button" className="echo-add-btn" onClick={onAdd}>+ Add Echo</button>
        </div>
    </div>
);
