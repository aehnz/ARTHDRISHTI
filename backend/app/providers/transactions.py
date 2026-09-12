from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from hashlib import sha256
from typing import Iterable

from app.models.schemas import ScenarioId, TransactionResponse
from app.repositories.interfaces import TransactionRepository


@dataclass(frozen=True)
class RawTransaction:
    external_reference: str
    date: str
    time: str
    amount: int
    direction: str
    merchant: str
    description: str
    channel: str = "bank_account"
    currency: str = "INR"


class TransactionProvider(ABC):
    @abstractmethod
    def fetch(self, customer_id: str, scenario: ScenarioId) -> list[TransactionResponse]: ...


class RepositoryTransactionProvider(TransactionProvider):
    def __init__(self, repository: TransactionRepository) -> None: self.repository = repository
    def fetch(self, customer_id: str, scenario: ScenarioId) -> list[TransactionResponse]: return self.repository.list_for(customer_id, scenario)


class TransactionNormalizer:
    """Deterministic validation, merchant normalization, categorization, and deduplication."""
    merchant_aliases = {"swiggy ltd": "Swiggy", "zomato limited": "Zomato", "hdfc bank ltd": "HDFC Bank"}
    category_terms = {"salary": "Salary", "rent": "Rent", "emi": "EMI", "electric": "Utilities", "broadband": "Utilities", "grocery": "Food", "food": "Food", "dining": "Dining", "subscription": "Subscriptions", "saving": "Savings"}

    def normalize(self, rows: Iterable[RawTransaction], customer_id: str) -> list[TransactionResponse]:
        result, seen = [], set()
        for row in rows:
            merchant = self.merchant_aliases.get(" ".join(row.merchant.casefold().split()), " ".join(row.merchant.split()))
            fingerprint = sha256(f"{customer_id}|{row.external_reference}|{row.date}|{row.time}|{row.amount}|{merchant}".encode()).hexdigest()
            if fingerprint in seen or row.amount <= 0 or row.direction not in {"credit", "debit"}: continue
            seen.add(fingerprint)
            searchable = f"{merchant} {row.description}".casefold()
            category = next((value for key, value in self.category_terms.items() if key in searchable), "Other")
            result.append(TransactionResponse(id=f"txn-{fingerprint[:20]}", customerId=customer_id, date=row.date, time=row.time, description=row.description.strip(), amount=row.amount, type=row.direction, category=category, merchant=merchant, paymentMethod=row.channel, intelligence="Normalized provider transaction"))
        return result


class BankTransactionProvider(TransactionProvider):
    def fetch(self, customer_id: str, scenario: ScenarioId) -> list[TransactionResponse]:
        raise NotImplementedError("No real bank transaction provider is configured")


class OpenBankingTransactionProvider(BankTransactionProvider): pass
class CSVTransactionProvider(BankTransactionProvider): pass
