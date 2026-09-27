---
name: Imported repository preview registration
description: Repositories imported into an existing project may contain runnable artifact folders without registered artifact metadata.
---

When importing a repository that already contains an artifact directory, register the runnable artifact first and then overlay the repository source while preserving the generated artifact metadata.

**Why:** A copied `.replit-artifact/artifact.toml` does not by itself guarantee that the project runtime has registered the artifact or created its managed workflow.

**How to apply:** Check registered artifacts after import; if the runnable app is present on disk but absent from the registry, create/register the artifact with the same slug before starting Preview.