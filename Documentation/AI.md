# Controlled AI architecture

The AI provider is a communication layer after intelligence, decisioning, and governance. It never calculates financial truth or overrides a decision.

## Providers

- `FallbackAIProvider` gives deterministic grounded English, Hindi, and Hinglish explanations and is the default for development and tests.
- `OpusMaxAIProvider` calls the configurable Anthropic-compatible `/v1/messages` endpoint when explicitly enabled and a runtime credential/model are present.

Model selection uses `AI_FAST_MODEL` for ordinary explanations and `AI_REASONING_MODEL` for decision explanations, falling back through `AI_DEFAULT_MODEL` and `OPUSMAX_MODEL`. Ordinary tests never call the live provider.

## Grounding and minimization

Intent selection builds a minimal allowlisted context. Spending questions receive spending/cash-flow summaries; buffer questions receive liquidity/headroom; loan questions receive the immutable outcome, trace, affordability, risk, governance checks, and limitations. Full transaction histories, OTPs, cookies, credentials, and arbitrary database access are never sent.

The system prompt requires the configured language, plain-text output, grounded claims, and the supplied decision. Output validation rejects empty content, unsafe approval/CIBIL/guarantee claims, or a loan explanation that omits the authoritative outcome. Provider HTTP/shape errors fall back safely and log only the exception type.

## Configuration and secrets

Set the OpusMax credential only in the backend runtime environment or deployment secret manager. It is deliberately absent from `.env.example` and documentation values. The provider URL and credential are never exposed through frontend configuration or API responses.

## Conversation persistence

With PostgreSQL, user and assistant messages append to one account/user conversation with provider and prompt version. AI assistant consent gates the `/me/ask` use case. Stored messages support continuity and audit without granting the model write access to financial records.

## Limitations

No live OpusMax result is required for unit, database, CI, or local fallback operation. Natural-language quality depends on the configured provider. Output validation reduces—but cannot eliminate—model risk, so authoritative structured fields remain visible and traceable.
