# Generic extractor benchmark

Before = hand-written scraper output. After = `src/generic` with no site code.

**Overall:** 1124 / 1521 expected fields matched (74%) across 138 pages and 26 scrapers.

## By scraper

| Scraper | Pages | Matched | Recall | Extra fields | Strategy | Verdict |
|---|---|---|---|---|---|---|
| billiongraves | 2 | 12/12 | 100% | 0 | json×2 | generic |
| freereg | 6 | 40/40 | 100% | 2 | labels×5, labels+narrative×1 | generic |
| wikitree | 4 | 51/51 | 100% | 8 | microdata+labels+narrative×4 | generic |
| findagrave-new | 10 | 123/126 | 98% | 21 | microdata+labels+narrative×8, microdata+labels×2 | generic |
| geni | 2 | 33/35 | 94% | 0 | microdata+labels+narrative×2 | generic |
| familysearch-ancestors-public | 2 | 23/25 | 92% | 0 | jsonld×2 | generic |
| genealogieonline | 4 | 43/47 | 91% | 6 | microdata+narrative×2, microdata+labels+narrative×2 | generic |
| freecen | 2 | 17/19 | 89% | 2 | labels×2 | config |
| abmc | 3 | 31/36 | 86% | 2 | labels+narrative×2, labels×1 | config |
| findagrave | 12 | 143/174 | 82% | 22 | labels+narrative×8, labels×4 | config |
| rodovid | 2 | 29/36 | 81% | 0 | labels+narrative×2 | config |
| archieven | 3 | 19/25 | 76% | 1 | labels×3 | config |
| awm | 3 | 19/25 | 76% | 2 | labels×3 | config |
| cvwm | 4 | 35/47 | 74% | 2 | labels+narrative×3, labels×1 | config |
| myheritage-record | 17 | 129/176 | 73% | 39 | labels×16, labels+narrative×1 | config |
| ancestry-record | 13 | 78/108 | 72% | 9 | labels×13 | config |
| legacy | 3 | 12/18 | 67% | 0 | jsonld×3 | config |
| thepeerage | 4 | 42/63 | 67% | 17 | labels+narrative×3, narrative×1 | config |
| findmypast-record | 15 | 67/105 | 64% | 13 | labels×15 | config |
| fold3-memorial | 3 | 37/59 | 63% | 1 | microdata+labels×3 | config |
| irishgenealogy | 8 | 33/55 | 60% | 4 | labels×7, none×1 | config |
| geneanet | 2 | 23/39 | 59% | 0 | labels+narrative×2 | custom |
| gedbas | 2 | 26/51 | 51% | 1 | labels×2 | custom |
| openarch | 3 | 12/24 | 50% | 3 | microdata+labels×2, microdata+labels+narrative×1 | custom |
| digitalarkivet | 7 | 31/76 | 41% | 10 | labels×7 | custom |
| werelate | 2 | 16/49 | 33% | 3 | labels+narrative×2 | custom |

Verdict: **generic** ≥ 90% recall, **config** 60–89%, **custom** < 60%.

## Every page: before vs after

### abmc / bellows — 82% (9/11, labels+narrative)

<https://www.abmc.gov/profile/private-first-class-william-h-bellows/>

| Field | Before | After | |
|---|---|---|---|
| name | William H. Bellows | Private First Class William H. Bellows | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | November 18, 1889 | November 18, 1889 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | July 20, 1918 | July 20, 1918 | ✓ |
|   place | Soissons, France | Soissons, France | ✓ |
| fact Burial | Burial |  | ✗ |
|   place | Aisne-Marne American Cemetery |  | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   place | Woodland, California | Woodland, California | ✓ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |

### abmc / yldefonzo — 92% (11/12, labels+narrative)

<https://www.abmc.gov/profile/sergeant-teofilo-yldefonzo/>

| Field | Before | After | |
|---|---|---|---|
| name | Teofilo Yldefonzo | Sergeant Teofilo Yldefonzo | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | November 11, 1902 | November 11, 1902 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | June 19, 1942 | June 19, 1942 | ✓ |
|   place | Camp O’Donnell, Capas, Tarlac, Philippines | Camp O’Donnell, Capas, Tarlac, Philippines | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Manila American Cemetery | Manila American Cemetery | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   place | Piddig, Ilocos Norte | Piddig, Ilocos Norte | ✓ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |
| fact MilitaryAward | MilitaryAward |  | ✗ |

### abmc / blankenship — 85% (11/13, labels)

<https://www.abmc.gov/profile/sergeant-harry-blankenship/>

| Field | Before | After | |
|---|---|---|---|
| name | Harry Blankenship | Sergeant Harry Blankenship | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | June 17, 1909 | June 17, 1909 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | June 26, 1944 | June 26, 1944 | ✓ |
|   place | France | France | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Normandy American Cemetery | Normandy American Cemetery | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   place | Limestone, Tennessee | Limestone, Tennessee | ✓ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |
| fact MilitaryAward | MilitaryAward |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |

### ancestry-record / 1880-2376696 — 73% (8/11, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?db=1880usfedcen&h=2376696&indiv=try>

| Field | Before | After | |
|---|---|---|---|
| name | Frank Van Sky | Frank Van Sky | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | abt 1875 | abt 1875 | ✓ |
|   place | New York | New York | ✓ |
| fact Residence | Residence |  | ✗ |
|   date | 1880 |  | ✗ |
|   place | Johnstown, Fulton, New York |  | ✗ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| parent | Joseph Van Sky | Joseph Van Sky | ✓ |
| parent | Ida Van Sky | Ida Van Sky | ✓ |

### ancestry-record / VTVitalRecs-1344848 — 100% (11/11, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?db=VTVitalRecs&h=1344848&indiv=try>

| Field | Before | After | |
|---|---|---|---|
| name | Frank J Vannoske | Frank J Vannoske | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | abt 1874 | abt 1874 | ✓ |
|   place | New York | New York | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 4 Aug 1900 | 4 Aug 1900 | ✓ |
|   place | Halifax, Vermont, USA | Halifax, Vermont, USA | ✓ |
| parent | Joseph Vannoske | Joseph Vannoske | ✓ |
| parent | Ida | Ida | ✓ |
| spouse | Anna W Atzroth | Anna W Atzroth | ✓ |

### ancestry-record / ssdi-64142243 — 83% (5/6, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=ssdi&h=64142243>

| Field | Before | After | |
|---|---|---|---|
| name | Clara Vannoske | Clara Vannoske | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 22 Mar 1892 | 22 Mar 1892 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Oct 1974 | Oct 1974 | ✓ |
| fact NationalId | NationalId |  | ✗ |

### ancestry-record / findagraveus-8824956 — 100% (3/3, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=findagraveus&h=8824956>

| Field | Before | After | |
|---|---|---|---|
| name | Ann Armstrong | Ann Armstrong | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 27 May 1890 | 27 May 1890 | ✓ |
| fact Burial |  | Burial · Lisbon Cemetery | + |

### ancestry-record / webobituary-22395809 — 100% (12/12, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=web-obituary&h=22395809>

| Field | Before | After | |
|---|---|---|---|
| name | Joyce Ann Mears | Joyce Ann Mears | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   place | Seaford, Nassau, New York, USA | Seaford, Nassau, New York, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 8 Mar 2010 | 8 Mar 2010 | ✓ |
|   place | Seaford, Nassau, New York, USA | Seaford, Nassau, New York, USA | ✓ |
| fact Residence |  | Residence · Seaford, Delaware, USA | + |
| parent | Fred  Smith | Fred Smith | ✓ |
| parent | Ruth Ellen Meredith | Ruth Ellen Meredith | ✓ |
| spouse | Jerry V. Mears | Jerry V. Mears | ✓ |
| child | Michelle Lowe | Michelle Lowe | ✓ |
| child | Richard Mears | Richard Mears | ✓ |

### ancestry-record / 1940usfedcen-154240314 — 36% (4/11, labels)

<https://www.ancestry.com/discoveryui-content/view/154240314:2442>

| Field | Before | After | |
|---|---|---|---|
| name | Katie B Coast | Katie B Coast | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   place | Louisiana | Louisiana | ✓ |
| fact Residence | Residence |  | ✗ |
|   date | 1940 |  | ✗ |
|   place | Highland Park, Dallas, Texas |  | ✗ |
| fact Residence | Residence |  | ✗ |
|   date | 1935 |  | ✗ |
|   place | Longview, Gregg, Texas |  | ✗ |
| fact MaritalStatus | MaritalStatus |  | ✗ |
| spouse |  | House Number | + |
| spouse |  | Sheet Number | + |
| spouse |  | Billie Bond | + |
| spouse |  | Wm Thurman | + |
| spouse |  | Chauncey McFarland | + |

### ancestry-record / 1900usfedcen-54351117 — 73% (8/11, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=1900usfedcen&h=54351117>

| Field | Before | After | |
|---|---|---|---|
| name | Chas E Bradshaw | Chas E Bradshaw | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Aug 1897 | Aug 1897 | ✓ |
|   place | Texas | Texas | ✓ |
| fact Residence | Residence |  | ✗ |
|   date | 1900 |  | ✗ |
|   place | Armour, Limestone, Texas |  | ✗ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| fact Occupation |  | Occupation | + |
| parent | Jas C Bradshaw | Jas C Bradshaw | ✓ |
| parent | Minnie M Bradshaw | Minnie M Bradshaw | ✓ |

### ancestry-record / davies1920-23578 — 75% (3/4, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=davies1920&h=23578>

| Field | Before | After | |
|---|---|---|---|
| name | John A. Able | John A. Able | ✓ |
| gender | Male | Male | ✓ |
| fact Ethnicity | Ethnicity |  | ✗ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| fact Birth |  | Birth · KY | + |

### ancestry-record / OrMarriages-4777 — 50% (3/6, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?h=4777&db=OrMarriages&indiv=1>

| Field | Before | After | |
|---|---|---|---|
| name | Ephraim J Thurman | Ephraim J Thurman | ✓ |
| gender | Male | Male | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   date | 25 Oct 1856 |  | ✗ |
|   place | Marion, Oregon, USA |  | ✗ |
| spouse | Elizabeth Skeen | Elizabeth Skeen | ✓ |

### ancestry-record / general-9279-30484846 — 100% (5/5, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=general-9279&h=30484846>

| Field | Before | After | |
|---|---|---|---|
| name | Rachel Brooke Alcorn | Rachel Brooke Alcorn | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 17 Oct 2009 | 17 Oct 2009 | ✓ |
|   place | Norfolk, Virginia, USA | Norfolk, Virginia, USA | ✓ |
| spouse | Michael Paul Selbe | Michael Paul Selbe | ✓ |

### ancestry-record / momarriages-504688469 — 100% (8/8, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=momarriages&h=504688469>

| Field | Before | After | |
|---|---|---|---|
| name | Dora Mae Thurman | Dora Mae Thurman | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | abt 1926 | abt 1926 | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 11 Jul 1942 | 11 Jul 1942 | ✓ |
|   place | Belton, Cass, Missouri | Belton, Cass, Missouri | ✓ |
| parent | Mrs Glenn Crofoot | Mrs Glenn Crofoot | ✓ |
| spouse | Mr Anthony Giambrone | Mr Anthony Giambrone | ✓ |

### ancestry-record / nypl-14261124 — 40% (4/10, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=nypl&h=14261124>

| Field | Before | After | |
|---|---|---|---|
| name | Mich Thurman | Mich Thurman | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | abt 1816 | abt 1816 | ✓ |
| fact Immigration | Immigration |  | ✗ |
|   date | 23 May 1874 |  | ✗ |
|   place | New York, New York |  | ✗ |
| fact Emigration | Emigration |  | ✗ |
|   place | Bremen, Germany |  | ✗ |
| fact Ethnicity | Ethnicity |  | ✗ |

### ancestry-record / HonoluluPL-574941 — 40% (4/10, labels)

<https://search.ancestry.com/cgi-bin/sse.dll?h=574941&db=HonoluluPL&indiv=1>

| Field | Before | After | |
|---|---|---|---|
| name | Grace Thurman | Grace Thurman | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | abt 1872 | abt 1872 | ✓ |
| fact Immigration | Immigration |  | ✗ |
|   date | 9 May 1935 |  | ✗ |
|   place | Honolulu, Hawaii |  | ✗ |
| fact Emigration | Emigration |  | ✗ |
|   date | 3 May 1935 |  | ✗ |
|   place | Los Angeles, California |  | ✗ |

### archieven / birth — 83% (5/6, labels)

<https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=236&miaet=54&micode=358.46-11882&minr=9459325&miview=ldt>

| Field | Before | After | |
|---|---|---|---|
| name | Dirk Kruijd | Kruijd | ✗ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 26 January 1882 | 26-01-1882 | ✓ |
| parent | Dirk Kruijd | Dirk Achternaam: Kruijd | ✓ |
| parent | Geertruida Ophof | Geertruida Ophof Voornaam: Geertruida Achternaam: Ophof | ✓ |
| child |  | Dirk Kruijd | + |

### archieven / death — 88% (7/8, labels)

<https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=236&miaet=54&micode=358.46-31886&minr=35717082&miview=ldt>

| Field | Before | After | |
|---|---|---|---|
| name | Anna Kruijd | Kruijd | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   place | Haarlem | Haarlem | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 25 January 1886 | 25-01-1886 | ✓ |
|   place | Haarlem | Haarlem | ✓ |
| parent | Dirk Kruijd | Dirk Achternaam: Kruijd | ✓ |
| parent | Geertruida Ophof | Geertruida Ophof Voornaam: Geertruida Achternaam: Ophof | ✓ |

### archieven / marriage — 64% (7/11, labels)

<https://www.archieven.nl/nl/zoeken?mivast=0&mizig=310&miadt=236&miaet=54&micode=358.6-3731&minr=44521711&miview=ldt>

| Field | Before | After | |
|---|---|---|---|
| name | Dirk Kruijd | Kruijd | ✗ |
| gender | Male |  | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   place | Haarlem | Haarlem, Amsterdam | ✓ |
| fact Occupation | Occupation | Occupation | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 17 January 1940 | 17-01-1940 | ✓ |
|   place | Amsterdam | Amsterdam | ✓ |
| parent | Willem Kruijd |  | ✗ |
| parent | Hendrika Maria Remer |  | ✗ |
| spouse | Angeneta de Graaf | Angeneta de Graaf Voornaam: Angeneta Tussenvoegsel: de Achternaam: Graaf Geboorteplaats: Amsterdam Leeftijd: 22 | ✓ |

### awm / ww2 — 71% (5/7, labels)

<https://www.awm.gov.au/collection/R1694649>

| Field | Before | After | |
|---|---|---|---|
| name | Douglas Whyte | Roll of Honour Douglas Whyte | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 31 October 1942 | 31 October 1942 | ✓ |
|   place | Egypt | Egypt | ✓ |
| fact Burial | Burial |  | ✗ |
|   place | El Alamein War Cemetery, El Alamein, Marsa Matruh, Egypt |  | ✗ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |

### awm / ww1-memorial — 78% (7/9, labels)

<https://www.awm.gov.au/collection/R1661477>

| Field | Before | After | |
|---|---|---|---|
| name | Robert Slessar | Roll of Honour Robert Slessar | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 27 August 1916 | 27 August 1916 | ✓ |
|   place | France | France | ✓ |
| fact Burial | Burial |  | ✗ |
|   place | Villers-Bretonneux Memorial, Villers-Bretonneux, Picardie, France |  | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   place | Pakenham East, Victoria, Australia | Pakenham East, Victoria, Australia | ✓ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |
| fact Birth |  | Birth · about 1886 | + |

### awm / ww1-cemetery — 78% (7/9, labels)

