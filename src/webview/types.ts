/**
 * Represents a command that can be executed.
 */
export interface Command {
    id: string;
    title: string;
    description: string;
    category: string;
    command: string;
    runInNewTerminal?: boolean;
    source?: 'workspace' | 'user';
}

/**
 * Represents a flow (sequence of commands).
 */
export interface Flow {
    id: string;
    title: string;
    description: string;
    category: string;
    sequence: string[];
    runInNewTerminal?: boolean;
    source?: 'workspace' | 'user';
}

/**
 * Props for command components.
 */
export interface Props {
    commands: Command[];
    onRun: (id: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
}
