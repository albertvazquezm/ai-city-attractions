interface FetcherOptions extends RequestInit {
  baseURL?: string;
  timeout?: number;
}

interface ApiError extends Error {
  status?: number;
  data?: any;
}

class ApiError extends Error {
  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const DEFAULT_OPTIONS: FetcherOptions = {
  baseURL: process.env.API_BASE_URL || 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
};

async function apiFetcher<T>(url: string, options: FetcherOptions = {}): Promise<T> {
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
        data
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

// Example usage:
export async function getCities(query: string | null) {
  return apiFetcher<City[]>(`/cities${query ? `?q=${query}` : ''}`);
}

// Type for your city data
interface City {
  name: string;
  country: string;
  slug: string;
  // ... other city properties
}
