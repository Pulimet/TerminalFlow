import React from 'react';

/**
 * Props for the CommandInputs component.
 */
interface CommandInputsProps {
    variables: string[];
    inputs: Record<string, string>;
    onInputChange: (variable: string, value: string) => void;
}

/**
 * Renders the input fields for a command's variables.
 * @param props The component props.
 * @returns The rendered CommandInputs component or null if no variables.
 */
export const CommandInputs: React.FC<CommandInputsProps> = ({ variables, inputs, onInputChange }) => {
    if (variables.length === 0) {
        return null;
    }

    return (
        <div className="command-inputs">
            {variables.map(v => (
                <div key={v} className="command-variable-input">
                    <label>${v}</label>
                    <input
                        type="text"
                        value={inputs[v] || ''}
                        onChange={(e) => onInputChange(v, e.target.value)}
                        placeholder={`Value for $${v}`}
                    />
                </div>
            ))}
        </div>
    );
};
