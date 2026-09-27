---
name: AI provider setup
description: How this project handles managed AI access and provider-key fallbacks.
---

The IDE keeps model credentials on the server and sends only workspace context from the browser. If managed Replit AI provisioning is unavailable for the workspace, use the secure secrets flow for the user's chosen provider rather than asking for credentials in chat.

**Why:** Managed AI setup can be blocked by plan limits even when the user has a provider key, and exposing that key to the browser would violate the IDE's security boundary.

**How to apply:** Keep provider calls inside API routes, never log key values, and return a clear configuration error when the provider is unavailable.