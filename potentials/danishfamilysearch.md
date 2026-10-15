# Danish Family Search (danishfamilysearch.com / .dk)

- Site: https://www.danishfamilysearch.com
- Example pages: record URLs of the form /cid<number> (census 1787/1801) per Wikipedia citations.
- Tried: curl on /cid1000 and /cid1000000 redirected to /user/new/ (login/registration page).
- Blocker: record detail pages need a logged-in session; the public HTML is an ASP.NET (Telerik) shell.
- Future scraper needs: HTML fixtures from a logged-in session; then parse the labeled record table.
