import React from 'react';
import { Command } from '../../types';

/**
 * Props for the FlowStep component.
 */
interface FlowStepProps {
    cmdId: string;
    index: number;
    command?: Command;
    onRunCommand: (id: string) => void;
    onRunFlowFromHere: (index: number) => void;
}

/**
 * Renders a single step within a flow (command, sleep, or echo).
 * @param props The component props.
 * @returns The rendered FlowStep component.
 */
export const FlowStep: React.FC<FlowStepProps> = ({ cmdId, index, command, onRunCommand, onRunFlowFromHere }) => {
    if (cmdId.startsWith('__sleep:')) {
        const ms = cmdId.replace('__sleep:', '');
        return (
            <div className="flow-step-item flow-step-sleep">
                <span className="flow-step-icon">⏱</span>
                <span className="flow-step-index">{index + 1}.</span>
                <div className="flow-step-details">
                    <span className="flow-step-name">Sleep</span>
                    <span className="flow-step-command">sleep {Number(ms) / 1000}s</span>
                </div>
            </div>
        );
    }

    if (cmdId.startsWith('__echo:')) {
        const text = cmdId.replace('__echo:', '');
        return (
            <div className="flow-step-item">
                <span className="flow-step-icon">💬</span>
                <span className="flow-step-index">{index + 1}.</span>
                <div className="flow-step-details">
                    <span className="flow-step-name">Echo</span>
                    <span className="flow-step-command">echo "{text}"</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flow-step-item">
            <span className="flow-step-icon flow-step-run" title="Run this command" onClick={() => onRunCommand(cmdId)}>▶</span>
            <span className="flow-step-index">{index + 1}.</span>
            <div className="flow-step-details">
                <span className="flow-step-name">{command ? command.title : `Unknown`}</span>
                <span className="flow-step-command">{command ? command.command : cmdId}</span>
            </div>
            <span className="flow-step-run-from-here" title="Run flow from here" onClick={(e) => { e.stopPropagation(); onRunFlowFromHere(index); }}>⬇</span>
        </div>
    );
};
