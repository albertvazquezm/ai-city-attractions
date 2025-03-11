import { data, Link, MetaFunction, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { useState, useEffect, KeyboardEvent, useRef } from "react";
import { getCities } from "../api/api.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useDebounce } from 'use-debounce';

export const meta: MetaFunction = () => [
    { title: "City Attractions" },
    { name: "description", content: "Find the best attractions in your favorite cities" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const cities = await getCities(query);
  return data(cities);
}

export default function Index() {
  const [searchParams] = useSearchParams();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const navigate = useNavigate();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const cities = useLoaderData<typeof loader>();
  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [cities]);

  // Update URL when debounced search term changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) {
      params.set('q', debouncedSearchTerm);
    }
    navigate(`/?${params.toString()}`, { replace: true });
  }, [debouncedSearchTerm, navigate]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!cities.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < cities.length - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selected = cities[selectedIndex];
          navigate(`/city/${selected.slug}`);
        }
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="min-h-screen flex flex-col items-center pt-32 px-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 tracking-tight">
        City Attractions
      </h1>

      <div className="max-w-2xl mx-auto w-full relative">
        <div className="relative">
          <input
            type="text"
            className="w-full px-6 py-4 text-lg rounded-full border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              shadow-sm hover:shadow-md transition-shadow duration-200"
            placeholder="Search for a city..."
            onKeyDown={handleKeyDown}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            name="q"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {cities.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute w-full bg-white mt-2 rounded-2xl shadow-lg border border-gray-200 
              max-h-[calc(100vh-300px)] overflow-y-auto z-10"
          >
            {cities.map((city, index) => (
              <Link
                key={index}
                to={`/city/${city.slug}`}
                className={`block w-full text-left px-6 py-3 hover:bg-gray-100 first:rounded-t-2xl 
                  last:rounded-b-2xl text-gray-800 ${selectedIndex === index ? 'bg-gray-100' : ''}`}
                onMouseEnter={() => setSelectedIndex(index)}
                tabIndex={0}
              >
                <div>
                  {city.name} ({city.country})
                  <span className="float-right text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 