import React from 'react';
import { Command } from '../../types';
import { SequenceBuilder } from './SequenceBuilder';
import { FlowCommandPicker } from './FlowCommandPicker';

/**
 * Props for the FlowBuilder component.
 */
interface FlowBuilderProps {
    seq: string[];
    setSeq: React.Dispatch<React.SetStateAction<string[]>>;
    availableCommands: Command[];
}

/**
 * Component for building detailed flow sequences.
 * @param props The component props.
 * @returns The rendered FlowBuilder component.
 */
export const FlowBuilder: React.FC<FlowBuilderProps> = ({ seq, setSeq, availableCommands }) => {
    const moveItem = (i: number, up: boolean) => {
        const swap = up ? i - 1 : i + 1;
        if (swap < 0 || swap >= seq.length) return;
        const nSeq = [...seq]; [nSeq[swap], nSeq[i]] = [nSeq[i], nSeq[swap]]; setSeq(nSeq);
    };

    return (
        <div className="flow-builder">
            <FlowCommandPicker seq={seq} setSeq={setSeq} availableCommands={availableCommands} />
            <SequenceBuilder sequence={seq} availableCommands={availableCommands} onMoveUp={(i) => moveItem(i, true)} onMoveDown={(i) => moveItem(i, false)} onRemove={(i) => setSeq(seq.filter((_, idx) => idx !== i))} />
        </div>
    );
};
