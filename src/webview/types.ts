export interface Command {
    id: string;
    title: string;
    description: string;
    category: string;
    command: string;
}

export interface Flow {
    id: string;
    title: string;
    description: string;
    category: string;
    sequence: string[];
}

export interface Props {
    commands: Command[];
    onRun: (id: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
}
