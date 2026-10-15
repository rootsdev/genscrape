# Interment.net

- Site: https://www.interment.net (about 15M burial transcriptions in ~2,200 cemetery listings)
- Example pages: /data/... cemetery listing pages (one static page per cemetery or surname range).
- Tried: curl works (HTTP 200) for the home and search pages; a guessed /data/ page returned 404.
- Blocker: there are no per-person detail pages. A /data/ page is a long list of burial lines (name, dates, notes) in one transcription page, so there is no single principal person to extract.
- Future scraper would need: a way to pick one line (user text selection / clicked row), or a multi-person list scraper for /search.php results; line format varies per transcription.
