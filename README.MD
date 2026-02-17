# llm-based-web-scraper

This project is a web crawler built with Python that extracts tender / procurement notices from public websites using asynchronous programming with Crawl4AI. It uses a language model (LLM) extraction strategy to produce structured tender data and exports results to CSV and JSON files.

## Features

- Asynchronous web crawling using [Crawl4AI](https://pypi.org/project/Crawl4AI/)
- Data extraction powered by a language model (LLM)
- CSV & JSON export of extracted tender/procurement information
- Modular and easy-to-follow code structure 

## Project Structure
```
.
├── main.py # Main entry point for the crawler
├── config.py # Contains configuration constants (Base URL, CSS selectors, etc.)
├── models
│ └── tender.py # Defines the Tender data model using Pydantic
├── utils
│ ├── init.py # (Empty) Package marker for utils
│ ├── data_utils.py # Utility functions for processing and saving data
│ └── scraper_utils.py # Utility functions for configuring and running the crawler
├── requirements.txt # Python package dependencies
├── .gitignore # Git ignore file (e.g., excludes .env and CSV files)
└── README.MD # This file
```

## Installation

1. **Create and Activate a Virtual Environment**

   ```bash
   python -m venv .venv
   .venv\Scripts\Activate
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set Up Your Environment Variables**

   Create a `.env` file in the root directory with content similar to:

   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

   *(Note: The `.env` file is in your .gitignore, so it won’t be pushed to version control.)*

## Usage

To start the crawler, run:

```bash
python main.py
```

The script will crawl the specified website, extract data page by page, and save the complete tenders to a `complete_tenders.csv` file in the project directory (JSON output can be written with `save_tenders_to_json`, e.g. `complete_tenders.json`). Additionally, usage statistics for the LLM strategy will be displayed after crawling.

## Configuration

The `config.py` file contains key constants used throughout the project:

- **BASE_URL**: The URL of the website from which to extract tender data.
- **CSS_SELECTOR**: CSS selector string used to target tender content.
- **REQUIRED_KEYS**: List of required fields to consider a tender complete.

You can modify these values as needed.

## Additional Notes

- **Logging:** The project currently uses print statements for status messages. For production or further development, consider integrating Python’s built-in `logging` module.
- **Improvements:** The code is structured in multiple modules to maintain separation of concerns, making it easier for beginners to follow and extend the functionality.
- **Dependencies:** Ensure that the package versions specified in `requirements.txt` are installed to avoid compatibility issues.


