"""AI provider abstraction. Financial decisions are supplied, never produced, here."""

from __future__ import annotations

from abc import ABC, abstractmethod
import logging

import httpx
import json

from app.core.config import Settings
from app.models.schemas import AskResponse, FinancialStateResponse, Language, LoanSimulationResponse, SupportingMetric
from app.ai.context import build_controlled_context
from app.ai.prompts import PROMPT_VERSION, SYSTEM_PROMPT

logger = logging.getLogger("arthdrishti.ai")


class AIProvider(ABC):
    name: str

    @abstractmethod
    def explain(self, *, question: str, first_name: str, language: Language, state: FinancialStateResponse, loan: LoanSimulationResponse | None) -> AskResponse: ...


def intent_for(question: str) -> str:
    lowered = question.casefold()
    if any(token in lowered for token in ("loan", "lakh", "लाख", "उधार", "borrow")):
        return "LOAN_AFFORDABILITY"
    if any(token in lowered for token in ("spend", "kharch", "खर्च")):
        return "SPENDING_EXPLANATION"
    if any(token in lowered for token in ("buffer", "cushion", "बचत")):
        return "BUFFER_EXPLANATION"
    return "FINANCIAL_HEALTH_GUIDANCE"


def supporting_metrics(state: FinancialStateResponse, loan: LoanSimulationResponse | None) -> list[SupportingMetric]:
    metrics = [SupportingMetric(label="Financial health", value=f"{state.healthScore}/100"), SupportingMetric(label="EMI burden", value=f"{state.debt.emiBurdenRatio}%"), SupportingMetric(label="Emergency buffer", value=f"{state.savings.bufferMonths} months"), SupportingMetric(label="Monthly headroom", value=f"₹{state.cashFlow.monthlySurplus:,}")]
    if loan:
        metrics.extend([SupportingMetric(label="New illustrative EMI", value=f"₹{loan.monthlyEmi:,}"), SupportingMetric(label="Projected burden", value=f"{loan.affordabilityRatio}%")])
    return metrics


class FallbackAIProvider(AIProvider):
    name = "deterministic-fallback"

    def explain(self, *, question: str, first_name: str, language: Language, state: FinancialStateResponse, loan: LoanSimulationResponse | None) -> AskResponse:
        intent = intent_for(question)
        if intent == "LOAN_AFFORDABILITY" and loan:
            recommended = loan.recommendation == "RECOMMENDED"
            next_step = "Review the controlled affordability details" if recommended else "Build the 90-day buffer, then reassess"
            if language == "hi":
                message = f"{first_name}, यह ₹5 लाख का simulation {loan.recommendation.replace('_', ' ')} है।\n\nकारण: मौजूदा EMI आय का {state.debt.emiBurdenRatio}% है। अनुमानित नई EMI ₹{loan.monthlyEmi:,} होगी और कुल बोझ {loan.affordabilityRatio}% तक पहुँचेगा। आपका आपातकालीन बफर {state.savings.bufferMonths} महीनों का है।\n\nअगला कदम: {next_step}।"
            elif language == "hinglish":
                message = f"{first_name}, ₹5 lakh simulation ka governed result {loan.recommendation.replace('_', ' ')} hai.\n\nWHY: Existing EMI income ka {state.debt.emiBurdenRatio}% hai. New illustrative EMI ₹{loan.monthlyEmi:,} hogi, aur total burden {loan.affordabilityRatio}% tak jayega. Aapka emergency buffer {state.savings.bufferMonths} months hai.\n\nBETTER NEXT STEP: {next_step}."
            else:
                message = f"{first_name}, this ₹5 lakh simulation is {loan.recommendation.replace('_', ' ').lower()}.\n\nWHY: Existing EMIs use {state.debt.emiBurdenRatio}% of income. The illustrative new EMI is ₹{loan.monthlyEmi:,}, taking total burden to {loan.affordabilityRatio}%. Your emergency buffer is {state.savings.bufferMonths} months.\n\nSIMULATED IMPACT: Monthly headroom would be ₹{loan.remainingCashFlow:,}.\n\nBETTER NEXT STEP: {next_step}."
            action = loan.alternativeAction or "Review the controlled loan simulation"
            reference = loan.simulationId
        elif intent == "SPENDING_EXPLANATION":
            message = f"{first_name}, discretionary spending is {abs(state.spending.trend):g}% {'higher' if state.spending.trend >= 0 else 'lower'}. Food delivery, dining and recurring subscriptions are the clearest contributors. Review the linked transactions before changing essentials."
            action, reference = "Review linked transactions", None
        elif intent == "BUFFER_EXPLANATION":
            message = f"{first_name}, your accessible buffer is {state.savings.bufferMonths} months. The current cash-flow trend is {state.cashFlow.trend}, while monthly headroom is ₹{state.cashFlow.monthlySurplus:,}. Protecting salary-day savings transfers is the highest-value next action."
            action, reference = "Protect the savings transfer", None
        else:
            message = f"{first_name}, your financial health is {state.healthScore}/100 with {state.risk.level} risk. The most useful next move is to protect liquidity first, then act on goals from the remaining headroom."
            action, reference = "Open the recommended plan", None
        return AskResponse(message=message, language=language, intent=intent, decisionReference=reference, supportingMetrics=supporting_metrics(state, loan), suggestedAction=action, disclaimer="Financial-wellness guidance and illustrative simulation only; not lending approval, investment advice or a bureau score.", provider=self.name)


