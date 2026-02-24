import os
import json
from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING
from pymongo.collection import Collection
from pymongo.errors import ConnectionFailure, DuplicateKeyError

load_dotenv()


class DBManager:
    """
    MongoDB manager for the tender scraper.

    Collections:
      - schemas      : one document per tender_state, holds the crawl4ai schema
      - tenders      : scraped tender records
      - scrape_logs  : run-level audit trail
    """

    def __init__(
        self,
        uri: str | None = None,
        db_name: str = "ai_crawler",
    ):
        self._uri = uri or os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self._db_name = db_name
        self._client: MongoClient | None = None
        self._db = None

    # ── connection ────────────────────────────────────────────────────────────

    def connect(self) -> None:
        """Open connection and ensure indexes exist."""
        if self._client is not None:
            return
        self._client = MongoClient(self._uri)
        # Ping to verify connectivity early
        self._client.admin.command("ping")
        self._db = self._client[self._db_name]
        self._ensure_indexes()
        print(f"[DBManager] Connected to '{self._db_name}' at {self._uri}")

    def disconnect(self) -> None:
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            print("[DBManager] Disconnected.")

    # context-manager support
    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, *_):
        self.disconnect()

    # ── internal helpers ──────────────────────────────────────────────────────

    def _ensure_indexes(self) -> None:
        schemas: Collection = self._db["schemas"]
        schemas.create_index([("tender_state", ASCENDING)], unique=True)


        logs: Collection = self._db["scrape_logs"]
        logs.create_index([("tender_state", ASCENDING)])
        logs.create_index([("started_at", ASCENDING)])

    def _col(self, name: str) -> Collection:
        if self._db is None:
            raise RuntimeError("DBManager is not connected. Call .connect() first.")
        return self._db[name]

    @staticmethod
    def _now() -> datetime:
        return datetime.now(timezone.utc)

    # ── schema operations ─────────────────────────────────────────────────────

    def upsert_schema(self, tender_state: str, schema: dict) -> None:
        """
        Insert or replace the extraction schema for *tender_state*.
        Stores the full schema dict plus metadata timestamps.
        """
        col = self._col("schemas")
        doc = {
            "tender_state": tender_state,
            "schema": schema,
            "updated_at": self._now(),
        }
        col.update_one(
            {"tender_state": tender_state},
            {"$set": doc, "$setOnInsert": {"created_at": self._now()}},
            upsert=True,
        )
        print(f"[DBManager] Schema upserted for state='{tender_state}'")

    def get_schema(self, tender_state: str) -> dict | None:
        """
        Return the schema dict for *tender_state*, or None if not found.
        """
        doc = self._col("schemas").find_one(
            {"tender_state": tender_state},
            {"_id": 0, "schema": 1},
        )
        return doc["schema"] if doc else None

    def delete_schema(self, tender_state: str) -> bool:
        """Delete schema; returns True if a document was removed."""
        result = self._col("schemas").delete_one({"tender_state": tender_state})
        return result.deleted_count > 0

    def list_schema_states(self) -> list[str]:
        """Return all stored tender_state keys."""
        return self._col("schemas").distinct("tender_state")

    # ── tender operations ─────────────────────────────────────────────────────

    def insert_tenders(self, tender_state: str, tenders: list[dict]) -> int:
        """
        Bulk-insert scraped tender records.
        Skips duplicates (matched on tender_state + atm_id).
        Returns the number of new documents inserted.
        """
        if not tenders:
            return 0

        col = self._col("tenders")
        inserted = 0
        for tender in tenders:
            doc = {
                **tender,
                "tender_state": tender_state,
                "scraped_at": self._now(),
            }
            try:
                col.update_one(
                    {
                        "tender_state": tender_state,
                        "atm_id": tender.get("atm_id"),
                    },
                    {"$setOnInsert": doc},
                    upsert=True,
                )
                inserted += 1
            except DuplicateKeyError:
                pass

        print(f"[DBManager] {inserted} tender(s) upserted for state='{tender_state}'")
        return inserted

    def get_tenders(
        self,
        tender_state: str,
        filters: dict | None = None,
        limit: int = 100,
    ) -> list[dict]:
        """
        Retrieve tenders for *tender_state* with optional extra filters.
        """
        query = {"tender_state": tender_state, **(filters or {})}
        cursor = self._col("tenders").find(query, {"_id": 0}).limit(limit)
        return list(cursor)

    # ── scrape log operations ─────────────────────────────────────────────────

    def log_scrape_start(self, tender_state: str, url: str) -> Any:
        """Insert a scrape-start log and return its inserted _id."""
        doc = {
            "tender_state": tender_state,
            "url": url,
            "status": "running",
            "started_at": self._now(),
            "finished_at": None,
            "records_scraped": None,
            "error": None,
        }
        result = self._col("scrape_logs").insert_one(doc)
        return result.inserted_id

    def log_scrape_end(
        self,
        log_id: Any,
        *,
        records_scraped: int = 0,
        error: str | None = None,
    ) -> None:
        """Update a scrape log with completion info."""
        self._col("scrape_logs").update_one(
            {"_id": log_id},
            {
                "$set": {
                    "status": "error" if error else "success",
                    "finished_at": self._now(),
                    "records_scraped": records_scraped,
                    "error": error,
                }
            },
        )

    def get_scrape_logs(self, tender_state: str, limit: int = 20) -> list[dict]:
        cursor = (
            self._col("scrape_logs")
            .find({"tender_state": tender_state}, {"_id": 0})
            .sort("started_at", -1)
            .limit(limit)
        )
        return list(cursor)