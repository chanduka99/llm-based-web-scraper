import asyncio
import os
import json
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, LLMConfig, JsonXPathExtractionStrategy

load_dotenv()


class SchemaGenerator:

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

    def store_schema(self, tender_state: str, schema: dict):
        """
        Converts the schema dict to JSON and stores it as a file named by tender_state.
        Replace the file I/O here with your DB manager call if needed.
        """
        schema_dir = Path("schemas")
        schema_dir.mkdir(parents=True, exist_ok=True)

        file_path = schema_dir / f"{tender_state}.json"
        with file_path.open("w", encoding="utf-8") as f:
            json.dump(schema, f, ensure_ascii=False, indent=2)

        print(f"Schema stored for state '{tender_state}' at {file_path}")

    def get_tender_page_schema(self, tender_state: str) -> dict | None:
        """
        Finds and returns the schema for the given tender_state from storage.
        Returns None if not found.
        """
        file_path = Path("schemas") / f"{tender_state}.json"

        if not file_path.exists():
            print(f"No schema found for state: '{tender_state}'")
            return None

        with file_path.open("r", encoding="utf-8") as f:
            schema = json.load(f)

        return schema