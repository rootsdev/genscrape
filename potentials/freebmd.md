# FreeBMD (https://www.freebmd.org.uk)

- Traffic/importance: high; the main free index of England and Wales civil registration births, marriages and deaths (1837+).
- Example pages: https://www.freebmd.org.uk/cgi/information.pl?cite=...&type=Births (record information pages; `cite` values come from search results). A new site, www.freebmd2.org.uk, also exists.
- Tried: curl with a browser user agent for information.pl.
- Blocker: every request gets an "Access check" interstitial (FreeUKGenealogy ALTCHA proof-of-work form, POST to /noc/gate/verify) before any content. Search is POST based, so no stable example `cite` URL could be found without passing the gate. Not bypassed, since it is bot detection.
- A future scraper needs: a real browser session that has passed the gate, and example information.pl pages saved from it. Record pages hold index fields only (surname, forenames, mother's maiden name or spouse surname, district, volume/page, quarter/year), so output would be a name, a Birth/Marriage/Death fact with quarter/year date and district place, and a mother or spouse with surname only.
