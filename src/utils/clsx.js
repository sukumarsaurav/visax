// Simple utility for conditional class names
export function clsx(...args) {
    return args
        .flat()
        .filter(x => typeof x === 'string')
        .join(' ')
        .trim()
}
