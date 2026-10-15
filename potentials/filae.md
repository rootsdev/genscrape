# Filae (potential, not built)

- Site: https://www.filae.com (French genealogy, large subscriber base; trees live under /v4/genealogie/ ...).
- Example URLs: none public. Trees and person sheets ("fiche") are inside the logged-in app (`filae.com/v4/...`); Filae's own docs say tree creation is free but everything is behind an account.

## What was tried (2026-10-15)
- WebSearch restricted to filae.com returned only marketing/help articles (`/ressources/...`) and the search form; no public person/tree-profile pages indexed.
- No public sharing URL format for individual persons could be found.

## Blocker
Person pages exist only for authenticated owners (single-page app, data loaded via authenticated API). No public, stable detail page to use as a fixture.

## What a future scraper would need
- A logged-in test session to capture the "fiche" DOM or the tree API JSON (likely `searchapi.mvc`/tree API), plus a URL pattern for the in-app person view. Would be a login-required scraper like the existing ancestry/myheritage tree scrapers.
