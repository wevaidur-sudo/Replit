---
name: AI provider setup
description: How this project handles managed AI access and provider-key fallbacks.
---

The IDE keeps model credentials on the server and sends only workspace context from the browser. If managed Replit AI provisioning is unavailable for the workspace, use the secure secrets flow for the user's chosen provider rather than asking for credentials in chat.

**Why:** Managed AI setup can be blocked by plan limits even when the user has a provider key, and exposing that key to the browser would violate the IDE's security boundary.

**How to apply:** Keep provider calls inside API routes, never log key values, and return a clear configuration error when the provider is unavailable.

Transient upstream model errors can occur even when the key and request are valid; retry short-lived 429/5xx responses server-side and preserve the provider's useful error message for the UI.

**Why:** A temporary Gemini 503 was previously collapsed into a generic client error, making a recoverable provider hiccup look like a broken integration.

**How to apply:** Use bounded retries with backoff for assistant requests and surface the server response error when the final attempt fails.