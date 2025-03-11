from fastapi import FastAPI, HTTPException
from data.cities import cities
from services.city_generation_service import generate_city_data

app = FastAPI()

# Cache dictionary to store data
CITY_CACHE = {}

@app.get("/cities")
def search_cities(query: str | None = None):
    if not query:
        return cities
    query = query.lower()
    return [{"name": city["name"], "country": city["country"], "slug": city["slug"]} for city in cities if query in city["name"].lower()]

@app.get("/city/{city_slug}")
async def get_city_details(city_slug: str):
    city = next((city for city in cities if city["slug"] == city_slug), None)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    
    cache_key = city_slug
    if cache_key in CITY_CACHE: 
        return CITY_CACHE[cache_key]
    
    data = await generate_city_data(city["name"], city["country"])
    CITY_CACHE[cache_key] = data
    return data