<https://www.awm.gov.au/collection/R1713831>

| Field | Before | After | |
|---|---|---|---|
| name | Michael George Coghlan | Roll of Honour Michael George Coghlan | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 3 May 1917 | 03 May 1917 | ✓ |
|   place | France | France | ✓ |
| fact Burial | Burial |  | ✗ |
|   place | Grevillers British Cemetery, Grevillers, Picardie, France |  | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   place | Brisbane, Queensland, Australia | Brisbane, Queensland, Australia | ✓ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |
| fact Birth |  | Birth · about 1894 | + |

### billiongraves / Lucinda — 100% (5/5, json)

<https://billiongraves.com/grave/LUCINDA-CLARK/216756>

| Field | Before | After | |
|---|---|---|---|
| name | Lucinda Clark | LUCINDA CLARK | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 9 Jun 1900 | 9 Jun 1900 | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Oakes Cemetery, Bentonville, Benton, Arkansas, United States | Oakes Cemetery, Bentonville, Arkansas, United States | ✓ |

### billiongraves / Joseph — 100% (7/7, json)

<https://billiongraves.com/grave/JOSEPH-CLARK/245670>

| Field | Before | After | |
|---|---|---|---|
| name | Joseph Clark | JOSEPH CLARK | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 7 Oct 1798 | 7 Oct 1798 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 25 Oct 1866 | 25 Oct 1866 | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Pleasant Grove City Cemetery, Pleasant Grove, Utah, Utah, United States | Pleasant Grove City Cemetery, Pleasant Grove, Utah, United States | ✓ |

### cvwm / signalman — 64% (9/14, labels+narrative)

<https://www.veterans.gc.ca/eng/remembrance/memorials/canadian-virtual-war-memorial/detail/2659509>

| Field | Before | After | |
|---|---|---|---|
| name | George Rodrigues | Signalman George Rodrigues | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | November 25, 1918 | November 25, 1918 | ✓ |
|   place | Montreal, Québec | Montreal, Québec | ✓ |
| fact Death | Death | Death | ✓ |
|   date | May 26, 1945 | May 26, 1945 | ✓ |
| fact Burial | Burial |  | ✗ |
|   place | Groesbeek Memorial |  | ✗ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |
|   date | May 28, 1941 |  | ✗ |
|   place | Montreal South, Québec |  | ✗ |
| parent | Joseph Rodrigues |  | ✗ |
| parent | Ada Rodrigues | Ada Rodrigues. Digital | ✓ |
| parent |  | Joseph Digital | + |

### cvwm / parents-spouse — 80% (8/10, labels+narrative)

<https://veterans.gc.ca/en/remembrance/memorials/canadian-virtual-war-memorial/detail/316485>

| Field | Before | After | |
|---|---|---|---|
| name | Arthur Edward Warman | Private Arthur Edward Warman | ✓ |
| gender | Male | Male | ✓ |
| fact Death | Death | Death | ✓ |
|   date | September 2, 1918 | September 2, 1918 | ✓ |
| fact Burial | Burial |  | ✗ |
|   place | Dominion Cemetery |  | ✗ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |
| fact Birth |  | Birth · about 1873 | + |
| parent | John Warman | John Warman | ✓ |
| parent | Mary Warman | Mary Warman | ✓ |
| spouse | Flora Warman | Flora Warman | ✓ |

### cvwm / minimal — 75% (6/8, labels)

<https://www.veterans.gc.ca/eng/remembrance/memorials/canadian-virtual-war-memorial/detail/1577024>

| Field | Before | After | |
|---|---|---|---|
| name | James Ward | Private James Ward | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | October 6, 1880 | October 6, 1880 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | August 25, 1917 | August 25, 1917 | ✓ |
| fact Burial | Burial |  | ✗ |
|   place | Vimy Memorial |  | ✗ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |

### cvwm / airman — 80% (12/15, labels+narrative)

<https://www.veterans.gc.ca/eng/remembrance/memorials/canadian-virtual-war-memorial/detail/2967727>

| Field | Before | After | |
|---|---|---|---|
| name | Gerald Waldo Gates | Sergeant Gerald Waldo Gates | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | September 19, 1916 | September 19, 1916 | ✓ |
|   place | Port Williams, Nova Scotia | Port Williams, Nova Scotia | ✓ |
| fact Death | Death | Death | ✓ |
|   date | September 12, 1941 | September 12, 1941 | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Rosskeen Parish Chyd Extns (Or Burial Grd) | Remembering uncle & nephew lost … Brothers In Arms Memorial, Zonnebeke, BE … photo courtesy of Marg Liessens … May 2022 | ✗ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |
|   date | July 17, 1940 |  | ✗ |
|   place | Halifax, Nova Scotia |  | ✗ |
| parent | Justin E. Gates | Justin E. Gates | ✓ |
| parent | Viola Gates | Viola Gates | ✓ |
| spouse | Mary Winnifred Gates | Mary Winnifred Gates | ✓ |

### digitalarkivet / census-child — 47% (7/15, labels)

<https://www.digitalarkivet.no/en/census/person/pf01036395003804>

| Field | Before | After | |
|---|---|---|---|
| name | Even Ausdal | Even Ausdal | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1900-01-13 | 1900-01-13 | ✓ |
|   place | Ringsaker | Ringsaker, Biri, Brandbu | ✓ |
| fact Census | Census |  | ✗ |
|   date | 1910 |  | ✗ |
|   place | Kampetin, Nes, Norway |  | ✗ |
| fact Residence | Residence |  | ✗ |
|   date | 1910 |  | ✗ |
|   place | Kampetin, Nes, Norway |  | ✗ |
| fact Occupation | Occupation | Occupation | ✓ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| parent | Emil Ausdal |  | ✗ |
| parent | Ingeborg Evensdatter |  | ✗ |

### digitalarkivet / census-parent — 30% (7/23, labels)

<https://www.digitalarkivet.no/en/census/person/pf01036395003799>

| Field | Before | After | |
|---|---|---|---|
| name | Emil Ausdal | Emil Ausdal | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1874-07-26 | 1874-07-26 | ✓ |
|   place | Biri | Biri, Ringsaker, Brandbu | ✓ |
| fact Census | Census |  | ✗ |
|   date | 1910 |  | ✗ |
|   place | Kampetin, Nes, Norway |  | ✗ |
| fact Residence | Residence |  | ✗ |
|   date | 1910 |  | ✗ |
|   place | Kampetin, Nes, Norway |  | ✗ |
| fact Occupation | Occupation | Occupation | ✓ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| spouse | Ingeborg Evensdatter |  | ✗ |
| child | Andreas Ausdal |  | ✗ |
| child | Ivar Ausdal |  | ✗ |
| child | Birgitta Ausdal |  | ✗ |
| child | Even Ausdal |  | ✗ |
| child | Emil Ausdal |  | ✗ |
| child | Erik Ausdal |  | ✗ |
| child | Martin Ausdal |  | ✗ |
| child | Paul Ausdal |  | ✗ |
| child | Marie Ausdal |  | ✗ |

### digitalarkivet / census — 54% (7/13, labels)

<https://www.digitalarkivet.no/en/census/person/pf01036392011143>

| Field | Before | After | |
|---|---|---|---|
| name | Oddbjørg Stenberg | Oddbjørg Stenberg | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1904-10-08 | 1904-10-08 | ✓ |
|   place | Kristiania | Kristiania, Kr.sand S, Romedal, Fredrikshald, Aadalen, Gefle, Tvedestrand, Rena, Østerdalen, Paris, Brønnøy, Elverum, Aamot Østerdalen, Sarpsborg, Furnes, Aasnes, Horten | ✓ |
| fact Census | Census |  | ✗ |
|   date | 1910 |  | ✗ |
|   place | Toldbodgate 24, Kristiania, Norway |  | ✗ |
| fact Residence | Residence |  | ✗ |
|   date | 1910 |  | ✗ |
|   place | Toldbodgate 24, Kristiania, Norway |  | ✗ |
| fact Occupation | Occupation | Occupation | ✓ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| child |  | Aslaug Kilde Halvorsen | + |

### digitalarkivet / baptism — 22% (2/9, labels)

<https://www.digitalarkivet.no/en/view/255/pd00000002336109>

| Field | Before | After | |
|---|---|---|---|
| name | Ole Hanssen | Ole Hanssen | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth |  | ✗ |
|   date | 1880-11-29 |  | ✗ |
| fact Baptism | Baptism |  | ✗ |
|   date | 1880-12-25 |  | ✗ |
|   place | Orkdal, Sør-Trøndelag, Norway |  | ✗ |
| fact Marriage |  | Marriage · Orkdal Historielag | + |
| fact Residence |  | Residence · Metliaas | + |
| fact MilitaryService |  | MilitaryService | + |
| parent | Hans Poulsen |  | ✗ |
| parent | Maren Olsdtr |  | ✗ |

### digitalarkivet / godparent — 100% (2/2, labels)

<https://www.digitalarkivet.no/en/view/255/pd00000001628035>

| Field | Before | After | |
|---|---|---|---|
| name | Karen Kirstine | Karen Kirstine | ✓ |
| gender | Female | Female | ✓ |
| fact Birth |  | Birth · 1807 | + |
| fact Marriage |  | Marriage · Slekt og Data Salten Nordland | + |
| fact MilitaryService |  | MilitaryService | + |

### digitalarkivet / marriage — 63% (5/8, labels)

<https://www.digitalarkivet.no/en/view/327/pv00000000838891>

| Field | Before | After | |
|---|---|---|---|
| name | Tomas Hansen Hansen | Tomas Hansen Hansen!! | ✓ |
| gender | Male | Male | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   place | Landero | Landero | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 1789-07-02 | 1789 | ✗ |
|   place | Sund, Hordaland, Norway | AMF - Ancestry, MyHeritage and FamilySearch | ✗ |
| fact MilitaryService |  | MilitaryService | + |
| spouse | Christi Nilsdtr. |  | ✗ |

### digitalarkivet / burial — 17% (1/6, labels)

<https://www.digitalarkivet.no/en/view/267/pg00000003109668>

| Field | Before | After | |
|---|---|---|---|
| name | Hansen Hansen | Hansen Hansen | ✓ |
| fact Death | Death |  | ✗ |
|   date | 1859-01-26 |  | ✗ |
| fact Burial | Burial |  | ✗ |
|   date | 1859-02-07 |  | ✗ |
|   place | Romedal, Hedmark, Norway |  | ✗ |
| fact Marriage |  | Marriage · AMF - Ancestry, MyHeritage and FamilySearch | + |
| fact MilitaryService |  | MilitaryService | + |

### familysearch-ancestors-public / charlotte — 90% (9/10, jsonld)

<https://ancestors.familysearch.org/en/LHLL-QFD/charlotte-burnett-1850-1910>

| Field | Before | After | |
|---|---|---|---|
| name | Charlotte Burnett | Charlotte Burnett | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | June 1850 | +1850-06 | ✗ |
|   place | Spartanburg, South Carolina, United States | Spartanburg, South Carolina, United States | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 1910 | +1910 | ✓ |
|   place | Cherokee Springs, Spartanburg, South Carolina, United States | Cherokee Springs, Spartanburg, South Carolina, United States | ✓ |
| parent | Elias Charles Burnett | Elias Charles Burnett | ✓ |
| parent | Malissa F Gilbert | Malissa F Gilbert | ✓ |

### familysearch-ancestors-public / lee — 93% (14/15, jsonld)

<https://ancestors.familysearch.org/en/LWX9-DJD/robert-e-lee-1858-1920>

| Field | Before | After | |
|---|---|---|---|
| name | Robert E Lee | Robert E Lee | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | January 1858 | +1858-01 | ✗ |
|   place | Kentucky, United States | Kentucky, United States | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 11 June 1920 | +1920-06-11 | ✓ |
|   place | Louisville, Jefferson, Kentucky, United States | Louisville, Jefferson, Kentucky, United States | ✓ |
| parent | Granville W Lee | Granville W Lee | ✓ |
| parent | Diana Hendren | Diana Hendren | ✓ |
| spouse | Mary Smith Barnett | Mary Smith Barnett | ✓ |
| spouse | Letha A Morton | Letha A Morton | ✓ |
| child | William Lee | William Lee | ✓ |
| child | Loral William Lee | Loral William Lee | ✓ |
| child | Mirtel Lee | Mirtel Lee | ✓ |

### findagrave-new / raymond-zierak — 100% (9/9, microdata+labels+narrative)

<https://new.findagrave.com/memorial/65630115>

| Field | Before | After | |
|---|---|---|---|
| name | Raymond J. Zierak | Raymond J. Zierak | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | 9 Mar 1914 | 9 Mar 1914 | ✓ |
|   place | Amsterdam, Montgomery County, New York, USA | Amsterdam, Montgomery County, New York, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 3 Apr 2006 | 3 Apr 2006 | ✓ |
|   place | Amsterdam, Montgomery County, New York, USA | Amsterdam, Montgomery County, New York, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Saint Stanislaus Cemetery, Amsterdam, Montgomery County, New York, USA | Saint Stanislaus Cemetery Amsterdam, Montgomery County, New York, USA | ✓ |
| parent |  | Albert Graduated | + |
| parent |  | Mary Sajta Zierak. Graduated | + |

### findagrave-new / patty-duke — 100% (12/12, microdata+labels+narrative)

<https://new.findagrave.com/memorial/160192994>

| Field | Before | After | |
|---|---|---|---|
| name | Patty Duke | Patty Duke | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 14 Dec 1946 | 14 Dec 1946 | ✓ |
|   place | Elmhurst, Queens County, New York, USA | Elmhurst, Queens County, New York, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 29 Mar 2016 | 29 Mar 2016 | ✓ |
|   place | Coeur d'Alene, Kootenai County, Idaho, USA | Coeur d'Alene, Kootenai County, Idaho, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Forest Cemetery, Coeur d'Alene, Kootenai County, Idaho, USA | Forest Cemetery Coeur d'Alene, Kootenai County, Idaho, USA | ✓ |
| parent | John Patrick Duke | John Patrick Duke | ✓ |
| parent | Frances Margaret McMahon Duke | Frances Margaret McMahon Duke | ✓ |
| spouse | Harry Falk | Harry Falk | ✓ |

### findagrave-new / nancy-reagan — 100% (12/12, microdata+labels+narrative)

<https://new.findagrave.com/memorial/7657594>

| Field | Before | After | |
|---|---|---|---|
| name | Nancy Reagan | Nancy Reagan | ✓ |
| gender |  | Female | + |
| fact Birth | Birth | Birth | ✓ |
|   date | 6 Jul 1921 | 6 Jul 1921 | ✓ |
|   place | New York, New York County (Manhattan), New York, USA | New York, New York County (Manhattan), New York, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 6 Mar 2016 | 6 Mar 2016 | ✓ |
|   place | Bel Air, Los Angeles County, California, USA | Bel Air, Los Angeles County, California, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Ronald W Reagan Presidential Library, Simi Valley, Ventura County, California, USA | Ronald W Reagan Presidential Library Simi Valley, Ventura County, California, USA | ✓ |
| parent | Kenneth Seymour Robbins | Kenneth Seymour Robbins | ✓ |
| parent | Edith Prescott Luckett Davis | Edith Prescott Luckett Davis | ✓ |
| spouse | Ronald Wilson Reagan | Ronald Wilson Reagan | ✓ |

### findagrave-new / ronald-reagan — 100% (15/15, microdata+labels+narrative)

<https://new.findagrave.com/memorial/4244>