class OpusMaxAIProvider(AIProvider):
    name = "opusmax"

    def __init__(self, settings: Settings, fallback: FallbackAIProvider) -> None:
        self.settings = settings
        self.fallback = fallback

    def explain(self, *, question: str, first_name: str, language: Language, state: FinancialStateResponse, loan: LoanSimulationResponse | None) -> AskResponse:
        controlled = self.fallback.explain(question=question, first_name=first_name, language=language, state=state, loan=loan)
        context = build_controlled_context(controlled.intent, state, loan)
        prompt = f"Language: {language}\nQuestion: {question}\nGrounded context: {json.dumps(context, ensure_ascii=False)}\nControlled answer to preserve: {controlled.message}"
        model = (self.settings.ai_reasoning_model or self.settings.ai_default_model or self.settings.opusmax_model) if loan else (self.settings.ai_fast_model or self.settings.ai_default_model or self.settings.opusmax_model)
        try:
            response = httpx.post(f"{self.settings.opusmax_base_url.rstrip('/')}/v1/messages", headers={"x-api-key": self.settings.opusmax_api_key, "anthropic-version": "2023-06-01", "content-type": "application/json"}, json={"model": model, "temperature": 0, "max_tokens": 700, "system": SYSTEM_PROMPT, "messages": [{"role": "user", "content": prompt}]}, timeout=self.settings.request_timeout_seconds)
            response.raise_for_status()
            content = response.json()["content"]
            message = "\n".join(block["text"] for block in content if block.get("type") == "text").strip()
            unsafe_claims = ("LOAN IS APPROVED", "BANK HAS APPROVED", "CIBIL SCORE", "GUARANTEED RETURN", "ELIGIBLE FOR CREDIT")
            if not message or any(claim in message.upper() for claim in unsafe_claims): return controlled
            if loan and loan.recommendation.replace("_", " ") not in message.upper(): return controlled
            return controlled.model_copy(update={"message": message, "provider": self.name})
        except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
            logger.warning("provider_failure provider=opusmax type=%s fallback=deterministic", type(exc).__name__)
            return controlled


def create_provider(settings: Settings) -> AIProvider:
    fallback = FallbackAIProvider()
    if settings.ai_provider.casefold() == "opusmax" and settings.opusmax_api_key and (settings.opusmax_model or settings.ai_default_model):
        return OpusMaxAIProvider(settings, fallback)
    return fallback


# Backwards-compatible import name for existing tests/extensions.
FallbackProvider = FallbackAIProvider
