export interface Command {
    id: string;
    title: string;
    description: string;
    category: string;
    command: string;
    runInNewTerminal?: boolean;
}

export interface Flow {
    id: string;
    title: string;
    description: string;
    category: string;
    sequence: string[];
    runInNewTerminal?: boolean;
}

export interface Props {
    commands: Command[];
    onRun: (id: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
}
