# WieWasWie (wiewaswie.nl)

- Site: https://www.wiewaswie.nl (Dutch civil/church/population records; large traffic in NL genealogy)
- Example pages: none obtainable (person detail URLs live under /nl/detail/<id>).
- Tried: curl with a browser UA on / and /nl/zoeken/ returned HTTP 403 "Just a moment..." (Cloudflare managed challenge).
- Blocker: Cloudflare JS challenge for non-browser clients; no fixtures could be captured.
- Future scraper needs: fixtures captured from a real Chrome session that passed the challenge (document.documentElement.outerHTML of /nl/detail/<id>). Much of the same data is covered by the `archieven` and `openarch` scrapers.
