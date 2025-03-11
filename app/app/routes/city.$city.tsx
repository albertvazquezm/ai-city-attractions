import { Attraction } from "../components/city/attraction";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getCityDetails } from "../api/api.server";
import { Await, MetaFunction, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
    const citySlug = params.city;
    if (!citySlug) {
        throw { error: 'City not found' }
    }
    
    return {
        cityDetails: getCityDetails(citySlug)
    };
}

export const meta: MetaFunction = () => {
    return [
        { title: 'City details' },
        { name: "description", content: 'City details' },
    ];
}
export default function City() {
    const { cityDetails } = useLoaderData<typeof loader>();

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <Suspense fallback={
                <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            }>
                <Await resolve={cityDetails}>
                    {(resolvedCityDetails) => (
                        <>
                            {/* Hero Section */}
                            <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
                                <div className="text-center">
                                    <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 mb-4 tracking-tight">
                                        {resolvedCityDetails.city_name}
                                    </h1>
                                    <p className="text-2xl sm:text-3xl text-gray-600 font-light">
                                        {resolvedCityDetails.city_country}
                                    </p>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="max-w-3xl mx-auto px-4 text-center">
                                <p className="text-xl sm:text-2xl leading-relaxed text-gray-700 font-light italic">
                                    {resolvedCityDetails.description}
                                </p>
                            </div>

                            {/* Attractions Section */}
                            <div className="max-w-5xl mx-auto px-4 py-16 mt-16">
                                <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-gray-900">
                                    Top Tourist Attractions
                                </h2>
                                <div className="space-y-12">
                                    {resolvedCityDetails.attractions.map((attraction, index) => (
                                        <Attraction
                                            key={attraction.title}
                                            position={index + 1}
                                            name={attraction.title}
                                            description={attraction.description}
                                            address={attraction.location}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </Await>
            </Suspense>
        </div>
    );
}
