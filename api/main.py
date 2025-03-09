from typing import Union
from fastapi import FastAPI, HTTPException
from data.cities import cities
import ollama
import asyncio
from typing import List, Dict

app = FastAPI()
llm = ollama.Client(host='http://localhost:11434')

@app.get("/cities")
def search_cities(query: str | None = None):
    if not query:
        return cities
    query = query.lower()
    return [{"name": city["name"], "country": city["country"], "slug": city["slug"]} for city in cities if query in city["name"].lower()]

async def get_city_description(city_name: str) -> str:
    prompt = f"Give me a brief description of {city_name} in 2-3 sentences."
    response = await llm.generate(model='llama2', prompt=prompt)
    return response.response

async def get_attraction_names(city_name: str) -> List[str]:
    prompt = f"List exactly 5 main tourist attractions in {city_name}. Return only the names, one per line."
    response = await llm.generate(model='llama2', prompt=prompt)
    # Simple parsing of the response into a list
    attractions = [line.strip() for line in response.response.split('\n') if line.strip()]
    return attractions[:5]

async def get_attraction_description(attraction: str, city: str) -> Dict[str, str]:
    prompt = f"Describe the attraction '{attraction}' in {city} in 1-2 sentences."
    response = await llm.generate(model='llama2', prompt=prompt)
    return {"name": attraction, "description": response.response}

@app.get("/city/{city_slug}")
async def get_city_details(city_slug: str):
    city = next((city for city in cities if city["slug"] == city_slug), None)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    '''
    try:
        # Get city description and attraction names concurrently
        city_description, attractions = await asyncio.gather(
            get_city_description(city_name),
            get_attraction_names(city_name)
        )

        # Get all attraction descriptions concurrently
        attraction_descriptions = await asyncio.gather(
            *[get_attraction_description(attraction, city_name) for attraction in attractions]
        )

        return {
            "city_name": city_name,
            "description": city_description,
            "attractions": attraction_descriptions
        }
    except Exception as e:
        return {"error": str(e)}
    '''

