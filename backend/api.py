from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sort

class BadgeUrls(BaseModel):
    badge_urls: List[str]

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/sort")
async def root(body: BadgeUrls):
    sorted = sort.sort_images(body.badge_urls)
    return {"urls": sorted}
