type LoggerFunc = (message: string, ...additional: any[]) => void

/**
 * Interface for logger functions.
 *
 * Designed to match the winston logging output however should be able
 * to shim to most logger packages which have the same functions
 * with minimal if no effort
 */
export interface Logger
{
    error: LoggerFunc
    warn: LoggerFunc
    info: LoggerFunc
    debug: LoggerFunc
}