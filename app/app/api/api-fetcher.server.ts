import { config } from "../config";

interface FetcherOptions extends RequestInit {
    baseURL?: string;
    timeout?: number;
}
    
interface ApiErrorType extends Error {
    status?: number;
}

class ApiError extends Error implements ApiErrorType {
    status?: number;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message: string, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

const DEFAULT_OPTIONS: FetcherOptions = {
    baseURL: config.baseApiUrl,
    timeout: 60_000,
    headers: {
        'Content-Type': 'application/json',
    },
};

export const apiFetcher = async <T>(url: string, options: FetcherOptions = {}): Promise<T> => {
    const mergedOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        headers: {
            ...DEFAULT_OPTIONS.headers,
            ...options.headers,
        },
    };

    const { baseURL, timeout, ...fetchOptions } = mergedOptions;
    const fullUrl = `${baseURL}${url}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(fullUrl, {
            ...fetchOptions,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                `API Error: ${response.statusText}`,
                response.status,
            );
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApiError('Request timeout', 408);
            }
            throw new ApiError(error.message);
        }
        throw new ApiError('Unknown error occurred');
    }
}