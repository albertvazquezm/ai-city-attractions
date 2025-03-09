import { Attraction } from "../components/city/attraction";
import { data, LoaderFunctionArgs } from "@remix-run/node";
import { getCityAttractions } from "../api/api.server";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
    const citySlug = params.city;
    if(!citySlug) {
        throw data({error: 'City not found'})
    }
    const cityAttractions = await getCityAttractions(citySlug);
    return data(cityAttractions);
}

export default function City() {
    const cityAttractions = useLoaderData<typeof loader>();
    return (
        <div className="min-h-screen">
            <div className="relative h-96">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://source.unsplash.com/1600x900/?paris')", // Example image
                    }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-40" />
                </div>
                <div className="relative h-full flex flex-col items-center justify-center text-white">
                    <h1 className="text-6xl font-bold mb-4">Paris</h1>
                    <p className="text-2xl">France</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold mb-8">Top Tourist Attractions</h2>

                <div className="space-y-12">
                    <Attraction position={1} name="Eiffel Tower" description="The iconic iron lattice tower on the Champ de Mars is one of the world's most recognizable landmarks. Built in 1889, it offers breathtaking views of the city from its observation decks." address="Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France" />
                    <Attraction position={2} name="Louvre Museum" description="The world's largest art museum and a historic monument, home to thousands of works of art including the Mona Lisa. The museum is housed in the Louvre Palace." address="Rue de Rivoli, 75001 Paris, France" />
                </div>
            </div>
        </div>
    );
}
