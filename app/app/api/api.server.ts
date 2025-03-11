import { apiFetcher } from "./api-fetcher.server";
export type CitiesResponse = {
    name: string; country: string, slug: string
}[]

export type Attraction = {
    title: string;
    description: string;
    location: string;
}

export type CityDetailsResponse = {
    city_name: string;
    city_country: string;
    description: string;
    attractions: Attraction[];
}



export const getCities = async (query: string | null) => {
    return apiFetcher<CitiesResponse>(`/cities?query=${query}`);
};

export const getCityDetails = async (citySlug: string) => {
    return apiFetcher<CityDetailsResponse>(`/city/${citySlug}`);
};