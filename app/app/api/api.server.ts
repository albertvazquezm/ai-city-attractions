import { config } from "../config";

export type CitiesResponse = {
    name: string; country: string, slug: string
}[]

export type Attraction = {
    name: string;
    description: string;
    address: string;
}

export type CityAttractionsResponse = {
    city_name: string;
    description: string;
    attractions: Attraction[];
}

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
    baseURL: config.baseApiUrl,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const apiFetcher = async <T>(url: string, options: FetcherOptions = {}): Promise<T> => {
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

export const getCities = async (query: string | null) => {
    return apiFetcher<CitiesResponse>(`/cities?query=${query}`);
};

export const getCityAttractions = async (citySlug: string) => {
    return apiFetcher<CityAttractionsResponse>(`/city/${citySlug}`);
};