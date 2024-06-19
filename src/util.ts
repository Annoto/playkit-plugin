export const throttle = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    func: (...args: any[]) => void,
    limit: number,
    { debounceLast }: { debounceLast?: boolean } = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ((...args: any[]) => void) => {
    let lastRan: number;
    let timer: ReturnType<typeof setTimeout>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...args: any[]): void => {
        const now = Date.now();
        if (!lastRan) {
            lastRan = now;
            func(...args);
        } else {
            const diff = now - lastRan;
            if (timer) {
                clearTimeout(timer);
            }
            if (diff >= limit) {
                lastRan = now;
                func(...args);
            } else if (debounceLast) {
                timer = setTimeout(func, limit - diff, ...args);
            }
        }
    };
};