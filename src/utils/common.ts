export const NEW_TERMINAL_DELAY = 1500;

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
