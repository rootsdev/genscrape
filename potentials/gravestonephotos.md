# Gravestone Photographic Resource (gravestonephotos.com)

- Site: https://www.gravestonephotos.com
- Example pages: https://www.gravestonephotos.com/public/gravedetails.php?grave=138646 , ?grave=20603 , ?grave=758497 , ?grave=2883
- Tried: curl and Chrome on 2026-10-15 got 502 Bad Gateway / 504 on every URL including the home page; the Wayback Machine copy returned 429 (rate limited).
- Blocker: the site was down during the session, so no real HTML fixtures could be captured.
- Future scraper needs: capture HTML when the site is up. Per search snippets each page has a breadcrumb (cemetery, county, country) and a table of inscribed names with burial date, age, birth date (calculated values in red) and relationships. Candidate URL regex: /^https?:\/\/www\.gravestonephotos\.com\/public\/gravedetails\.php\?grave=\d+/
