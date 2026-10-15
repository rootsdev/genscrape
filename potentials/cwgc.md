# CWGC (Commonwealth War Graves Commission) casualty details

- Site: https://www.cwgc.org/find-records/find-war-dead/casualty-details/<id>/<slug>/
- Importance: very high traffic; the canonical source for ~1.7M Commonwealth WWI/WWII war dead.
- Example pages: .../casualty-details/316815/tom-parker/, .../casualty-details/62415/s-casey/
- Tried: curl with a Chrome user agent (HTTP 403, body "This request has been blocked"), and the
  real Chrome browser via claude-in-chrome (same "This request has been blocked" page, 68 bytes).
- Blocker: WAF/bot protection blocks automated access, including a driven real browser. No fixture
  HTML could be obtained, so no scraper or test could be written.
- Future scraper needs: a fixture saved manually from a normal browser session (Save Page As / copy
  outerHTML). The live page has service number, rank, regiment, date of death, age, cemetery/memorial,
  country, and an "Additional Info" paragraph ("Son of X and Y, of Place; husband of Z"). The parsing
  in src/scrapers/cvwm.js (parseAdditionalInfo) handles the same CWGC-derived text format and can be reused.