| Field | Before | After | |
|---|---|---|---|
| name | Ronald Wilson Reagan | Ronald Wilson Reagan | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | 6 Feb 1911 | 6 Feb 1911 | ✓ |
|   place | Tampico, Whiteside County, Illinois, USA | Tampico, Whiteside County, Illinois, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 5 Jun 2004 | 5 Jun 2004 | ✓ |
|   place | Bel Air, Los Angeles County, California, USA | Bel Air, Los Angeles County, California, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Ronald W Reagan Presidential Library, Simi Valley, Ventura County, California, USA | Ronald W Reagan Presidential Library Simi Valley, Ventura County, California, USA | ✓ |
| parent | John Edward Reagan | John Edward Reagan | ✓ |
| parent | Nelle Clyde Wilson Reagan | Nelle Clyde Wilson Reagan | ✓ |
| spouse | Nancy Reagan | Nancy Reagan | ✓ |
| spouse | Jane Wyman | Jane Wyman | ✓ |
| child | Maureen Elizabeth Reagan | Maureen Elizabeth Reagan | ✓ |
| child | Christine Reagan | Christine Reagan | ✓ |

### findagrave-new / ronald-reagan-sh — 100% (13/13, microdata+labels+narrative)

<https://new.findagrave.com/cemetery/online/4244>

| Field | Before | After | |
|---|---|---|---|
| name | Ronald Wilson Reagan | Ronald Wilson Reagan | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | 6 Feb 1911 | 6 Feb 1911 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 5 Jun 2004 | 5 Jun 2004 | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Ronald W Reagan Presidential Library, Simi Valley, Ventura County, California, USA | Ronald W Reagan Presidential Library Simi Valley, Ventura County, California, USA | ✓ |
| parent | John Edward Reagan | John Edward Reagan | ✓ |
| parent | Nelle Clyde Wilson Reagan | Nelle Clyde Wilson Reagan | ✓ |
| spouse | Nancy Reagan | Nancy Reagan | ✓ |
| spouse | Jane Wyman | Jane Wyman | ✓ |
| child | Maureen Elizabeth Reagan | Maureen Elizabeth Reagan | ✓ |
| child | Christine Reagan | Christine Reagan | ✓ |

### findagrave-new / kenneth-robbins — 100% (13/13, microdata+labels+narrative)

<https://new.findagrave.com/memorial/153242774>

| Field | Before | After | |
|---|---|---|---|
| name | Kenneth Seymour Robbins | Kenneth Seymour Robbins | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | 23 Feb 1894 | 23 Feb 1894 | ✓ |
|   place | Pittsfield, Berkshire County, Massachusetts, USA | Pittsfield, Berkshire County, Massachusetts, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 2 Feb 1972 | 2 Feb 1972 | ✓ |
|   place | Sparta, Sussex County, New Jersey, USA | Sparta, Sussex County, New Jersey, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Pittsfield Cemetery, Pittsfield, Berkshire County, Massachusetts, USA | Pittsfield Cemetery Pittsfield, Berkshire County, Massachusetts, USA | ✓ |
| fact Census |  | Census · 1930 | + |
| fact Marriage |  | Marriage · 27 June 1916 · Burlington, Chittenden, Vermont, United States | + |
| parent | John Newell Robbins | John Newell Robbins | ✓ |
| parent | Ann Ayers Francis Robbins | Ann Ayers Francis Robbins | ✓ |
| spouse | Edith Prescott Luckett Davis | Edith Prescott Luckett Davis | ✓ |
| child | Nancy Reagan | Nancy Reagan | ✓ |
| parent |  | Ann Ayers Francis He | + |
| spouse |  | Edith Prescott Luckett | + |
| spouse |  | Ronald Wilson Reagan | + |
| spouse |  | Edith Prescott Luckett | + |
| spouse |  | Ronald Wilson Reagan | + |

### findagrave-new / thomas-york — 100% (17/17, microdata+labels+narrative)

<https://new.findagrave.com/memorial/38398001>

| Field | Before | After | |
|---|---|---|---|
| name | Thomas York   Sr | Thomas York , Sr | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1771 | 1771 | ✓ |
|   place | Rutherford County, North Carolina, USA | Rutherford County, North Carolina, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 1846 | 1846 | ✓ |
|   place | Fentress County, Tennessee, USA | Fentress County, Tennessee, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Bills Creek Cemetery, Fentress County, Tennessee, USA | Bills Creek Cemetery Fentress County, Tennessee, USA | ✓ |
| parent | James York | James York | ✓ |
| parent | Lucinda McPherson York | Lucinda McPherson York | ✓ |
| spouse | Martha Frances Mitchel York | Martha Frances Mitchel York | ✓ |
| child | John William York | John William York | ✓ |
| child | Andrew W York | Andrew W York | ✓ |
| child | Charlotte York | Charlotte York | ✓ |
| child | Thomas Jefferson York | Thomas Jefferson York | ✓ |
| child | William York | William York | ✓ |

### findagrave-new / boleslaw-barejka — 86% (6/7, microdata+labels)

<https://new.findagrave.com/memorial/40207050>

| Field | Before | After | |
|---|---|---|---|
| name | Boleslaw Barejka | Boleslaw Barejka | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | unknown | unknown | ✗ |
| fact Death | Death | Death | ✓ |
|   date | 5 Apr 1970 | 5 Apr 1970 | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Saint Stanislaus Cemetery, Amsterdam, Montgomery County, New York, USA | Saint Stanislaus Cemetery Amsterdam, Montgomery County, New York, USA | ✓ |

### findagrave-new / robert-coe — 93% (14/15, microdata+labels+narrative)

<https://new.findagrave.com/memorial/37494703>

| Field | Before | After | |
|---|---|---|---|
| name | Robert Coe | Robert Coe | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | Oct 1596 | Oct 1596 | ✓ |
|   place | Haverhill, St Edmundsbury Borough, Suffolk, England | Haverhill, St Edmundsbury Borough, Suffolk, England | ✓ |
| fact Death | Death | Death | ✓ |
|   date | unknown | between 20 Jun 1687 | ✗ |
|   place | Hempstead, Nassau County, New York, USA | Hempstead, Nassau County, New York, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Non-Cemetery Burial | Non-Cemetery Burial | ✓ |
| fact Baptism |  | Baptism · 26 Oct 1596 · son of Henry & Mary (Vincent) Coe. Came from Boxford, Suffolk,to Massachusetts Bay in 1634 on the "Francis." With Robert, age 38, on the ship, "Francis" were his second wife, Hannah age 43, and children: John 8, Robert 7, Benjamin 5 (all children of his first wife, Mary). In the record at the Custom House in Ipswich, the family surname is spelled "Cooe". | + |
| fact Marriage |  | Marriage · 1625 · Mary ____. She was buried at Boxford, Suffolk, 27 Oct 1628. | + |
| spouse | Mary Crabbe Coe | Mary Crabbe Coe | ✓ |
| spouse | Hannah Dearslay Coe | Hannah Dearslay Coe | ✓ |
| spouse | Jane Coe | Jane Coe | ✓ |
| child | John Coe | John Coe | ✓ |
| child | Robert Coe | Robert Coe | ✓ |
| child | Benjamin Coe | Benjamin Coe | ✓ |
| parent |  | Henry | + |
| parent |  | Mary | + |
| spouse |  | Barthalomew Smith | + |

### findagrave-new / alfred-zandell — 92% (12/13, microdata+labels)

<https://www.findagrave.com/memorial/53317193>

| Field | Before | After | |
|---|---|---|---|
| name | Alfred C. Zandell | Alfred C. Zandell | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1876 | 1876 | ✓ |
|   place | Washington, USA | Washington, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 28 Jul 1939 | 28 Jul 1939 | ✓ |
|   place | Walla Walla, Walla Walla County, Washington, USA | Walla Walla, Walla Walla County, Washington, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Mountain View Cemetery, Walla Walla, Walla Walla County, Washington, USA | Mountain View Cemetery Walla Walla, Walla Walla County, Washington, USA | ✓ |
| parent | John August Zandell | August Zandell | ✓ |
| parent | Elizabeth Metcalf Zandell |  | ✗ |
| spouse | Ella Theresa Draper Zandell | Ella Theresa Draper Zandell | ✓ |
| child | Mary Zandell | Mary Zandell | ✓ |
| parent |  | Elizabeth | + |

### findagrave / raymond-zierak — 89% (8/9, labels+narrative)

<https://findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=65630115>

| Field | Before | After | |
|---|---|---|---|
| name | Raymond J. Zierak | Raymond J. Zierak | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | Mar. 9,  1914 | Mar. 9, 1914 | ✓ |
|   place | Amsterdam, Montgomery County, New York, USA | Amsterdam Montgomery County New York, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Apr. 3,  2006 | Apr. 3, 2006 | ✓ |
|   place | Amsterdam, Montgomery County, New York, USA | Amsterdam Montgomery County New York, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Saint Stanislaus Cemetery, Amsterdam, Montgomery County, New York, USA | Saint Stanislaus Cemetery | ✗ |
| parent |  | Albert Graduated | + |
| parent |  | Mary Sajta Zierak. Graduated | + |

### findagrave / patty-duke — 92% (11/12, labels+narrative)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=160192994>

| Field | Before | After | |
|---|---|---|---|
| name | Patty Duke | Patty Duke | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Dec. 14,  1946 | Dec. 14, 1946 | ✓ |
|   place | Elmhurst, Queens County, New York, USA | Elmhurst Queens County New York, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Mar. 29,  2016 | Mar. 29, 2016 | ✓ |
|   place | Coeur d'Alene, Kootenai County, Idaho, USA | Coeur d'Alene Kootenai County Idaho, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Forest Cemetery, Coeur d'Alene, Kootenai County, Idaho, USA | Forest Cemetery | ✗ |
| parent | John Patrick Duke | John Patrick Duke | ✓ |
| parent | Frances Margaret McMahon Duke | Frances Margaret McMahon Duke | ✓ |
| spouse | Harry Falk | Harry Falk | ✓ |

### findagrave / nancy-reagan — 92% (11/12, labels+narrative)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=7657594>

| Field | Before | After | |
|---|---|---|---|
| name | Nancy Reagan | Nancy Reagan | ✓ |
| gender |  | Female | + |
| fact Birth | Birth | Birth | ✓ |
|   date | Jul. 6,  1921 | Jul. 6, 1921 | ✓ |
|   place | New York, New York County (Manhattan), New York, USA | New York New York County (Manhattan) New York, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Mar. 6,  2016 | Mar. 6, 2016 | ✓ |
|   place | Bel Air, Los Angeles County, California, USA | Bel Air Los Angeles County California, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Ronald W. Reagan Presidential Library, Simi Valley, Ventura County, California, USA | Ronald W. Reagan Presidential Library | ✗ |
| parent | Kenneth Seymour Robbins | Kenneth Seymour Robbins | ✓ |
| parent | Edith Prescott Luckett Davis | Edith Prescott Luckett Davis | ✓ |
| spouse | Ronald Wilson Reagan | Ronald Wilson Reagan | ✓ |

### findagrave / ronald-reagan — 93% (14/15, labels+narrative)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=4244>

| Field | Before | After | |
|---|---|---|---|
| name | Ronald Wilson Reagan | Ronald Wilson Reagan | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | Feb. 6,  1911 | Feb. 6, 1911 | ✓ |
|   place | Tampico, Whiteside County, Illinois, USA | Tampico Whiteside County Illinois, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Jun. 5,  2004 | Jun. 5, 2004 | ✓ |
|   place | Bel Air, Los Angeles County, California, USA | Bel Air Los Angeles County California, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Ronald W. Reagan Presidential Library, Simi Valley, Ventura County, California, USA | Ronald W. Reagan Presidential Library | ✗ |
| parent | John Edward Reagan | John Edward Reagan | ✓ |
| parent | Nelle Clyde Wilson Reagan | Nelle Clyde Wilson Reagan | ✓ |
| spouse | Nancy Reagan | Nancy Reagan | ✓ |
| spouse | Jane Wyman | Jane Wyman | ✓ |
| child | Maureen Elizabeth Reagan | Maureen Elizabeth Reagan | ✓ |
| child | Christine Reagan | Christine Reagan | ✓ |

### findagrave / ronald-reagan-sh — 93% (14/15, labels+narrative)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=sh&GRid=4244>

| Field | Before | After | |
|---|---|---|---|
| name | Ronald Wilson Reagan | Ronald Wilson Reagan | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | Feb. 6,  1911 | Feb. 6, 1911 | ✓ |
|   place | Tampico, Whiteside County, Illinois, USA | Tampico Whiteside County Illinois, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Jun. 5,  2004 | Jun. 5, 2004 | ✓ |
|   place | Bel Air, Los Angeles County, California, USA | Bel Air Los Angeles County California, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Ronald W. Reagan Presidential Library, Simi Valley, Ventura County, California, USA | Ronald W. Reagan Presidential Library | ✗ |
| parent | John Edward Reagan | John Edward Reagan | ✓ |
| parent | Nelle Clyde Wilson Reagan | Nelle Clyde Wilson Reagan | ✓ |
| spouse | Nancy Reagan | Nancy Reagan | ✓ |
| spouse | Jane Wyman | Jane Wyman | ✓ |
| child | Maureen Elizabeth Reagan | Maureen Elizabeth Reagan | ✓ |
| child | Christine Reagan | Christine Reagan | ✓ |

### findagrave / kenneth-robbins — 92% (12/13, labels+narrative)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=153242774>

| Field | Before | After | |
|---|---|---|---|
| name | Kenneth Seymour Robbins | Kenneth Seymour Robbins | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | Feb. 23,  1894 | Feb. 23, 1894 | ✓ |
|   place | Pittsfield, Berkshire County, Massachusetts, USA | Pittsfield Berkshire County Massachusetts, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Feb. 2,  1972 | Feb. 2, 1972 | ✓ |
|   place | Sparta, Sussex County, New Jersey, USA | Sparta Sussex County New Jersey, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Pittsfield Cemetery, Pittsfield, Berkshire County, Massachusetts, USA | Pittsfield Cemetery | ✗ |
| fact Census |  | Census · 1930 | + |
| fact Marriage |  | Marriage · 27 June 1916 · Burlington, Chittenden, Vermont, United States | + |
| parent | John Newell Robbins | John Newell Robbins | ✓ |
| parent | Ann Ayers Francis Robbins | Ann Ayers Francis Robbins | ✓ |
| spouse | Edith Prescott Luckett Davis | Edith Prescott Luckett Davis | ✓ |
| child | Nancy Reagan | Nancy Reagan | ✓ |
| parent |  | Ann Ayers Francis He | + |
| spouse |  | Edith Prescott Luckett | + |
| spouse |  | Ronald Wilson Reagan | + |

### findagrave / thomas-york — 94% (15/16, labels+narrative)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=38398001>

| Field | Before | After | |
|---|---|---|---|
| name | Thomas Jefferson York  I | Thomas Jefferson York, I | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1771 | 1771 | ✓ |
|   place | North Carolina, USA | North Carolina, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 1846 | 1846 | ✓ |
|   place | Fentress County, Tennessee, USA | Fentress County Tennessee, USA | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Bills Creek Cemetery, Fentress County, Tennessee, USA | Bills Creek Cemetery | ✗ |
| parent | William York | William York | ✓ |
| spouse | Martha Frances Mitchel York | Martha Frances Mitchel York | ✓ |
| child | John William York | John William York | ✓ |
| child | Andrew W York | Andrew W York | ✓ |
| child | Charlotte York | Charlotte York | ✓ |
| child | Thomas Jefferson York | Thomas Jefferson York | ✓ |
| child | William York | William York | ✓ |

### findagrave / boleslaw-barejka — 80% (4/5, labels)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GScid=2140420&GRid=40207050>

