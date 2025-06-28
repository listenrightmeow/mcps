type LogType = 'info' | 'error' | 'warn' | 'debug' | 'http';

interface LogContext {
    [key: string]: any;
}

/**
 * Logs a message with optional context and log level
 * @param {string} message - The main log message
 * @param {LogType} [type='info'] - The log level
 * @param {LogContext} [context={}] - Additional context to include in the log
 */
export function log(
    message: string, 
    type: LogType = 'info',
    context: LogContext = {}
): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
        jsonrpc: '2.0',
        method: 'log',
        params: {
            message,
            level: type,
            timestamp,
            ...(Object.keys(context).length > 0 && { context })
        }
    };
    
    const logString = JSON.stringify(logEntry, (_key, value) => 
        typeof value === 'bigint' ? value.toString() : value
    );
    
    switch (type) {
        case 'error':
            console.error(logString);
            break;
        case 'warn':
            console.warn(logString);
            break;
        case 'debug':
            console.debug(logString);
            break;
        case 'http':
            console.info(logString);
            break;
        default:
            console.info(logString);
    }
}

/**
 * Logs an HTTP request with relevant details
 * @param {string} method - The HTTP method
 * @param {string} uri - The request URI
 * @param {Record<string, string>} headers - Request headers
 * @param {Record<string, any>} [additionalContext] - Additional context to include
 */
export function logRequest(
    method: string,
    uri: string,
    headers: Record<string, string> = {},
    additionalContext: Record<string, any> = {}
): void {
    log('HTTP Request', 'http', {
        method,
        uri,
        headers,
        ...additionalContext
    });
}