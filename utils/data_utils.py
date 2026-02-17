import csv
import json

from models.tender import Tender


def is_duplicate_tender(tenderTitle: str, seen_names: set) -> bool:
    return tenderTitle in seen_names


def is_complete_tender(tender: dict, required_keys: list) -> bool:
    return all(key in tender for key in required_keys)


def save_tenders_to_csv(tenders: list, filename: str):
    if not tenders:
        print("No tenders to save.")
        return

    # Use field names from the Tender model
    fieldnames = Tender.model_fields.keys()

    with open(filename, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(tenders)
    print(f"Saved {len(tenders)} tenders to '{filename}'.")


def save_tenders_to_json(tenders: list, filename: str, *, indent: int = 2):
    """
    Save a list of tender dicts to a JSON file.

    - Filters each tender to the `Tender.model_fields` keys so JSON output matches the CSV fields.
    - Writes pretty-printed UTF-8 JSON by default (change `indent` to 0 for compact output).
    """
    if not tenders:
        print("No tenders to save.")
        return

    # Keep only model fields to ensure consistent output with CSV
    fieldnames = set(Tender.model_fields.keys())
    filtered = [{k: v for k, v in tender.items() if k in fieldnames} for tender in tenders]

    with open(filename, mode="w", encoding="utf-8") as file:
        json.dump(filtered, file, ensure_ascii=False, indent=indent)

    print(f"Saved {len(filtered)} tenders to '{filename}'.")
