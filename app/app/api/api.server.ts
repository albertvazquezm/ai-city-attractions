import { config } from "../config";

export type CitiesResponse = {
    name: string; country: string, slug: string
}[]

export const getCities = async (query: string | null): Promise<CitiesResponse> => {
    const response = await fetch(`${config.baseApiUrl}/cities?query=${query}`);
    return response.json();
};
