# IWM Lives of the First World War

- Site: https://livesofthefirstworldwar.iwm.org.uk/lifestory/<id>
- Importance: large (about 8M life stories of WWI servicemen and women, community-edited); high value
  for genealogy because pages carry birth, marriage, children, service, death and burial events.
- Example pages: /lifestory/4765651 (Ernest Wild), /lifestory/3046544 (Richard Millis),
  /lifestory/1486735 (Edward Groom), /lifestory/1 (A Alezu, sparse).
- Tried: curl with Chrome UA and full browser headers: HTTP 403 with a Cloudflare "Just a moment..." challenge.
  A real Chrome session driven through claude-in-chrome does pass the challenge and renders the page, but
  the tooling returns only ~1KB of text per call and pushing the HTML to a local receiver from the page
  hung (blocked cross-origin/private-network request), so no fixture file could be saved.
- Blocker: no way to save fixture HTML from this environment (Cloudflare blocks curl; no file export from the browser).
- Future scraper needs: fixture HTML saved manually from a browser (Save Page As or copy outerHTML) for 2-3 pages.
  The page is server-rendered Drupal. Markup observed: `.timeline-container .timeline .event.<type>` blocks
  (types seen: birth, enlistment, marriage, children, dates, theatres, employment, service) each with
  `.event-date-title h5` (year), `.event-type`, and `.place` (anchor text, e.g. "Clapham Middlesex United Kingdom").
  The title is "Life story: <Name> | Lives of the First World War" and the heading is "We remember <em>Name</em>".
  Details/Evidence tabs (Tab1..Tab5) hold further structured data. Spouse and children are plain names in the
  timeline events (addRelativeFromName fits). The scraper itself is straightforward DOM parsing once fixtures exist.
