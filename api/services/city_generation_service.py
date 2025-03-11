import asyncio
from typing import List, Dict
from langchain_ollama import ChatOllama
from pydantic import BaseModel, Field

llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0.8,
)

class CityDescriptionResponse(BaseModel):
    description: str = Field(description="A brief description of the city")

class AttractionNamesResponse(BaseModel):
    attractions: List[str] = Field(description="A list of popular tourist attractions in the city")

class AttractionDescriptionResponse(BaseModel):
    title: str | None = Field(description="The name of the attraction", default=None)
    description: str | None = Field(description="A brief description of the attraction in 4-5 sentences", default=None)
    location: str | None = Field(description="The location of the attraction", default=None)

async def get_city_description(city_name: str, city_country: str) -> str:
    prompt = f"Give me a brief description of {city_name} ({city_country}) in 2-3 sentences."
    response = llm.with_structured_output(CityDescriptionResponse).invoke(prompt)
    return response.description


async def get_attraction_names(city_name: str, city_country: str, limit: int) -> List[str]:
    prompt = f"Give me {limit} popular touristic attractions from this city: {city_name} ({city_country})"
    response = llm.with_structured_output(AttractionNamesResponse).invoke(prompt)
    return response.attractions


async def get_attraction_description(attraction: str, city: str, country: str) -> Dict[str, str]:
    prompt = f"Give me information about the attraction '{attraction}' in {city} ({country})"
    response = llm.with_structured_output(AttractionDescriptionResponse).invoke(prompt)
    if response is None:
        return {
            "title": attraction,
            "description": "",
            "location": ""
        }
    return {
        "title": response.title or attraction,
        "description": response.description,
        "location": response.location
    }


async def generate_city_data(city_name: str, city_country: str):
    city_description, attractions = await asyncio.gather(
        get_city_description(city_name, city_country),
        get_attraction_names(city_name, city_country, 5)
    )

    attraction_descriptions = await asyncio.gather(
        *[get_attraction_description(attraction, city_name, city_country) for attraction in attractions]
    )

    return {
        "city_name": city_name,
        "city_country": city_country,
        "description": city_description,
        "attractions": attraction_descriptions
    }
