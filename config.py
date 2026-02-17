# config.py

# BASE_URL = "https://www.theknot.com/marketplace/wedding-reception-venues-atlanta-ga"
BASE_URL = "https://qtenders.hpw.qld.gov.au/search?"
CSS_SELECTOR = "[class^='tw:bg-white tw:rounded-lg tw:shadow-md tw:border-2 tw:border-brandgray-300 tw:px-6 tw:py-4 tw:hover:shadow-lg tw:transition-shadow']"
# BASE_URL = "https://www.tenders.gov.au/Atm/Show/fe96de94-11a3-44f9-8680-c0fbd7f9085f"
# CSS_SELECTOR = "[class^='main']"
CSS_SELECTOR = ""
WAIT_FOR = """() => {
    const items = document.querySelectorAll('div > div > div > div.space-y-6');
    return items.length > 0;  // Wait for at least 1 items
}"""
REQUIRED_KEYS = [
    "title",
    "agency",
    "atm_id",
    "category",
    "location",
    "region",
    "id_number",
    "published_date",
    "closing_date",
    "description",
    "link",
    "updated_datetime",
]


# REQUIRED_KEYS = [
#     "name",
#     "price",
#     "location",
#     "capacity",
#     "rating",
#     "reviews",
#     "description",
# ]
