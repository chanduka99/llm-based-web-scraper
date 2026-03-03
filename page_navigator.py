# from crawl4ai.async_configs import CrawlerRunConfig
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig,JsonXPathExtractionStrategy,BrowserConfig
from crawl4ai import JsonCssExtractionStrategy
from crawl4ai.cache_context import CacheMode
from schema_generator import SchemaGenerator
import json
import asyncio
from urllib.parse import urlparse
from utils.data_utils import save_tenders_to_json

def get_domain_url(url: str) -> str:
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}"

async def get_js_code(council:str,url:str,wait_for_selector:str):

    gen = SchemaGenerator()
        # next_page_schema = {"fields":[{"name":"next page","selector":"nsw-direction-link choose-page"}]} # implement the action of retriving the selector from db for the correct council
    next_page_schema = await gen.ensure_next_page_schema(council,url,wait_for_selector)
    next_button_xpath = next_page_schema["fields"][0]["selector"]

    js_code = f"""
    const result = document.evaluate(
        {json.dumps(next_button_xpath)},
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null);

    const nextButton = result.singleNodeValue;
    nextButton ? nextButton.click(): "";
    """
    # print(js_code)
    return js_code


# asyncio.run(get_js_code("nsw","https://buy.nsw.gov.au/opportunity/search?types=Tenders","css:[class='nsw-pagination']"))
# print(get_js_code("nsw","https://buy.nsw.gov.au/opportunity/search?types=Tenders","css:[class='nsw-pagination']"))


async def crawl_dynamic_content():
    site_data = [
        {
        "council" : "act",
        "url" :"https://www.tenders.act.gov.au/tender/search?preset=open&page=",
        "wait_for_selector": "css:[class='tender-table']"
        },
        {
        "council" : "ausGov",
        "url" :"https://www.tenders.gov.au/atm",
        "wait_for_selector": "css:[class='search-results']"
        },
        {
        "council" : "nsw",
        "url" :"https://buy.nsw.gov.au/opportunity/search?types=Tenders",
        "wait_for_selector": "css:[class='nsw-pagination']"
        },
        {
        "council" : "nt",
        "url" :"https://tendersonline.nt.gov.au/Tender/Search/Current#!/Current",
        "wait_for_selector": "css:[id='TenderSearchForm']"
        },
        {
        "council" : "qld",
        "url" :"https://qtenders.hpw.qld.gov.au/search?keywords=",
        "wait_for_selector": "css:[region='region']"
        },
        {
        "council" : "sa",
        "url" :"https://www.tenders.sa.gov.au/tender/search?preset=open",
        "wait_for_selector": "css:[class='tender-table']"
        },
        {
        "council" : "tas",
        "url" :"https://www.tenders.tas.gov.au/OpenForBids/List/Public/ClosingDate",
        "wait_for_selector": "css:[class='FutureOpportunities']"
        },
        {
        "council" : "vic",
        "url" :"https://www.tenders.vic.gov.au/tender/search?preset=open&page=",
        "wait_for_selector": "css:[class='nsw-pagination']"
        },
        {
        "council" : "wa",
        "url" :"https://buy.nsw.gov.au/opportunity/search?types=Tenders",
        "wait_for_selector": "css:[class='nsw-pagination']"
        },
    ]
    
    index = 0
    url = site_data[index]["url"]
    council = site_data[index]['council']
    wait_for_selector = site_data[index]['wait_for_selector']


    domain = get_domain_url(url)

    session_id = "wait_for_session"
    all_links = []

    js_next_page = await get_js_code(council,url,wait_for_selector)

    gen = SchemaGenerator()
    schema = await gen.ensure_tender_links_schema(council, url,wait_for_selector)

    extraction_strategy = JsonXPathExtractionStrategy(schema, verbose=True)


    browser_config = BrowserConfig(
        verbose=True,
        headless=False,
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        for page in range(3):
            crawler_config = CrawlerRunConfig(
                session_id=session_id,
                # css_selector="li[data-testid='commit-row-item']",
                extraction_strategy=extraction_strategy,
                js_code=js_next_page if page > 0 else None,
                wait_for=wait_for_selector if page > 0 else None,
                js_only=page > 0,
                cache_mode=CacheMode.BYPASS,
                capture_console_messages=True,
                page_timeout=60000
            )
            result = await crawler.arun(url=url, config=crawler_config)

            if result.console_messages:
                print(f"Page {page + 1} console messages:", result.console_messages)

            if result.extracted_content:
                # print(f"Page {page + 1} result:", result.extracted_content)
                links = json.loads(result.extracted_content)
                all_links.extend([{"link":domain+link['link']} for link in links])
                print(f"Page {page + 1}: Found {len(links)} links")
            else:
                print(f"Page {page + 1}: No content extracted")
            await asyncio.sleep(2.0)

        print(f"Successfully crawled {len(all_links)} commits across 3 pages")

        print(f"scraped content::: {all_links}")
        save_tenders_to_json(all_links,council+".json")
        # Clean up session
        await crawler.crawler_strategy.kill_session(session_id)

asyncio.run(crawl_dynamic_content())