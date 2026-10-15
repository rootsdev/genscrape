# RootsWeb WorldConnect (potential, blocked)

- Site: https://wc.rootsweb.com / https://wc.rootsweb.ancestry.com / worldconnect.rootsweb.com
- Importance: historically one of the largest free tree collections (440k+ trees, 700M+ names); person pages were `cgi-bin/igm.cgi?op=GET&db=<db>&id=<id>`.
- Example URLs (from third-party citations): `https://wc.rootsweb.com/cgi-bin/igm.cgi?op=GET&db=aferm&id=I01275`, `...?op=GET&db=berylorr&id=I06869`.

## What was tried (2026-10-15)
- `curl` with a desktop UA against `wc.rootsweb.com/` and `igm.cgi?op=GET&...`: HTTP 403, 2-byte body (edge block).
- Real Chrome (claude-in-chrome): navigating to the igm.cgi person URL ends up redirected to
  `https://www.ancestry.com/search/collections/62741` ("RootsWeb WorldConnect Community Trees Index"), a search form, not person data.

## Blocker
WorldConnect person pages no longer exist at the old URLs: the service has been retired/folded into an Ancestry search collection, so there is no stable public person detail page to scrape and no HTML fixture can be obtained.

## What a future scraper would need
- Archived (web.archive.org) snapshots of igm.cgi pages to build fixtures, if legacy pages are still linked from other sites; or
- A way to reach the Ancestry collection 62741 record pages (likely login-gated, would overlap with the existing ancestry-record scraper).
