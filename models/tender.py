from pydantic import BaseModel


# class Venue(BaseModel):
#     """
#     Represents the data structure of a Venue.
#     """

#     name: str
#     location: str
#     price: str
#     capacity: str
#     rating: float
#     reviews: int
#     description: str


class Tender(BaseModel):
    title: str
    agency: str
    atm_id: str
    category: str
    location: str
    region: str
    id_number: str
    published_date: str
    closing_date: str
    description: str
    link: str
    updated_datetime: str