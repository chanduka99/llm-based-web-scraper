import asyncio

from crawl4ai import AsyncWebCrawler
from dotenv import load_dotenv

from config import BASE_URL, CSS_SELECTOR, REQUIRED_KEYS
from utils.data_utils import (
    save_tenders_to_csv,
    save_tenders_to_json
)
from utils.scraper_utils import (
    fetch_and_process_page,
    get_browser_config,
    get_llm_strategy,
)

load_dotenv()


async def crawl_tenders():
    """
    Main function to crawl venue data from the website.
    """
    # Initialize configurations
    browser_config = get_browser_config()
    llm_strategy = get_llm_strategy()
    session_id = "venue_crawl_session"

    # Initialize state variables
    page_number = 1
    all_tenders = []
    seen_names = set()

    # Start the web crawler context
    # https://docs.crawl4ai.com/api/async-webcrawler/#asyncwebcrawler
    async with AsyncWebCrawler(config=browser_config) as crawler:
        while page_number<2:
            # Fetch and process data from the current page
            tenders, no_results_found = await fetch_and_process_page(
                crawler,
                page_number,
                BASE_URL,
                CSS_SELECTOR,
                llm_strategy,
                session_id,
                REQUIRED_KEYS,
                seen_names,
            )

            if no_results_found:
                print("No more tenders found. Ending crawl.")
                break  # Stop crawling when "No Results Found" message appears

            if not tenders:
                print(f"No tenders extracted from page {page_number}.")
                break  # Stop if no tenders are extracted

            # Add the tenders from this page to the total list
            all_tenders.extend(tenders)
            page_number += 1  # Move to the next page

            # Pause between requests to be polite and avoid rate limits
            await asyncio.sleep(2)  # Adjust sleep time as needed

    # Save the collected tenders to a CSV file
    if all_tenders:
        # save_tenders_to_csv(all_tenders, "complete_tenders.csv")
        save_tenders_to_json(all_tenders, "complete_tenders_deepseeek_v1.json")
        print(f"Saved {len(all_tenders)} tenders to 'complete_tenders_deepseeek_v1.json")
    else:
        print("No tenders were found during the crawl.")

    # Display usage statistics for the LLM strategy
    llm_strategy.show_usage()


async def main():
    """
    Entry point of the script.
    """
    await crawl_tenders()


if __name__ == "__main__":
    asyncio.run(main())