| Field | Before | After | |
|---|---|---|---|
| name | Boleslaw Barejka | Boleslaw Barejka | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Apr. 5,  1970 | Apr. 5, 1970 | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Saint Stanislaus Cemetery, Amsterdam, Montgomery County, New York, USA | Saint Stanislaus Cemetery | ✗ |

### findagrave / robert-coe — 80% (12/15, labels+narrative)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=37494703>

| Field | Before | After | |
|---|---|---|---|
| name | Robert Coe | Robert Coe | ✓ |
| gender |  | Male | + |
| fact Birth | Birth | Birth | ✓ |
|   date | Oct.,  1596 | 1596 | ✗ |
|   place | Haverhill, England | Haverhill, England | ✓ |
| fact Death | Death | Death | ✓ |
|   date | unknown | between 20 Jun 1687 | ✗ |
|   place | Hempstead, Nassau County, New York, USA | (when he acknowledged a deed & 28 Jun 1690 (when his widow sold land on her own account) | ✗ |
| fact Burial | Burial | Burial | ✓ |
|   place | Non-Cemetery Burial | Non-Cemetery Burial | ✓ |
| fact Baptism |  | Baptism · 26 Oct 1596 · son of Henry & Mary (Vincent) Coe. Came from Boxford, Suffolk,to Massachusetts Bay in 1634 on the "Francis." With Robert, age 38, on the ship, "Francis" were his second wife, Hannah age 43, and children: John 8, Robert 7, Benjamin 5 (all children of his first wife, Mary). In the record at the Custom House in Ipswich, the family surname is spelled "Cooe". | + |
| fact Marriage |  | Marriage · 1625 · Mary ____. She was buried at Boxford, Suffolk, 27 Oct 1628. | + |
| spouse | Mary Coe | Mary Coe | ✓ |
| spouse | Hannah Dearslay Coe | Hannah Dearslay Coe | ✓ |
| spouse | Jane Coe | Jane Coe | ✓ |
| child | John Coe | John Coe | ✓ |
| child | Robert Coe | Robert Coe | ✓ |
| child | Benjamin Coe | Benjamin Coe | ✓ |
| parent |  | Henry | + |
| parent |  | Mary | + |
| spouse |  | Barthalomew Smith | + |

### findagrave / alfred-zandell — 53% (10/19, labels)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=53317193>

| Field | Before | After | |
|---|---|---|---|
| name | Alfred C. Zandell | Alfred C. Zandell | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1876 | 1876 | ✓ |
|   place | Washington, USA | Washington, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Jul. 28,  1939 | 28 Jul 1939 | ✓ |
|   place | Walla Walla, Walla Walla County, Washington, USA | Walla Walla, Walla Walla, Washington | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Mountain View Cemetery, Walla Walla, Walla Walla County, Washington, USA | Mountain View Cemetery | ✗ |
| parent | John August Zandell | August Zandell | ✓ |
| parent | Elizabeth Metcalf Zandell |  | ✗ |
| spouse | Ella Theresa Draper Zandell |  | ✗ |
| child | Mary Zandell | Mary Zandell | ✓ |
| child | Anna E. Zandell Gallagher |  | ✗ |
| parent | Alfred C. Zandell |  | ✗ |
| child | John Emil Zandell |  | ✗ |
| child | Oscar C Zandell |  | ✗ |
| child | Olivia Josephine Zandell Moore |  | ✗ |
| child | Alexis E Zandell |  | ✗ |
| parent |  | Elizabeth | + |
| spouse |  | Ella T. Draper | + |

### findagrave / blaine-culp — 70% (16/23, labels)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=40352788>

| Field | Before | After | |
|---|---|---|---|
| name | Blaine Merle Culp | Blaine Merle Culp | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Dec. 27,  1884 | Dec. 27, 1884 | ✓ |
|   place | Richmond, Jefferson County, Ohio, USA | Richmond Jefferson County Ohio, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Mar. 24,  1967 | Mar. 24, 1967 | ✓ |
|   place | Canton, Stark County, Ohio, USA | Canton Stark County Ohio, USA [Edit Dates] | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | North Lawn Cemetery, Canton, Stark County, Ohio, USA | [Edit] | ✗ |
| parent | Alonzo M Culp | Alonzo M Culp | ✓ |
| parent | Loretta Catherine Wycoff Culp | Loretta Catherine Wycoff Culp | ✓ |
| spouse | Elizabeth Leota Wallace Culp | Elizabeth Leota Wallace Culp | ✓ |
| spouse | Hazel Evangeline Nelson Culp | Hazel Evangeline Nelson Culp | ✓ |
| child | Kathleen Gloria Culp Plasky | Kathleen Gloria Culp Plasky | ✓ |
| child | Nelson Lee Culp | Nelson Lee Culp | ✓ |
| child | Mary Lois Culp Wilson | Mary Lois Culp Wilson | ✓ |
| child | Martha Louise Culp Stills | Martha Louise Culp Stills | ✓ |
| child | Florence Jane Culp Hunter |  | ✗ |
| child | Ethel Zanthus Culp Newton |  | ✗ |
| child | John Wycoff   Culp |  | ✗ |
| parent | Blaine Merle Culp |  | ✗ |
| child | Frederick Fyre Culp |  | ✗ |
| child | Isaac Newton Culp |  | ✗ |
| child |  | Lloyd Earl Culp | + |
| child |  | Chester Claude Culp | + |

### findagrave / alonzo-culp — 80% (16/20, labels)

<https://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=38266005>

| Field | Before | After | |
|---|---|---|---|
| name | Alonzo M Culp | Alonzo M Culp | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Jul. 15,  1849 | Jul. 15, 1849 | ✓ |
|   place | Jefferson County, Ohio, USA | Jefferson County Ohio, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Jan. 5,  1901 | Jan. 5, 1901 | ✓ |
|   place | New Castle, Lawrence County, Pennsylvania, USA | New Castle Lawrence County Pennsylvania, USA [Edit Dates] | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Richmond Union Cemetery, Richmond, Jefferson County, Ohio, USA | [Edit] | ✗ |
| parent | Nancy Jane Culp Saltsman | Nancy Jane Culp Saltsman | ✓ |
| spouse | Loretta Catherine Wycoff Culp | Loretta Catherine Wycoff Culp | ✓ |
| child | Florence Jane Culp Hunter | Florence Jane Culp Hunter | ✓ |
| child | Ethel Zanthus Culp Newton | Ethel Zanthus Culp Newton | ✓ |
| child | John Wycoff   Culp | John Wycoff Culp | ✓ |
| child | Blaine Merle Culp | Blaine Merle Culp | ✓ |
| child | Frederick Fyre Culp | Frederick Fyre Culp | ✓ |
| child | Isaac Newton Culp | Isaac Newton Culp | ✓ |
| parent | Alonzo M Culp |  | ✗ |
| child | Nancy Saltsman |  | ✗ |
| child | Andrew Otterbein Saltsman |  | ✗ |

### findmypast-record / 1911-england-census-head — 90% (9/10, labels)

<http://search.findmypast.com/record?id=gbc%2f1911%2frg14%2f24584%2f0135%2f1>

| Field | Before | After | |
|---|---|---|---|
| name | Abraham Turner | Abraham Turner | ✓ |
| gender | Male | Male | ✓ |
| fact MaritalStatus | MaritalStatus |  | ✗ |
| fact Occupation | Occupation | Occupation | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1839 | 1839 | ✓ |
|   place | Thornham Lancashire | Thornham Lancashire | ✓ |
| fact Residence |  | Residence · 482 Rochdale Road Royton | + |
| fact Census |  | Census · Royton, Oldham, Lancashire, England | + |
| spouse | Betty Turner | Betty Turner | ✓ |
| child | Elizabeth Turner | Elizabeth Turner | ✓ |
| child | Sarah Turner | Sarah Turner | ✓ |

### findmypast-record / 1911-england-census-daughter — 43% (3/7, labels)

<http://search.findmypast.com/record?id=gbc%2f1911%2frg14%2f24584%2f0135%2f3>

| Field | Before | After | |
|---|---|---|---|
| name | Elizabeth Turner | Abraham Turner | ✗ |
| gender | Female | Male | ✗ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1873 | 1839 | ✗ |
|   place | Shaw Lancashire | Thornham Lancashire | ✓ |
| fact Residence |  | Residence · 482 Rochdale Road Royton | + |
| fact Occupation |  | Occupation | + |
| fact Census |  | Census · Royton, Oldham, Lancashire, England | + |
| parent | Abraham Turner |  | ✗ |
| spouse |  | Betty Turner | + |
| child |  | Elizabeth Turner | + |
| child |  | Sarah Turner | + |

### findmypast-record / 1841-england-census — 60% (3/5, labels)

<http://search.findmypast.com/record?id=gbc%2f1841%2f0005244738>

| Field | Before | After | |
|---|---|---|---|
| name | Abraham Smith | William Smith | ✗ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1839 | 1801 | ✗ |
|   place | Warwickshire | England, Warwickshire | ✓ |
| fact Census |  | Census · Birmingham, Warwickshire, England | + |

### findmypast-record / 1900-us-census — 57% (4/7, labels)

<http://search.findmypast.com/record?id=usc%2f1900%2f004114960%2f00265%2f084>

| Field | Before | After | |
|---|---|---|---|
| name | Wadiswat York | Adam York | ✗ |
| gender | Male | Male | ✓ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1897 | 1862 | ✗ |
|   place | Pennsylvania | Poland (Russ) | ✗ |
| fact Census |  | Census · Allegheny, Pennsylvania | + |
| parent | Adam York | Adam York | ✓ |
| parent |  | Martha York | + |
| parent |  | Martha York | + |

### findmypast-record / england-births-baptisms — 100% (6/6, labels)

<http://search.findmypast.com/record?id=r_931803621>

| Field | Before | After | |
|---|---|---|---|
| name | Turner | Turner | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1656 | 1656 | ✓ |
|   place | BRAMDEAN,HAMPSHIRE,ENGLAND | BRAMDEAN,HAMPSHIRE,ENGLAND | ✓ |
| parent | Robert Turner | Robert Turner | ✓ |

### findmypast-record / england-deaths — 83% (5/6, labels)

<http://search.findmypast.com/record?id=bmd%2fd%2f1896%2f4%2faz%2f000376%2f022>

| Field | Before | After | |
|---|---|---|---|
| name | Marion M D Turner-turner | MARION M D TURNER-TURNER | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1836 | 1836 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 1896 | 1896 | ✓ |
|   place | Reigate, Surrey, England |  | ✗ |

### findmypast-record / england-marriages — 100% (4/4, labels)

<http://search.findmypast.com/record?id=bmd%2fm%2f1878%2f4%2faz%2f000312%2f104>

| Field | Before | After | |
|---|---|---|---|
| name | Gwendoline E F Turner-turner | GWENDOLINE E F TURNER-TURNER | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 1878 | 1878 | ✓ |
|   place | Ringwood, Hampshire, England | RINGWOOD, Hampshire, England | ✓ |

### findmypast-record / us-marriages-male — 40% (2/5, labels)

<http://search.findmypast.com/record?id=us%2ffs%2fm%2f001084854%2f1>

| Field | Before | After | |
|---|---|---|---|
| name | Harry O Or Harry Turner Or O'turner | Harry O Or Harry Turner Or O'Turner | ✓ |
| gender | Male | Male | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   place | Colorado, United States |  | ✗ |
| spouse | Gertrude Coffman |  | ✗ |

### findmypast-record / us-marriages-divorced — 57% (4/7, labels)

<http://search.findmypast.com/record?id=us%2ffs%2fm%2f010363877%2f2>

| Field | Before | After | |
|---|---|---|---|
| name | Alice F Turner Turner | Alice F Turner Turner | ✓ |
| gender | Female | Female | ✓ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   place | Massachusetts, United States |  | ✗ |
| parent | Turner Turner | Turner Turner | ✓ |
| spouse | William A Smith |  | ✗ |

### findmypast-record / denbigh-banns — 80% (4/5, labels)

<http://search.findmypast.com/record?id=gbprs%2fm%2f881019255%2f1>

| Field | Before | After | |
|---|---|---|---|
| name | David Charles Turner | DAVID CHARLES TURNER | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 1880 | 1880 | ✓ |
|   place | BRYMBO | BRYMBO | ✓ |
| spouse | Margaret Jones |  | ✗ |

### findmypast-record / denbigh-baptisms — 67% (6/9, labels)

<http://search.findmypast.com/record?id=gbprs%2fb%2f879273212%2f1>

| Field | Before | After | |
|---|---|---|---|
| name | Catherine Walter Turner | CATHERINE WALTER TURNER | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1835 | 1835 | ✓ |
|   place | Denbighshire, Wales |  | ✗ |
| fact Baptism | Baptism | Baptism | ✓ |
|   date | 07 Jun 1835 | 1835 | ✗ |
|   place | WREXHAM | WREXHAM | ✓ |
| parent | Robert |  | ✗ |
| parent | Sarah | Sarah | ✓ |
| parent |  | Robert TURNER | + |

### findmypast-record / denbigh-burials — 75% (6/8, labels)

<http://search.findmypast.com/record?id=gbprs%2fd%2f878322398%2f1>

| Field | Before | After | |
|---|---|---|---|
| name | Maria Turner | MARIA TURNER | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1825 | 1825 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 1879 | 1879 | ✓ |
|   place | Llangedwyn, Denbighshire, Wales |  | ✗ |
| fact Burial | Burial | Burial | ✓ |
|   date | 20 Feb 1879 | 1879 | ✗ |

### findmypast-record / denbigh-marriages — 50% (3/6, labels)

<http://search.findmypast.com/record?id=gbprs%2fm%2f880081323%2f1>

| Field | Before | After | |
|---|---|---|---|
| name | Bernard Debelton Turner | BERNARD DEBELTON TURNER | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 13 Mar 1866 | 1866 | ✗ |
|   place | BRYMBO | BRYMBO | ✓ |
| parent | John Turner |  | ✗ |
| spouse | Fanny Horton |  | ✗ |

### findmypast-record / leaving-uk — 33% (3/9, labels)

<http://search.findmypast.com/record?id=tna%2fbt27%2f0980000042%2f00187>

| Field | Before | After | |
|---|---|---|---|
| name | Anastazja Jurkiewicz | WASYL JURKIEWICZ | ✗ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1888 | 1888 | ✓ |
| fact Emigration | Emigration |  | ✗ |
|   date | 22 12 1922 |  | ✗ |
|   place | LIVERPOOL |  | ✗ |
| fact Immigration | Immigration |  | ✗ |
|   place | SAINT JOHN NB |  | ✗ |

### findmypast-record / ny-arrivals — 45% (5/11, labels)

<http://search.findmypast.com/record?id=us%2fpass%2fny%2fei%2f16551289>

| Field | Before | After | |
|---|---|---|---|
| name | Adam Jurkiewicz | Adam Jurkiewicz | ✓ |
| gender | Male | Male | ✓ |
| fact Residence | Residence | Residence | ✓ |
| fact Nationality | Nationality |  | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1890 | 1890 | ✓ |
| fact Emigration | Emigration |  | ✗ |
|   place | Hamburg |  | ✗ |
| fact Immigration | Immigration |  | ✗ |
|   date | 1907 |  | ✗ |
|   place | New York |  | ✗ |

### fold3-memorial / missing — 57% (16/28, microdata+labels)

<https://www.fold3.com/memorial/529885239/alfred-r-ellis>

| Field | Before | After | |
|---|---|---|---|
| name | Alfred R Ellis | Alfred R Ellis | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | May 21, 1907 | May 21, 1907 | ✓ |
|   place | Iowa City, Iowa |  | ✗ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | Sep 27, 1930 | Sep 27, 1930 | ✓ |
|   place | Mechanicsville, Iowa |  | ✗ |
| fact Death | Death | Death | ✓ |
|   date | May 30, 1945 | May 30, 1945 | ✓ |
|   place | Off the Coast of Ghana, Africa |  | ✗ |
| fact Burial | Burial | Burial | ✓ |
|   place | Tablets of the Missing at North Africa American Cemetery, Carthage, Tunisia | Missing in Action or Buried at Sea Tablets of the Missing at North Africa American Cemetery Carthage, Tunisia | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   place | Iowa City, Iowa | Iowa City, Iowa | ✓ |
| fact Ethnicity | Ethnicity |  | ✗ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |
|   date | 1939 - 1945 |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |
| child | Dorritt Sue Ellis | Dorritt Sue Ellis | ✓ |
| parent | George Ellis | George Ellis | ✓ |
| parent | Kate Orum Ellis | Kate Orum Ellis | ✓ |

### fold3-memorial / buried — 62% (8/13, microdata+labels)

<https://www.fold3.com/memorial/529923576/ernest-r-ackerman>

| Field | Before | After | |
|---|---|---|---|
| name | Ernest R Ackerman | Ernest R Ackerman | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Dec 26, 1919 | Dec 26, 1919 | ✓ |
|   place | Plainfield, NJ |  | ✗ |
| fact Death | Death | Death | ✓ |
|   date | Apr 3, 1944 | Apr 3, 1944 | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Sicily-Rome American Cemetery, Nettuno, Italy | Plot J Row 4 Grave 60 Sicily-Rome American Cemetery Nettuno, Italy | ✓ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |
|   date | 1939 - 1945 |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |
| fact MilitaryAward | MilitaryAward |  | ✗ |

### fold3-memorial / celebrity — 72% (13/18, microdata+labels)

<https://www.fold3.com/memorial/630019169/sammy-davis-jr>

| Field | Before | After | |
|---|---|---|---|
| name | Sammy Davis, Jr. | Sammy Davis, Jr. | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Dec 8, 1925 | Dec 8, 1925 | ✓ |
|   place | Harlem, New York City NY |  | ✗ |
| fact Death | Death | Death | ✓ |
|   date | May 16, 1990 | May 16, 1990 | ✓ |
|   place | Los Angeles California |  | ✗ |
| fact Burial | Burial | Burial | ✓ |
|   place | Forest Lawn Memorial Park in Glendale, CA | Forest Lawn Memorial Park in Glendale, CA | ✓ |
| fact Ethnicity | Ethnicity |  | ✗ |
| fact Occupation | Occupation | Occupation | ✓ |
| fact Religion | Religion |  | ✗ |
| fact MilitaryService | MilitaryService | MilitaryService | ✓ |
|   date | 1939 - 1945 |  | ✗ |
| parent | Elvera Sanchez | Elvera Sanchez | ✓ |
| parent | Sammy Davis | Sammy Davis | ✓ |
| parent | Samuel George Davis Sr | Samuel George Davis Sr | ✓ |
| parent |  | Elvera Sanchez | + |

### freecen / 1871 — 90% (9/10, labels)

<https://www.freecen.org.uk/search_records/590507f9e9379091b11264db/elizabeth-edwards-1871-sussex-brighton-1813-?locale=en>

| Field | Before | After | |
|---|---|---|---|
| name | Elizabeth EDWARDS | Elizabeth EDWARDS | ✓ |
| gender | Female | Female | ✓ |
| fact Census | Census | Census | ✓ |
|   date | 1871 | 1871 | ✓ |
|   place | 19 Powis Road, Brighton, Sussex | Brighton, Sussex (SSX) | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | about 1813 | about 1813 | ✓ |
|   place | Lambeth, Surrey | Lambeth, Surrey | ✓ |
| fact Occupation | Occupation | Occupation | ✓ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| child |  | Mary HUDSON | + |
| child |  | Rosa PORTER | + |

### freecen / 1841 — 89% (8/9, labels)

<https://www.freecen.org.uk/search_records/5a154a3df4040b9d6e5c3b09>

| Field | Before | After | |
|---|---|---|---|
| name | David COMB | David COMB | ✓ |
| gender | Male | Male | ✓ |
| fact Census | Census | Census | ✓ |
|   date | 1841 | 1841 | ✓ |
|   place | 1 Sir Michael St, Greenock, Renfrewshire | Greenock, Renfrewshire (RFW) | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | about 1771 | about 1771 | ✓ |
|   place | Out of County | Out of County | ✓ |
| fact Occupation | Occupation | Occupation | ✓ |

### freereg / baptism — 100% (7/7, labels)

<https://www.freereg.org.uk/search_records/5e29f296f493fd5a052f7a98>

| Field | Before | After | |
|---|---|---|---|
| name | Elizabeth Brappel GUNN | Elizabeth Brappel GUNN | ✓ |
| gender | Female | Female | ✓ |
| fact Baptism | Baptism | Baptism | ✓ |
|   date | 07 Apr 1774 | 07 Apr 1774 | ✓ |
|   place | St Nicholas of Myra, Brighton, Sussex | St Nicholas of Myra, Brighton, Sussex | ✓ |
| parent | Stephen GUNN | Stephen GUNN | ✓ |
| parent | Martha | Martha | ✓ |

### freereg / baptism-mother — 100% (7/7, labels+narrative)

<https://www.freereg.org.uk/search_records/684debd986557455d495af6d>

| Field | Before | After | |
|---|---|---|---|
| name | Frances CHRISP | Frances CHRISP | ✓ |
| gender | Female | Female | ✓ |
| fact Baptism | Baptism | Baptism | ✓ |
|   date | 05 Jul 1802 | 05 Jul 1802 | ✓ |
|   place | St Lawrence, Warkworth, Northumberland | St Lawrence, Warkworth, Northumberland | ✓ |
| parent | John CHRISP | John CHRISP | ✓ |
| parent | Ann HEATON | Ann HEATON | ✓ |
| child |  | Craister | + |

### freereg / baptism-abode — 100% (8/8, labels)

<https://www.freereg.org.uk/search_records/5f1f2026f493fd49434bd3f4>

| Field | Before | After | |
|---|---|---|---|
| name | Emma PALMER | Emma PALMER | ✓ |
| fact Baptism | Baptism | Baptism | ✓ |
|   date | 06 Apr 1823 | 06 Apr 1823 | ✓ |
|   place | St Edward the Confessor, Romford, Essex | St Edward the Confessor, Romford, Essex | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   place | Becontree Heath, Romford | Becontree Heath, Romford | ✓ |
| parent | Thomas PALMER | Thomas PALMER | ✓ |
| parent | Ann | Ann | ✓ |

### freereg / marriage — 100% (6/6, labels)

<https://www.freereg.org.uk/search_records/60521934f493fdd7899f1ac3>

| Field | Before | After | |
|---|---|---|---|
| name | William FOWLER | William FOWLER | ✓ |
| gender | Male | Male | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 10 May 1779 | 10 May 1779 | ✓ |
|   place | St John the Evangelist, Charfield, Gloucestershire | St John the Evangelist, Charfield, Gloucestershire | ✓ |
| spouse | Elizabeth SELMAN | Elizabeth SELMAN | ✓ |

### freereg / marriage-witnesses — 100% (6/6, labels)

<https://www.freereg.org.uk/search_records/5efcaab2f493fd0e2cab038a>

| Field | Before | After | |
|---|---|---|---|
| name | William BIRKETT | William BIRKETT | ✓ |
| gender | Male | Male | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 20 May 1823 | 20 May 1823 | ✓ |
|   place | All Saints, Wragby, Lincolnshire | All Saints, Wragby, Lincolnshire | ✓ |
| spouse | Sarah LAMB | Sarah LAMB | ✓ |

### freereg / burial — 100% (6/6, labels)

<https://www.freereg.org.uk/search_records/6838192286557439c2378a35>

| Field | Before | After | |
|---|---|---|---|
| name | Brooke William Robert BOOTHBY | Brooke William Robert BOOTHBY | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   date | 29 Sep 1865 | 29 Sep 1865 | ✓ |
|   place | St Mary the Virgin, Welwyn, Hertfordshire | St Mary the Virgin, Welwyn, Hertfordshire | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   place | Welwyn | Welwyn | ✓ |
| fact Birth |  | Birth · about 1809 | + |

### gedbas / friedrich — 44% (16/36, labels)

<https://gedbas.genealogy.net/person/show/1331881715>

| Field | Before | After | |
|---|---|---|---|
| name | Friedrich SCHLARB | Friedrich SCHLARB | ✓ |
| fact Education | Education |  | ✗ |
|   date | from 1857 to 1859 |  | ✗ |
|   place | Erlangen, Bayern, Deutschland |  | ✗ |
| fact Education | Education |  | ✗ |
|   date | from 30 September 1859 to 1861 |  | ✗ |
|   place | Utrecht, Niederlande |  | ✗ |
| fact Occupation | Occupation | Occupation | ✓ |
|   date | from 7 February 1877 to 1 November 1880 |  | ✗ |
|   place | Gerolsheim |  | ✗ |
| fact Occupation | Occupation |  | ✗ |
|   date | until 20 April 1866 |  | ✗ |
|   place | Kleinfischlingen, Edenkoben, Südliche Weinstrasse, Rheinland-Pfalz, Deutschland |  | ✗ |
| fact Baptism | Baptism | Baptism | ✓ |
|   date | 16 August 1837 | 16. August 1837 | ✓ |
|   place | Kusel, Kusel-Altenglan, Kusel, Rheinland-Pfalz, Deutschland | Kusel, Kusel-Altenglan, Kusel, Rheinland-Pfalz, Deutschland | ✓ |
| fact Emigration | Emigration |  | ✗ |
|   date | 1880 |  | ✗ |
|   place | Bessarabien, Russland |  | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   date | from 1908 to 1909 |  | ✗ |
|   place | Bendery, Bessarabien, Russland | from 1908 to 1909 Bendery, Bessarabien, Russland | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 25 July 1837 | 25. July 1837 | ✓ |
|   place | Kusel, Kusel-Altenglan, Kusel, Rheinland-Pfalz, Deutschland | Kusel, Kusel-Altenglan, Kusel, Rheinland-Pfalz, Deutschland [7] [8] | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 11 February 1869 | 11. February 1869 | ✓ |
|   place | Altdorf, Edenkoben, Südliche Weinstrasse, Rheinland-Pfalz, Deutschland | Altdorf, Edenkoben, Südliche Weinstrasse, Rheinland-Pfalz, Deutschland | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   date | 11 February 1869 |  | ✗ |
|   place | Altdorf, Edenkoben, Südliche Weinstrasse, Rheinland-Pfalz, Deutschland |  | ✗ |
| parent | Johann Carl SCHLARB | Johann Carl SCHLARB | ✓ |
| parent | Caroline Charlotte SCHWINN | Caroline Charlotte SCHWINN | ✓ |
| spouse | Sophia Louisa HEPP | Sophia Louisa HEPP | ✓ |
| child | Samuel Friedrich SCHLARB |  | ✗ |
| child | Theophil Johannes SCHLARB |  | ✗ |

### gedbas / theophil — 67% (10/15, labels)

<https://gedbas.genealogy.net/person/show/1331881706>

| Field | Before | After | |
|---|---|---|---|
| name | Theophil Johannes SCHLARB | Theophil Johannes SCHLARB | ✓ |
| fact Occupation | Occupation | Occupation | ✓ |
|   place | St. Petersburg, Russland |  | ✗ |
| fact Baptism | Baptism | Baptism | ✓ |
|   place | Tarutino | Tarutino [2] | ✓ |
| fact Emigration | Emigration |  | ✗ |
|   date | 19 January 1919 |  | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | 20 July 1884 | 20. July 1884 | ✓ |
|   place | Tarutino | Tarutino [5] | ✓ |
| fact Marriage |  | Marriage · spouse Children | + |
| parent | Friedrich SCHLARB | Friedrich SCHLARB | ✓ |
| parent | Sophia Louisa HEPP | Sophia Louisa HEPP | ✓ |
| spouse | Berta Caroline BRÉCHET | Berta Caroline BRÉCHET | ✓ |
| child | Edith Gertraut SCHLARB |  | ✗ |
| child | Friedrich Leonhard SCHLARB |  | ✗ |

### genealogieonline / simple — 100% (12/12, microdata+narrative)

<https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I15210.php>

| Field | Before | After | |
|---|---|---|---|
| name | Pieter den Herder | Pieter den Herder | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1844-12-21 | 1844-12-21 | ✓ |
|   place | Wolphaartsdijk gem. Goes Zld. Nederland | Wolphaartsdijk gem. Goes Zld. Nederland | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 1924-04-04 | 1924-04-04 | ✓ |
|   place | Wolphaartsdijk gem. Goes Zld. Nederland | Wolphaartsdijk gem. Goes Zld. Nederland | ✓ |
| spouse | Jannetje Mieras | Jannetje Mieras | ✓ |
| spouse | Aaltje van Damme | Aaltje van Damme | ✓ |
| parent | Daniel Willem den Herder | Daniel Willem den Herder | ✓ |
| parent | Catharina Thorenaar | Catharina Thorenaar | ✓ |

### genealogieonline / child — 100% (12/12, microdata+labels+narrative)

<https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I39364.php>

| Field | Before | After | |
|---|---|---|---|
| name | Alida Petronella Jansen | Alida Petronella Jansen | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1871-07-20 | 1871-07-20 | ✓ |
|   place | Alkmaar Nhl. Nederland | Alkmaar Nhl. Nederland | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 1958-06-18 | 1958-06-18 | ✓ |
|   place | Schagen Nhl. Nederland | Schagen Nhl. Nederland | ✓ |
| spouse | Hendrik Westenberg | Hendrik Westenberg | ✓ |
| parent | Petrus Jansen | Petrus Jansen | ✓ |
| parent | Antje Hosmus | Antje Hosmus | ✓ |
| child | Johannes Lambertus Hendricus Josephus Westenberg | Johannes Lambertus Hendricus Josephus Westenberg | ✓ |
| child |  | Hendrik Westenberg | + |
| child |  | Pietje Visser | + |
| child |  | Alida Petronella Jansen | + |

### genealogieonline / children — 85% (11/13, microdata+labels+narrative)

<https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I39356.php>

| Field | Before | After | |
|---|---|---|---|
| name | Johannes Lambertus Henricus Josephus Westenberg | Johannes Lambertus Henricus Josephus Westenberg | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1837 | 1837 | ✓ |
|   place | 's Hertogenbosch Nrb. Nederland | 's Hertogenbosch Nrb. Nederland | ✓ |
| fact Death | Death |  | ✗ |
|   date | 1859-04-10 |  | ✗ |
| spouse | Pietje Visser | Pietje Visser | ✓ |
| parent | Hendrik Westenberg | Hendrik Westenberg | ✓ |
| parent | Maria Agnes Melotte | Maria Agnes Melotte | ✓ |
| child | Hendrik Westenberg | Hendrik Westenberg | ✓ |
| child | Metje Westenberg | Metje Westenberg | ✓ |
| child | Hendrik Westenberg | Hendrik Westenberg | ✓ |
| child |  | Johannes Lambertus Henricus Josephus Westenberg | + |
| child |  | Maria Agnes Melotte | + |
| child |  | Pietje Visser | + |

### genealogieonline / grandparents — 80% (8/10, microdata+narrative)

<https://www.genealogieonline.nl/en/voorouders-monique-en-jan-vis/I39388.php>

| Field | Before | After | |
|---|---|---|---|
| name | Johannes Lambertus Hendricus Josephus Westenberg | Johannes Lambertus Hendricus Josephus Westenberg | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1904 | 1904 | ✓ |
|   place | den Helder Nhl. Nederland | den Helder Nhl. Nederland | ✓ |
| fact Death | Death |  | ✗ |
|   date | 1956-02-14 |  | ✗ |
| spouse | Maria Petronella Spaans | Maria Petronella Spaans | ✓ |
| parent | Hendrik Westenberg | Hendrik Westenberg | ✓ |
| parent | Alida Petronella Jansen | Alida Petronella Jansen | ✓ |

### geneanet / washington — 80% (12/15, labels+narrative)

<https://gw.geneanet.org/pierfit?lang=en&n=washington&p=george>

| Field | Before | After | |
|---|---|---|---|
| name | George WASHINGTON | George WASHINGTON | ✓ |
| gender | Male |  | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | February 22, 1732 | February 22, 1732 | ✓ |
|   place | Pope'Creek, Westmoreland Co, Virginie (USA) | (Friday) - Pope'Creek, Westmoreland Co, Virginie (USA) | ✓ |
| fact Death | Death | Death | ✓ |
|   date | December 14, 1799 | December 14, 1799 | ✓ |
|   place | Domaine de Mont-Vernon, Fairfax, Virginie (USA) | (Saturday) - Domaine de Mont-Vernon, Fairfax, Virginie (USA), aged 67 years old | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 1759 | 1759 | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   date | 1759 |  | ✗ |
| parent | Augustine WASHINGTON | Augustine WASHINGTON | ✓ |
| parent | Mary BALL | Mary BALL | ✓ |
| spouse | Martha DANDRIDGE | Martha DANDRIDGE | ✓ |

### geneanet / dandridge — 46% (11/24, labels+narrative)

<https://gw.geneanet.org/pierfit?lang=en&n=dandridge&p=martha>

| Field | Before | After | |
|---|---|---|---|
| name | Martha DANDRIDGE | Martha DANDRIDGE | ✓ |
| gender | Female |  | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | June 21, 1731 | June 21, 1731 | ✓ |
|   place | Virginia (USA) | (Thursday) - Virginia (USA) | ✓ |
| fact Death | Death | Death | ✓ |
|   date | May 22, 1802 | May 22, 1802 | ✓ |
|   place | Domaine de Mont-Vernon, Fairfax, Virginia (USA) | (Saturday) - Domaine de Mont-Vernon, Fairfax, Virginia (USA), aged 70 years old | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 1750 | 1750 | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   date | 1759 |  | ✗ |
| fact Marriage | Marriage |  | ✗ |
|   date | 1750 |  | ✗ |
| fact Marriage | Marriage |  | ✗ |
|   date | 1759 |  | ✗ |
| parent | John DANDRIDGE | John DANDRIDGE | ✓ |
| parent | Frances Orlando JONES | Frances Orlando JONES | ✓ |
| spouse | Daniel Parke CUSTIS |  | ✗ |
| child | Daniel Parke CUSTIS |  | ✗ |
| child | Frances Parke CUSTIS |  | ✗ |
| child | John Parke CUSTIS |  | ✗ |
| child | Martha Parke CUSTIS |  | ✗ |
| spouse | George WASHINGTON |  | ✗ |

### geni / churchill — 100% (19/19, microdata+labels+narrative)

<https://www.geni.com/people/Winston-Churchill/6000000003222187286>

| Field | Before | After | |
|---|---|---|---|
| name | Winston Churchill | Winston Churchill | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | November 30, 1874 | November 30, 1874 | ✓ |
|   place | England | England | ✓ |
| fact Death | Death | Death | ✓ |
|   date | January 24, 1965 | 1965-01-24 | ✓ |
|   place | 28 Hyde Park Gate, Hyde Park, London, England | (90) 28 Hyde Park Gate, Hyde Park, London, England (Stroke) | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | St. Martins Church, Bladon, Oxfordshire, England | St. Martins Church, Bladon, Oxfordshire, England | ✓ |
| fact Occupation | Occupation | Occupation | ✓ |
| parent | Lord Randolph Henry Spencer-Churchill | Lord Randolph Henry Spencer-Churchill | ✓ |
| parent | Jeanette Porch | Jeanette Porch Husband of Clementine Churchill | ✓ |
| spouse | Clementine Churchill | Clementine Churchill | ✓ |
| child | Diana Churchill | Diana Churchill | ✓ |
| child | Randolph Churchill | Randolph Churchill | ✓ |
| child | Sarah Millicent Hermione Spencer Churchill | Sarah Millicent Hermione Spencer Churchill | ✓ |
| child | Marigold Frances Spencer-Churchill | Marigold Frances Spencer-Churchill | ✓ |
| child | Mary Soames | Mary Soames | ✓ |

### geni / clementine — 88% (14/16, microdata+labels+narrative)

<https://www.geni.com/people/Clementine-Churchill-Baroness-Spencer-Churchill/6000000003583684153>

| Field | Before | After | |
|---|---|---|---|
| name | Clementine Churchill | Clementine Churchill, Baroness Spencer-Churchill | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | April 01, 1885 | April 01, 1885 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | December 12, 1977 | 1977-12-12 | ✓ |
|   place | Princes Gate, Knightsbridge, London, England | (92) Princes Gate, Knightsbridge, London, England (heart attack) | ✓ |
| parent | Algernon Freeman-Mitford | Algernon Freeman-Mitford | ✓ |
| parent | Lady Blanche Ogilvy |  | ✗ |
| parent | Col. Sir Henry Montague Hozier |  | ✗ |
| spouse | Winston Churchill | Winston Churchill Mother of Diana Churchill | ✓ |
| child | Diana Churchill | Diana Churchill | ✓ |
| child | Randolph Churchill | Randolph Churchill | ✓ |
| child | Sarah Millicent Hermione Spencer Churchill | Sarah Millicent Hermione Spencer Churchill | ✓ |
| child | Marigold Frances Spencer-Churchill | Marigold Frances Spencer-Churchill | ✓ |
| child | Mary Soames | Mary Soames | ✓ |

### irishgenealogy / civil-birth — 100% (4/4, labels)

<https://www.irishgenealogy.ie/view/?record_id=cibi-10100047>

| Field | Before | After | |
|---|---|---|---|
| name | John Murphy | John Murphy | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1872 | 1872 | ✓ |
|   place | New Ross | New Ross | ✓ |

### irishgenealogy / civil-death — 100% (6/6, labels)

<https://www.irishgenealogy.ie/view/?record_id=cide-5863758>

| Field | Before | After | |
|---|---|---|---|
| name | John Murphy | John Murphy | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | about 1841 | about 1841 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 1881 | 1881 | ✓ |
|   place | Dingle | Dingle | ✓ |

### irishgenealogy / civil-marriage — 0% (0/5, none)

<https://www.irishgenealogy.ie/view/?record_id=cima-2201021>

| Field | Before | After | |
|---|---|---|---|
| name | John Murphy |  | ✗ |
| fact Marriage | Marriage |  | ✗ |
|   date | 2 April 1882 |  | ✗ |
|   place | Macroom |  | ✗ |
| spouse | Mary Murphy |  | ✗ |

### irishgenealogy / baptism — 50% (3/6, labels)

<https://www.irishgenealogy.ie/view/?record_id=9d97f322a9-13634>

| Field | Before | After | |
|---|---|---|---|
| name | Mary Kelly | Mary Kelly | ✓ |
| fact Baptism | Baptism |  | ✗ |
|   date | 10 February 1851 |  | ✗ |
|   place | ST. JAMES, DUBLIN (RC) |  | ✗ |
| parent | Patrick Kelly | Patrick Kelly | ✓ |
| parent | Mary Meehan | Mary Meehan | ✓ |

### irishgenealogy / baptism-address — 63% (5/8, labels)

<https://www.irishgenealogy.ie/view/?record_id=bd469535f6-17550>

| Field | Before | After | |
|---|---|---|---|
| name | Mary Kelly | Mary Kelly | ✓ |
| fact Baptism | Baptism |  | ✗ |
|   date | 21 June 1853 |  | ✗ |
|   place | ALLIHIES, KERRY (RC) |  | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   place | Allihies | Allihies | ✓ |
| parent | John Kelly | John Kelly | ✓ |
| parent | Johanna Dwyer | Johanna Dwyer | ✓ |

### irishgenealogy / marriage — 44% (4/9, labels)

<https://www.irishgenealogy.ie/view/?record_id=1dd9f6479b-40055>

| Field | Before | After | |
|---|---|---|---|
| name | JOHN BYRNE | JOHN BYRNE ESTHER BYRNE | ✓ |
| gender | Male |  | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   place | PEMBROOK COURT | PEMBROOK COURT PEMBROOK CT | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   date | 22 January 1860 |  | ✗ |
|   place | ST. ANDREW, DUBLIN (RC) |  | ✗ |
| parent | WILLIAM BYRNE | WILLIAM BYRNE JAMES BYRNE | ✓ |
| spouse | ESTHER BYRNE |  | ✗ |

### irishgenealogy / marriage-witnesses — 17% (1/6, labels)

<https://www.irishgenealogy.ie/view/?record_id=68f3c8a8f2-45824>

| Field | Before | After | |
|---|---|---|---|
| name | THOMAS JONES | THOMAS JONES JOANNE MURPHY | ✓ |
| gender | Male |  | ✗ |
| fact Marriage | Marriage |  | ✗ |
|   date | 7 January 1855 |  | ✗ |
|   place | GLENBEIGH/GLENCAR, KERRY (RC) |  | ✗ |
| fact Residence |  | Residence · NR NR | + |
| fact Occupation |  | Occupation | + |
| spouse | JOANNE MURPHY |  | ✗ |
| parent |  | NR NR NR NR | + |
| parent |  | NR NR NR NR | + |

### irishgenealogy / burial — 91% (10/11, labels)

<https://www.irishgenealogy.ie/view/?record_id=894b618d15-1105>

| Field | Before | After | |
|---|---|---|---|
| name | John Murphy | John Murphy | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | about 1821 | about 1821 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 12 May 1852 | 12 May 1852 | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   date | 13 May 1852 | on 13 May 1852 | ✓ |
|   place | ARBOUR HILL BARRACKS, DUBLIN (COI) | record for JOHN MURPHY of 14 REGT | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   place | 14 Regt | 14 Regt | ✓ |
| fact Occupation | Occupation | Occupation | ✓ |

### legacy / full — 100% (6/6, jsonld)

<https://www.legacy.com/us/obituaries/thestate/name/anne-morris-obituary?id=62316159>

| Field | Before | After | |
|---|---|---|---|
| name | Anne Scott Teague Morris | Anne Morris | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 2 May 1942 | 1942-5-2 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 27 August 2026 | 2026-8-27 | ✓ |
|   place | Mount Pleasant, SC, United States | Mount Pleasant, SC, United States | ✓ |

### legacy / middle — 50% (3/6, jsonld)

<https://www.legacy.com/us/obituaries/thestate/name/barney-williams-obituary?id=62395602>

| Field | Before | After | |
|---|---|---|---|
| name | Dr. Barney Levy Williams Jr. | Barney Williams | ✓ |
| fact Birth | Birth |  | ✗ |
|   date | 1936 |  | ✗ |
| fact Death | Death | Death | ✓ |
|   date | 2026 |  | ✗ |
|   place | Sumter, SC, United States | Sumter, SC, United States | ✓ |

### legacy / no-dates — 50% (3/6, jsonld)

<https://www.legacy.com/us/obituaries/thestate/name/baylus-love-obituary?id=62476359>

| Field | Before | After | |
|---|---|---|---|
| name | Baylus Love | Baylus Love | ✓ |
| fact Birth | Birth |  | ✗ |
|   date | 1947 |  | ✗ |
| fact Death | Death | Death | ✓ |
|   date | 2026 |  | ✗ |
|   place | Atlanta, GA, United States | Atlanta, GA, United States | ✓ |

### myheritage-record / ssdi-10248383 — 80% (4/5, labels)

<https://www.myheritage.com/research/record-10002-10248383/stephen-a-zierak-in-us-social-security-death-index-ssdi>

| Field | Before | After | |
|---|---|---|---|
| name | Stephen A Zierak | DNA New | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | Mar 22 1894 | Mar 22 1894 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Apr 7 1961 | Apr 7 1961 | ✓ |

### myheritage-record / scotland-births-baptisms-2401107 — 83% (5/6, labels)

<https://www.myheritage.com/research/record-30226-2401107-F/issabel-cameron-in-scotland-births-baptisms>

| Field | Before | After | |
|---|---|---|---|
| name | Issabel Cameron | DNA New | ✗ |
| gender | Female | Female | ✓ |
| fact Baptism | Baptism | Baptism | ✓ |
|   date | Jan 4 1801 | Jan 4 1801 | ✓ |
|   place | Kildalton, Argyll, Scotland | Kildalton, Argyll, Scotland | ✓ |
| parent | Allen Cameron | Allen Cameron | ✓ |

### myheritage-record / billiongraves-4078167 — 86% (6/7, labels)

<https://www.myheritage.com/research/record-10147-4078167/anne-h-sarvay-in-billiongraves>

| Field | Before | After | |
|---|---|---|---|
| name | Anne H. Sarvay | DNA New | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | July 19 1903 | July 19 1903 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Jan 16 2000 | Jan 16 2000 | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Holy Cross Cemetery, Richmond, Virginia, United States | Holy Cross Cemetery, Richmond, Virginia, United States | ✓ |

### myheritage-record / billiongraves-52111725 — 83% (5/6, labels)

<https://www.myheritage.com/research/record-10147-52111725/janet-k-smith-in-billiongraves>

| Field | Before | After | |
|---|---|---|---|
| name | Janet K Smith | DNA New | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | Nov 30 1948 | Nov 30 1948 | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   place | Highland Memorial Gardens, Thornton, Colorado, United States | Highland Memorial Gardens, Thornton, Colorado, United States | ✓ |
| spouse | Robert J Smith | Robert J Smith | ✓ |

### myheritage-record / familysearch-family-tree-171359631 — 79% (15/19, labels)

<https://www.myheritage.com/research/record-40001-171359631/katherine-zierak-in-familysearch-family-tree>

| Field | Before | After | |
|---|---|---|---|
| name | Katherine Zierak | DNA New | ✗ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Mar 24 1822 | Mar 24 1822 | ✓ |
|   place | Lipinki, Gorlice, Poland | Lipinki, Gorlice, Poland | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 1846 | 1846 | ✓ |
|   place | Lipinki, Gorlice, Poland | Lipinki, Gorlice, Poland | ✓ |
| fact Immigration | Immigration |  | ✗ |
|   date | 1907 |  | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   date | 1910 |  | ✗ |
|   place | Amsterdam Ward 7, Montgomery, New York, United States | 1910 Amsterdam Ward 7, Montgomery, New York, United States | ✓ |
| fact Death | Death | Death | ✓ |
|   date | Apr 23 1911 | Apr 23 1911 | ✓ |
|   place | Amsterdam, Montgomery, New York, United States | Amsterdam, Montgomery, New York, United States | ✓ |
| fact Burial | Burial | Burial | ✓ |
|   date | Apr 23 1911 | Apr 23 1911 | ✓ |
|   place | Amsterdam, Montgomery, New York, United States | Amsterdam, Montgomery, New York, United States | ✓ |

### myheritage-record / united-states-federal-census-90714854 — 54% (7/13, labels+narrative)

<https://www.myheritage.com/research/record-10053-90714854/helen-g-yurkiewicz-in-1940-united-states-federal-census>

| Field | Before | After | |
|---|---|---|---|
| name | Helen G Yurkiewicz | DNA New | ✗ |
| gender | Female | Male | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | Circa 1897 | before April 1, 1940 | ✗ |
|   place | New York, USA | New York, USA | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   date | 1940 |  | ✗ |
|   place | 210e Structure on Post Identified by Quarters No, Hempstead Township, Nassau, New York, USA | 1940 210e Structure on Post Identified by Quarters No, Hempstead Township, Nassau, New York, USA | ✓ |
| fact Race | Race |  | ✗ |
| fact MaritalStatus | MaritalStatus |  | ✗ |
| fact Census |  | Census · 1940 · Nassau Roll: m-t0627-02687 Line: 1, New York Frame: 00683 | + |
| spouse | Theodore Yurkiewicz | Theodore Yurkiewicz | ✓ |
| child | Margaret E Yurkiewicz | Margaret E Yurkiewicz | ✓ |
| child | Theodore Jr Yurkiewicz | Theodore Jr Yurkiewicz | ✓ |
| spouse |  | Helen G Yurkiewicz | + |
| spouse |  | Yurkiewicz, Helen G | + |
| child |  | Yurkiewicz, Margaret E | + |
| child |  | Yurkiewicz, Theodore Jr | + |

### myheritage-record / united-states-federal-census-113306106 — 62% (8/13, labels)

<https://www.myheritage.com/research/record-10133-113306106/grace-t-kiefer-in-1920-united-states-federal-census>

| Field | Before | After | |
|---|---|---|---|
| name | Grace T Kiefer | DNA New | ✗ |
| gender | Female | Male | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | Circa 1894 | Circa 1894 | ✓ |
|   place | Idaho, United States | Idaho, United States | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   date | 1920 |  | ✗ |
|   place | Bingham, Idaho, USA | 1920 Bingham, Idaho, USA | ✓ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| fact Race | Race |  | ✗ |
| fact Ethnicity | Ethnicity |  | ✗ |
| fact Census |  | Census · 1091 · Bingham Series: T625 Line: 12, Idaho Sheet: 9-A Image: 1091 | + |
| fact Marriage |  | Marriage · Race | + |
| spouse | Charles H Kiefer | Charles H Kiefer | ✓ |
| child | James Kiefer | Kiefer James | ✓ |
| spouse |  | Grace T Kiefer | + |
| spouse |  | Kiefer Grace T | + |

### myheritage-record / germany-bremen-passenger-departure-lists-12326 — 60% (6/10, labels)

<https://www.myheritage.com/research/record-30240-12326/mopsche-turner-in-germany-bremen-passenger-departure-lists>

| Field | Before | After | |
|---|---|---|---|
| name | Mopsche Turner | DNA New | ✗ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Circa 1893 | Circa 1893 | ✓ |
| fact MaritalStatus | MaritalStatus |  | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   date | Dec 11 1913 |  | ✗ |
|   place | Sosnowitz, Petrikow, Rußland | Dec 11 1913 Sosnowitz, Petrikow, Rußland | ✓ |
| fact Occupation | Occupation | Occupation | ✓ |
| fact Immigration | Immigration |  | ✗ |

### myheritage-record / mexico-baptisms-1799709 — 89% (8/9, labels)

<https://www.myheritage.com/research/record-30039-1799709-F/j-ysac-gonzalez-in-mexico-baptisms>

| Field | Before | After | |
|---|---|---|---|
| name | J. Ysac Gonzalez | DNA New | ✗ |
| gender | Male | Male | ✓ |
| fact Baptism | Baptism | Baptism | ✓ |
|   date | June 10 1877 | June 10 1877 | ✓ |
|   place | Huejúcar, Jalisco, Mexico | Huejúcar, Jalisco, Mexico | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   place | Huejúcar, Jalisco, Mexico | Huejúcar, Jalisco, Mexico | ✓ |
| parent | Regino Gonzalez | Regino Gonzalez | ✓ |
| parent | Sacramento Aleman | Sacramento Aleman | ✓ |

### myheritage-record / california-county-marriages-1399039 — 80% (8/10, labels)

<https://www.myheritage.com/research/record-30244-1399039/charles-e-york-and-frances-m-osborn-in-california-county-marriages>

| Field | Before | After | |
|---|---|---|---|
| name | Charles E York | DNA New | ✗ |
| gender | Male |  | ✗ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | July 25 1927 | July 25 1927 | ✓ |
|   place | Los Angeles, California, United States | Los Angeles, California, United States | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Circa 1898 | Circa 1898 | ✓ |
| parent | Fred C York | Fred C York | ✓ |
| parent | Mary Hiatt | Mary Hiatt | ✓ |
| spouse | Frances M Osborn | Frances M Osborn | ✓ |
| spouse |  | Charles E York | + |

### myheritage-record / germany-marriages-1968627-F — 75% (6/8, labels)

<https://www.myheritage.com/research/record-30038-1968627-F/jacobine-friederike-van-der-horst-and-heinrich-kuckes-in-germany-marriages>

| Field | Before | After | |
|---|---|---|---|
| name | Jacobine Friederike Van Der Horst | DNA New | ✗ |
| gender | Female |  | ✗ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | Oct 14 1852 | Oct 14 1852 | ✓ |
|   place | Evangelisch, Uedem, Rheinland, Prussia | Evangelisch, Uedem, Rheinland, Prussia | ✓ |
| fact Birth |  | Birth · 1812 | + |
| parent | Friederick van Der Horst | Friederick van Der Horst | ✓ |
| parent | Sibilla Curlis | Sibilla Curlis | ✓ |
| spouse | Heinrich Kuckes | Heinrich Kuckes | ✓ |
| spouse |  | Jacobine Friederike van Der Horst | + |

### myheritage-record / spain-marriages-1934741-F — 82% (9/11, labels)

<https://www.myheritage.com/research/record-30057-1934741-F/cecilia-alabori-pujeu-and-juan-clota-y-clota-in-spain-marriages>

| Field | Before | After | |
|---|---|---|---|
| name | Cecilia Alabori Pujeu | DNA New | ✗ |
| gender | Female |  | ✗ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | Apr 20 1919 | Apr 20 1919 | ✓ |
|   place | San Salvador, Castellfullit De La Roca, Gerona, Spain | San Salvador, Castellfullit De La Roca, Gerona, Spain | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1895 | 1895 | ✓ |
|   place | Oix | Oix | ✓ |
| parent | Jorge Alabori Pujol | Jorge Alabori Pujol | ✓ |
| parent | Magdalena Pujeu Y Noguer | Magdalena Pujeu Y Noguer | ✓ |
| spouse | Juan Clota Y Clota | Juan Clota | ✓ |
| spouse |  | Cecilia Alabori Pujeu | + |

### myheritage-record / massachusetts-marriages-1113561 — 80% (8/10, labels)

<https://www.myheritage.com/research/record-30033-1113561/henry-leroy-york-and-elevia-belle-harriman-in-massachusetts-marriages>

| Field | Before | After | |
|---|---|---|---|
| name | Henry Leroy York | DNA New | ✗ |
| gender | Male |  | ✗ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 1906 | 1906 | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1874 | 1874 | ✓ |
|   place | Newcastle, Maine | Newcastle, Maine | ✓ |
| parent | James M York | James M York | ✓ |
| parent | Rose C Leighton | Rose C Leighton | ✓ |
| spouse | Elevia Belle Harriman | Elevia Belle Harriman | ✓ |
| spouse |  | Henry Leroy York | + |

### myheritage-record / denmark-census-2434583 — 70% (7/10, labels)

<https://www.myheritage.com/research/record-10181-2434583/terry-andersen-in-1930-denmark-census>

| Field | Before | After | |
|---|---|---|---|
| name | Terry Andersen | DNA New | ✗ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Mar 16 1909 | June 3 1887 | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   date | Nov 5 1930 |  | ✗ |
|   place | Sønderholm Frejlev, Sønderholm-Frejlev, Denmark | Nov 5 1930 Sønderholm Frejlev, Sønderholm-Frejlev, Denmark | ✓ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| parent | Peter Chr Andersen | Peter Chr Andersen | ✓ |
| parent | Henritte Andersen | Henritte Andersen | ✓ |
| child |  | Andersen, Terry | + |
| child |  | Andersen, Harry | + |
| child |  | Andersen, Dora | + |
| child |  | Andersen, Edit | + |
| child |  | Andersen, Hartman | + |

### myheritage-record / england-wales-census-101511824 — 77% (10/13, labels)

<https://www.myheritage.com/research/record-10156-101511824/samuel-jeremy-in-1901-england-wales-census>

| Field | Before | After | |
|---|---|---|---|
| name | Samuel Jeremy | DNA New | ✗ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Circa 1856 | Circa 1856 | ✓ |
|   place | Newchurch, Carmarthenshire | Newchurch, Carmarthenshire | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   date | 1901 |  | ✗ |
|   place | Tyrhos, New Church, Carmarthenshire, Wales | 1901 Tyrhos, New Church, Carmarthenshire, Wales | ✓ |
| fact MaritalStatus | MaritalStatus |  | ✗ |
| fact Occupation | Occupation | Occupation | ✓ |
| fact Census |  | Census · New Church Piece: 5115, Carmarthen, Conwil Page: 45, Carmarthenshire Family: 23, Wales Line: 16 | + |
| spouse | Rachel Jeremy | Rachel Jeremy | ✓ |
| child | Maggie M Jeremy | Maggie M Jeremy | ✓ |
| child | John J Thomas | John J Thomas | ✓ |
| spouse |  | Rachel Jeremy | + |
| spouse |  | Rachel Jeremy | + |
| child |  | John J Thomas | + |
| child |  | Maggie M Jeremy | + |

### myheritage-record / united-states-federal-census-41588411 — 55% (6/11, labels)

<https://www.myheritage.com/research/record-10128-41588411/martha-snark-in-1870-united-states-federal-census>

| Field | Before | After | |
|---|---|---|---|
| name | Martha Snark | DNA New | ✗ |
| gender | Female | Male | ✗ |
| fact Birth | Birth | Birth | ✓ |
|   date | Circa 1869 | Circa 1869 | ✓ |
|   place | Illinois, United States | Wisconsin | ✗ |
| fact Residence | Residence | Residence | ✓ |
|   date | June 1 1870 |  | ✗ |
|   place | Illinois, USA | June 1 1870 Illinois, USA | ✓ |
| fact Race | Race |  | ✗ |
| fact Census |  | Census · June 1 1870 · Illinois Series: M593 Family: 66 | + |
| parent | William Snark | William Snark | ✓ |
| parent | Amanda Snark | Amanda Snark | ✓ |
| spouse |  | Amanda Snark | + |
| spouse |  | Snark Amanda | + |
| child |  | Snark Chester | + |
| child |  | Snark William | + |
| child |  | Snark Addie | + |
| child |  | Snark | + |
| child |  | Snark Martha | + |

### myheritage-record / united-states-federal-census-53702700 — 73% (11/15, labels)

<https://www.myheritage.com/research/record-10132-53702700/john-s-townsend-in-1910-united-states-federal-census>

| Field | Before | After | |
|---|---|---|---|
| name | John S Townsend | DNA New | ✗ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | Circa 1871 | Circa 1871 | ✓ |
|   place | Mississippi, United States | Mississippi, United States | ✓ |
| fact Residence | Residence | Residence | ✓ |
|   date | 1910 |  | ✗ |
|   place | Roswell Ward 5, Chaves, New Mexico, USA | 1910 Roswell Ward 5, Chaves, New Mexico, USA | ✓ |
| fact MaritalStatus | MaritalStatus | MaritalStatus | ✓ |
| fact Race | Race |  | ✗ |
| fact Ethnicity | Ethnicity |  | ✗ |
| fact Census |  | Census · 1910 · Chaves Sheet: 1-B, New Mexico Family: 30 | + |
| fact Marriage |  | Marriage · Race | + |
| spouse | Dovey T Townsend | Dovey T Townsend | ✓ |
| child | Hiniard R Townsend | Hiniard R Townsend | ✓ |
| child | John S Townsend, Jr | John S Townsend, Jr | ✓ |
| child | Ester T Townsend | Ester T Townsend | ✓ |
| spouse |  | Dovey T Townsend | + |
| spouse |  | Townsend Dovey T | + |
| child |  | Townsend Hiniard R | + |
| child |  | Townsend, Jr John S | + |
| child |  | Townsend Ester T | + |

### openarch / marriage — 33% (3/9, microdata+labels)

<https://www.openarch.nl/show.php?archive=ens&identifier=4319e58e-3894-3f18-7a44-dacc65dcf90a>

| Field | Before | After | |
|---|---|---|---|
| name | Albertus Henderikus Kleinenberg | Albertus Henderikus Kleinenberg | ✓ |
| gender | Male | Male | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   date | 1931-05-22 |  | ✗ |
| fact Death |  | Death · on September 29, 1939 · Enschede (City Archives Enschede) | + |
| parent | Albert Kasper Kleinenberg |  | ✗ |
| parent | Dieuwkje Bosma |  | ✗ |
| spouse | Janna Moes | Janna Moes | ✓ |
| parent | Hendrikus Moes |  | ✗ |
| parent | Geertje Hilberts |  | ✗ |

### openarch / marriage-with-birth — 50% (6/12, microdata+labels+narrative)

<https://www.openarch.nl/show.php?archive=rzh&identifier=7a9488e8-91bf-4961-b328-bb30915b9069&lang=en>

| Field | Before | After | |
|---|---|---|---|
| name | Pieter Abraham Kropff | Pieter Abraham Kropff | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1791-08-30 | 1791-08-30 | ✓ |
|   place | Leiden | Leiden | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   date | 1822-03-14 |  | ✗ |
| parent | Johan Nicolaas Kropf |  | ✗ |
| parent | Catharina van Elsen |  | ✗ |
| spouse | Lisabeth Engelhard | Lisabeth Engelhard | ✓ |
| parent | Hendrik Engelhard |  | ✗ |
| parent | Anna Catharina Meerhooff |  | ✗ |

### openarch / baptism — 100% (3/3, microdata+labels)

<https://www.openarch.nl/show.php?archive=elo&identifier=f0b964b5-2d86-b61e-66b1-fcbd25b9c47c&lang=en>

| Field | Before | After | |
|---|---|---|---|
| name | Johannes | Johannes | ✓ |
| parent | Cornlis Immerzeel | Cornlis Immerzeel | ✓ |
| parent | Geertruij van Hassel | Geertruij van Hassel | ✓ |
| child |  | Job Janse Buijteweg | + |
| child |  | Aaltie Kasper Nierman | + |

### rodovid / hohenlohe — 77% (17/22, labels+narrative)

<https://en.rodovid.org/wk/Person:50000>

| Field | Before | After | |
|---|---|---|---|
| name | Ernest William Frederick von Hohenlohe-Langburg | Ernest William Frederick von Hohenlohe-Langburg | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 13 September 1863 | 13 September 1863 | ✓ |
|   place | Langenburg, Germany | Langenburg, Germany | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 20 April 1896 | 20 April 1896 | ✓ |
|   place | Coburg, Bavaria, Germany | Coburg, Bavaria, Germany | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 11 December 1950 | 11 December 1950 | ✓ |
|   place | Langenburg, Germany | Langenburg, Germany | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   date | 20 April 1896 |  | ✗ |
|   place | Coburg, Bavaria, Germany |  | ✗ |
| parent | Hermann Ernst Franz Bernhard von Hohenlohe-Langenburg | Hermann Ernst Franz Bernhard von Hohenlohe-Langenburg | ✓ |
| parent | Leopoldine Wilhelmine Pauline Amalie Maximiliane von Baden-Durlach |  | ✗ |
| spouse | Alexandra Louise Olga Victoria Saxe-Coburg | Alexandra Louise Olga Victoria Saxe-Coburg | ✓ |
| child | Godfrey Hermann Alfred von Hohenlohe-Langenburg | Godfrey Hermann Alfred von Hohenlohe-Langenburg | ✓ |
| child | Marie Melita Leopoldine Viktoria Feodora Alexandra Sophie |  | ✗ |
| child | Alexandra Beatrice von Hohenlohe-Langenburg (Hohenlohe-Langenburg) | Alexandra Beatrice von Hohenlohe-Langenburg | ✓ |
| child | Irma Helen von Hohenlohe-Langenburg (Hohenlohe-Langenburg) | Irma Helen von Hohenlohe-Langenburg | ✓ |
| child | Alfred de Hohenlohe-Langenbourg | Alfred de Hohenlohe-Langenbourg | ✓ |

### rodovid / bates — 86% (12/14, labels+narrative)

<https://ru.rodovid.org/wk/Person:30000>

| Field | Before | After | |
|---|---|---|---|
| name | Elizabeth Bates | Elizabeth Bates | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 12 April 1846 | 12 April 1846 | ✓ |
|   place | Kentucky, United States of America | Kentucky, United States of America | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | about 1870 | about 1870 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 13 September 1940 | 13 September 1940 | ✓ |
|   place | Kentucky, United States of America | Kentucky, United States of America | ✓ |
| fact Marriage | Marriage |  | ✗ |
|   date | about 1870 |  | ✗ |
| spouse | Harrison Hall | Harrison Hall | ✓ |
| child | Harrison B. Hall | Harrison B. Hall | ✓ |

### thepeerage / lyndhurst — 56% (10/18, labels+narrative)

<https://www.thepeerage.com/p10.htm#i91>

| Field | Before | After | |
|---|---|---|---|
| name | John Singleton Copley, 1st Baron Lyndhurst | John Singleton Copley, 1st Baron Lyndhurst | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 21 May 1772 | 21 May 1772 | ✓ |
|   place | Boston, Massachusetts, U.S.A. |  | ✗ |
| fact Marriage | Marriage |  | ✗ |
|   date | March 1819 |  | ✗ |
| fact Marriage | Marriage |  | ✗ |
|   date | August 1837 |  | ✗ |
| fact Death | Death | Death | ✓ |
|   date | 12 October 1863 | 12 October 1863 | ✓ |
| parent | John Singleton Copley | John Singleton Copley | ✓ |
| parent | Susannah Farnum Clarke | Susannah Farnum Clarke. He | ✓ |
| spouse | Sarah Garay Brunsden |  | ✗ |
| spouse | Georgiana Goldsmith |  | ✗ |
| child | Hon. Sophia Clarence Copley | Hon. Sophia Clarence Copley | ✓ |
| child | Hon. Sarah Elizabeth Copley | Hon. Sarah Elizabeth Copley | ✓ |
| child | Hon. Georgiana Susan Copley |  | ✗ |
| child |  | Georgiana Goldsmith | + |

### thepeerage / susanna — 77% (10/13, labels+narrative)

<https://www.thepeerage.com/p1000.htm#i9991>

| Field | Before | After | |
|---|---|---|---|
| name | Lady Susanna Stewart | Lady Susanna Stewart | ✓ |
| gender | Female | Female | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 23 May 1768 | on 23 May 1768 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 15 August 1805 | 15 August 1805 | ✓ |
| fact Birth |  | Birth · c 1771 | + |
| parent | Alexander Stewart, 6th Earl of Galloway | Alexander Stewart | ✓ |
| parent | Lady Catherine Cochrane |  | ✗ |
| spouse | Granville Leveson-Gower, 1st Marquess of Stafford | Granville Leveson-Gower | ✓ |
| child | Lady Georgiana Augusta Leveson-Gower | Lady Georgiana Augusta Leveson-Gower | ✓ |
| child | Lady Susan Leveson-Gower |  | ✗ |
| child | Lady Charlotte Sophia Leveson-Gower | Lady Charlotte Sophia Leveson-Gower | ✓ |
| child | Granville Leveson-Gower, 1st Earl Granville |  | ✗ |

### thepeerage / granville — 79% (15/19, labels+narrative)

<https://www.thepeerage.com/p1000.htm#i9992>

| Field | Before | After | |
|---|---|---|---|
| name | Granville Leveson-Gower, 1st Earl Granville | Granville Leveson-Gower, 1st Earl Granville | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 12 October 1773 | 12 October 1773 | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 24 December 1809 | on 24 December 1809 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 8 January 1846 | 8 January 1846 | ✓ |
| parent | Granville Leveson-Gower, 1st Marquess of Stafford | Granville Leveson-Gower | ✓ |
| parent | Lady Susanna Stewart |  | ✗ |
| spouse | Lady Harriet Elizabeth Cavendish | Lady Harriet Elizabeth Cavendish | ✓ |
| child | Harriet Emma Arundel Stewart | Harriet Emma Arundel Stewart | ✓ |
| spouse | Lady Henrietta Frances Spencer |  | ✗ |
| child | George Arundel Stewart |  | ✗ |
| child | Lady Susan Georgiana Leveson-Gower | Lady Susan Georgiana Leveson-Gower | ✓ |
| child | Lady Georgiana Charlotte Leveson-Gower | Lady Georgiana Charlotte Leveson-Gower | ✓ |
| child | Granville George Leveson-Gower, 2nd Earl Granville |  | ✗ |
| child | Hon. Granville William Leveson-Gower | Hon. Granville William Leveson-Gower | ✓ |
| child | Hon. Edward Frederick Leveson-Gower | Hon. Edward Frederick Leveson-Gower | ✓ |
| child |  | Lady Harriet Elizabeth Cavendish | + |
| child |  | Lady Susan Georgiana Leveson-Gower | + |
| child |  | Lady Georgiana Charlotte Leveson-Gower | + |
| child |  | Hon. Granville William Leveson-Gower | + |
| child |  | Hon. Edward Frederick Leveson-Gower | + |

### thepeerage / no-hash — 54% (7/13, narrative)

<https://www.thepeerage.com/p1000.htm>

| Field | Before | After | |
|---|---|---|---|
| name | Lady Susanna Stewart |  | ✗ |
| gender | Female | Female | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 23 May 1768 | on 23 May 1768 | ✓ |
| fact Death | Death | Death | ✓ |
|   date | 15 August 1805 | 15 August 1805 | ✓ |
| fact Birth |  | Birth · c 1771 | + |
| parent | Alexander Stewart, 6th Earl of Galloway | Alexander Stewart | ✓ |
| parent | Lady Catherine Cochrane |  | ✗ |
| spouse | Granville Leveson-Gower, 1st Marquess of Stafford | Granville Leveson-Gower | ✓ |
| child | Lady Georgiana Augusta Leveson-Gower |  | ✗ |
| child | Lady Susan Leveson-Gower |  | ✗ |
| child | Lady Charlotte Sophia Leveson-Gower |  | ✗ |
| child | Granville Leveson-Gower, 1st Earl Granville |  | ✗ |
| spouse |  | Lady Harriet Elizabeth Cavendish | + |
| spouse |  | Henry Charles Somerset | + |
| spouse |  | Lord Albert Sutherland-Leveson-Gower | + |
| spouse |  | Frederic Neville Sutherland-Leveson-Gower | + |
| spouse |  | Charles Stuart | + |
| spouse |  | Dudley Ryder | + |
| spouse |  | Lady Susan Leveson-Gower | + |
| spouse |  | Laura Russell | + |
| spouse |  | Lt.-Col. Geoffrey Babington | + |

### werelate / washington — 33% (10/30, labels+narrative)

<https://www.werelate.org/wiki/Person:George_Washington_%286%29>

| Field | Before | After | |
|---|---|---|---|
| name | President George Washington | George Washington | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 22 Feb 1732 | Feb. 22, 1732 | ✓ |
|   place | Wakefield, Westmoreland, Virginia, United States | Colonial Beach, Westmoreland County, Virginia, USA | ✗ |
| fact MilitaryService | MilitaryService |  | ✗ |
|   date | 6 Nov 1752 |  | ✗ |
|   place | Virginia, United States |  | ✗ |
| fact Occupation | Occupation | Occupation | ✓ |
|   date | from 24 Jul 1758 to 1769 |  | ✗ |
|   place | Williamsburg, Virginia, United States |  | ✗ |
| fact Property | Property |  | ✗ |
|   date | 14 Mar 1768 |  | ✗ |
| fact Occupation | Occupation |  | ✗ |
|   date | 5 Aug 1774 |  | ✗ |
|   place | Philadelphia, Philadelphia, Pennsylvania, United States |  | ✗ |
| fact Occupation | Occupation |  | ✗ |
|   date | 4 Feb 1789 |  | ✗ |
|   place | United States |  | ✗ |
| fact Death | Death | Death | ✓ |
|   date | 14 Dec 1799 | Dec. 14, 1799 | ✓ |
|   place | Fairfax (independent city), Virginia, United States | Mount Vernon, Fairfax County, Virginia, USA | ✗ |
| fact Burial | Burial | Burial | ✓ |
|   date | 18 Dec 1799 |  | ✗ |
|   place | Fairfax (independent city), Virginia, United States | Saint Paul's Cathedral, London, City of London, Greater London, England | ✗ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 6 Jan 1759 | 6 Jan 1759 | ✓ |
| parent | Captain Augustine Washington |  | ✗ |
| parent | Mary Ball |  | ✗ |
| spouse | Martha  Dandridge |  | ✗ |

### werelate / mary-ball — 32% (6/19, labels+narrative)

<https://www.werelate.org/wiki/Person:Mary_Ball_%285%29>

| Field | Before | After | |
|---|---|---|---|
| name | Mary Ball | Mary Ball | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth |  | ✗ |
|   date | 1708 |  | ✗ |
|   place | Lancaster County, Virginia |  | ✗ |
| fact Death | Death | Death | ✓ |
|   date | 25 Aug 1789 | Aug 1789 | ✗ |
|   place | Fredericksburg, Virginia, United States | Fredericksburg, Virginia, United States | ✓ |
| fact Marriage | Marriage | Marriage | ✓ |
|   date | 6 Mar 1731 | 6 Mar 1731 | ✓ |
| parent | Col. Joseph Ball, of St. Mary's White Chapel Parish |  | ✗ |
| parent | Mary Unknown |  | ✗ |
| spouse | Captain Augustine Washington |  | ✗ |
| child | President George Washington |  | ✗ |
| child | Betty Washington |  | ✗ |
| child | Samuel Washington |  | ✗ |
| child | John Augustine Washington |  | ✗ |
| child | Charles Washington |  | ✗ |
| child | Mildred Washington |  | ✗ |
| parent |  | Lawrence | + |
| parent |  | Mildred | + |
| child |  | George Washington. Mary Ball | + |

### wikitree / Theodore Roosevelt Jr — 100% (18/18, microdata+labels+narrative)

<https://www.wikitree.com/wiki/Roosevelt-18>

| Field | Before | After | |
|---|---|---|---|
| name | President Theodore Roosevelt Jr. | Theodore Roosevelt | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | October 27, 1858 | October 27, 1858 | ✓ |
|   place | New York City, New York, USA | New York City, New York, USA | ✓ |
| fact Death | Death | Death | ✓ |
|   date | January 6, 1919 | January 6, 1919 | ✓ |
|   place | Oyster Bay, Long Island, New York, USA | Oyster Bay, Long Island, New York, USA | ✓ |
| fact Marriage |  | Marriage · October 27, 1880 · Brookline, Massachusetts | + |
| parent | Theodore  Roosevelt Sr. | Theodore Roosevelt Sr. | ✓ |
| parent | Martha  Bulloch | Martha (Bulloch) Roosevelt | ✓ |
| spouse | Alice Hathaway Lee | Alice Hathaway (Lee) Roosevelt | ✓ |
| spouse | Edith Kermit Carow | Edith Kermit (Carow) Roosevelt | ✓ |
| child | Alice Lee Roosevelt | Alice Lee (Roosevelt) Longworth | ✓ |
| child | Theodore  Roosevelt III | Theodore Roosevelt III | ✓ |
| child | Kermit  Roosevelt | Kermit Roosevelt | ✓ |
| child | Ethel Carow Roosevelt | Ethel Carow (Roosevelt) Derby | ✓ |
| child | Archibald Bulloch Roosevelt | Archibald Bulloch Roosevelt | ✓ |
| child | Quentin  Roosevelt | Quentin Roosevelt | ✓ |
| parent |  | Theodore Roosevelt Sr. and Martha | + |
| parent |  | Martha | + |
| spouse |  | Alice Hathaway | + |

### wikitree / Alice Roosevelt — 100% (12/12, microdata+labels+narrative)

<https://www.wikitree.com/wiki/Lee-16>

| Field | Before | After | |
|---|---|---|---|
| name | Alice Lee | Alice Lee | ✓ |
| gender | Female | Female | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | July 29, 1861 | July 29, 1861 | ✓ |
|   place | Boston, Suffolk, Massachusetts, United States | Boston, Suffolk, Massachusetts, United States | ✓ |
| fact Death | Death | Death | ✓ |
|   date | February 14, 1884 | February 14, 1884 | ✓ |
|   place | New York City, New York, United States | New York City, New York, United States | ✓ |
| fact Marriage |  | Marriage · October 27, 1880 · Brookline, Massachusetts | + |
| parent | George Cabot Lee | George Cabot Lee | ✓ |
| parent | Caroline Watts Haskell | Caroline Watts (Haskell) Lee | ✓ |
| spouse | Theodore  Roosevelt Jr. | Theodore Roosevelt Jr. | ✓ |
| child | Alice Lee Roosevelt | Alice Lee (Roosevelt) Longworth | ✓ |
| parent |  | Caroline Watts | + |

### wikitree / Edward M Salty Smith — 100% (11/11, microdata+labels+narrative)

<https://www.wikitree.com/wiki/Smith-9130>

| Field | Before | After | |
|---|---|---|---|
| name | Edward Smith | Edward Smith | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1847 | 1847-- | ✓ |
|   place | Calstone, Wiltshire, England | Calstone, Wiltshire, England | ✓ |
| fact Residence |  | Residence · Residence: Date: 1891 Place: Calne Without, Wiltshire, England[3] | + |
| spouse | Sarah Ann  Rivers | Sarah Ann Rivers | ✓ |
| child | Fanny  Smith | Fanny Smith | ✓ |
| child | Anne  Smith | Anne Smith | ✓ |
| child | Maud  Smith | Maud Smith | ✓ |
| child | Dora  Smith | Dora Smith | ✓ |
| child | Arthur Henry  Smith | Arthur Henry Smith | ✓ |

### wikitree / Edward Smith — 100% (10/10, microdata+labels+narrative)

<https://www.wikitree.com/wiki/Smith-19124>

| Field | Before | After | |
|---|---|---|---|
| name | Edward Smith | Edward Smith | ✓ |
| gender | Male | Male | ✓ |
| fact Birth | Birth | Birth | ✓ |
|   date | 1847 | 1847-- | ✓ |
| fact Residence |  | Residence · Residence: Date: 1891 Place: Calne Without, Wiltshire, England[3] | + |
| spouse | Sarah Ann  Rivers | Sarah Ann Rivers | ✓ |
| child | Fanny  Smith | Fanny Smith | ✓ |
| child | Anne  Smith | Anne Smith | ✓ |
| child | Maud  Smith | Maud Smith | ✓ |
| child | Dora  Smith | Dora Smith | ✓ |
| child | Arthur Henry  Smith | Arthur Henry Smith | ✓ |
