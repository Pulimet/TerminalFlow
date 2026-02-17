export function getEchoCommand(title: string, silent: boolean = true): string {
    if (silent) {
        return `echo -e "\\033[1A\\033[2K\\033[36mRunning: ${title}\\033[0m"`;
    }
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
