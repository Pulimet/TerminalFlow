export function getEchoCommand(title: string): string {
    return `echo -e "\\033[36mRunning: ${title}\\033[0m"`;
}

export function resolveSpecialCommand(cmdId: string): string | null {
    if (cmdId.startsWith('__sleep:')) {
        const ms = parseInt(cmdId.replace('__sleep:', ''), 10);
        if (!isNaN(ms) && ms > 0) return `echo "Sleeping ${ms}ms..." && sleep ${ms / 1000}`;
        return null;
    }
    if (cmdId.startsWith('__echo:')) {
        return `echo "${cmdId.replace('__echo:', '')}"`;
    }
    return null;
}
