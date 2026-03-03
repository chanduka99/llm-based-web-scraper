import asyncio
import os
import json
from pathlib import Path
from typing import Any
from db_manager import DBManager
from dotenv import load_dotenv
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, LLMConfig, JsonXPathExtractionStrategy

load_dotenv()


class SchemaGenerator:
    """
    Generates, stores, and retrieves crawl4ai extraction schemas
    for tender listing pages, backed by MongoDB via DBManager.
    """

    def __init__(self, db_manager: DBManager | None = None):
        self._db: DBManager = db_manager or DBManager()
        self._db.connect()

# ── schema generation ─────────────────────────────────────────────────────

    async def generate_tender_page_schema(self, url: str) -> dict:
        """
        Takes a tender page URL, crawls it, generates a CSS/XPath schema using LLM,
        and returns the schema as a dict.
        """
        async with AsyncWebCrawler(config=BrowserConfig(headless=True)) as crawler:
            # First pass: get raw HTML
            result = await crawler.arun(
                url=url,
                config=CrawlerRunConfig()
            )

            # Generate schema from HTML using LLM
            schema = JsonXPathExtractionStrategy.generate_schema(
                html=result.html,
                schema_type="css",
                query=(
                    "IMPORTANT: I'm providing HTML of a page with multiple tender objects. "
                    "I need a schema for a tender object to scrape. "
                    "Generate selectors using stable attributes like href patterns "
                    "(e.g., a[href*='/m/']) instead of fragile positional selectors like nth-child(). "
                    "Extract: tender_title, agency, atm_id, category, location, region, "
                    "id_number, published_date, closing_date, description, link. "
                    "atm_id and id_number may have the same selectors."
                ),
                llm_config=LLMConfig(
                    provider="gemini/gemini-2.0-flash",
                    api_token=os.getenv("GEMINI_API_KEY")
                ),
            )

            # Parse to dict if returned as string
            if isinstance(schema, str):
                schema = json.loads(schema)

            return schema

# ── persistence ───────────────────────────────────────────────────────────

    def store_schema(self, tender_state: str, schema: dict) -> None:
        """
        Persist *schema* for *tender_state* to MongoDB.
        Overwrites any existing schema for that state.
        """
        self._db.upsert_schema(tender_state, schema)

    def get_tender_page_schema(self, tender_state: str) -> dict | None:
        """
        Retrieve the stored schema for *tender_state*.
        Returns None if no schema has been saved yet.
        """
        return self._db.get_schema(tender_state)

# ── convenience: generate + store in one call ─────────────────────────────

    async def ensure_schema(self, tender_state: str, url: str) -> dict:
        """
        Return the cached schema for *tender_state* if it exists,
        otherwise generate it from *url*, store it, and return it.
        """
        schema = self.get_tender_page_schema(tender_state)
        if schema:
            print(f"[SchemaGenerator] Loaded existing schema for '{tender_state}'")
            return schema

        print(f"[SchemaGenerator] Generating new schema for '{tender_state}' from {url}")
        schema = await self.generate_tender_page_schema(url)
        self.store_schema(tender_state, schema)
        return schema

    def close(self) -> None:
        self._db.disconnect()

    # context-manager support
    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()



# ── quick smoke-test ──────────────────────────────────────────────────────────

async def main():
    url = "https://qtenders.hpw.qld.gov.au/search?page=1"
    tender_state = "qld"

    with SchemaGenerator() as gen:
        # 1. Get or generate schema
        schema = await gen.ensure_schema(tender_state, url)
        print("Schema:", json.dumps(schema, indent=2))

        # 2. Use schema to scrape
        async with AsyncWebCrawler(config=BrowserConfig(headless=False)) as crawler:
            result = await crawler.arun(
                url=url,
                config=CrawlerRunConfig(
                    extraction_strategy=JsonXPathExtractionStrategy(schema=schema)
                ),
            )

        tenders = json.loads(result.extracted_content or "[]")
        print(f"Scraped {len(tenders)} tenders")

        # 3. Persist tenders
        gen._db.insert_tenders(tender_state, tenders)


if __name__ == "__main__":
    asyncio.run(main())