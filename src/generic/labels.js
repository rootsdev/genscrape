/**
 * Multilingual dictionary mapping page labels to genealogical fields.
 *
 * Labels are normalized first (lowercase, no accents, possessive "'s" and
 * punctuation removed), then tested against these patterns in order.
 * Languages: en, fr, de, nl, no, da, sv, es.
 */

var stripAccents = require('./dates').stripAccents;

var FIELDS = [
  // Relatives (must come before the plain name/given/surname rules)
  ['groomGiven',    /^(groom|bridegroom|bruidegom) (forenames?|first names?|given names?|christian names?|voornaam)$/],
  ['groomSurname',  /^(groom|bridegroom|bruidegom) (surname|last name|family name|achternaam)$/],
  ['groom',         /^(groom|bridegroom|bruidegom|epoux|brautigam|brudgom)( name)?$/],
  ['brideGiven',    /^(bride|bruid) (forenames?|first names?|given names?|christian names?|voornaam)$/],
  ['brideSurname',  /^(bride|bruid) (surname|last name|family name|maiden name|achternaam)$/],
  ['bride',         /^(bride|bruid|epouse|braut|brud)( name)?$/],
  ['fatherGiven',   /^father (forenames?|first names?|given names?|christian names?|voornaam|prenoms?)$/],
  ['fatherSurname', /^father (surname|last name|family name|achternaam)$/],
  ['motherMaiden',  /^mother (maiden (name|surname)|nee)$|^maiden name$/],
  ['motherGiven',   /^mother (forenames?|first names?|given names?|christian names?|voornaam|prenoms?)$/],
  ['motherSurname', /^mother (surname|last name|family name|achternaam)$/],
  ['father',        /^(father|father (full )?name|name of father|vader|pere|vater|far|fader|padre|son of)$/],
  ['mother',        /^(mother|mother (full )?name|name of mother|moeder|mere|mutter|mor|moder|madre)$/],
  ['relationToHead', /^(relationship|relation|relation to head|relationship to head|rel to head|family position|position in family|familiestilling|stilling i familien|stellung)$/],
  ['parents',       /^(parents?|ouders|eltern|foreldre|foraldrar|forældre|padres|child of|son daughter of)$/],
  ['spouse',        /^(spouses?|husband|wife|partner|spouse name|married to|echtgeno(o|te)|partner|epoux|epouse|conjoint|ehemann|ehefrau|ehepartner|ektefelle|aegtefaelle|make|maka|hustru|esposo|esposa|conyuge)$/],
  ['children',      /^(children|child|kinderen|kind|enfants?|kinder|barn|hijos)$/],

  // Principal identity
  ['given',         /^(given names?|givennames?|first names?|firstname|forenames?|christian names?|voornamen?|prenoms?|vornamen?|fornavn|fornamn|nombres?)$/],
  ['surname',       /^(surnames?|last names?|family names?|lastname|familyname|achternaam|nom de famille|nom|nachname|familienname|etternavn|efternamn|apellidos?)$/],
  ['name',          /^(full name|fullname|name|naam|navn|namn|nombre|person|person name|nom complet)$/],
  ['gender',        /^(sex|gender|geslacht|sexe|geschlecht|kjonn|kon|kjoenn|sexo)$/],
  ['age',           /^(age|age at death|age at burial|leeftijd|alder|alter|edad)$/],
  ['occupation',    /^(occupation|profession|beroep|metier|beruf|yrke|stilling|ocupacion|trade)$/],
  ['residence',     /^(residence|abode|address|woonplaats|domicile|wohnort|bosted|bustad|hometown|home town|place of residence|place of association|lives in|residence place)$/],
  ['maritalStatus', /^(marital status|condition|civil status|burgerlijke staat|etat civil|situation familiale|familienstand|sivilstand|civilstand|estado civil)$/],
  ['religion',      /^(religion|godsdienst|religion|konfession|tro)$/],

  // Birth
  ['birthDate',     /^(date of birth|birth date|birthdate|year of birth|birth year|born year|born on|dob|geboortedatum|date de naissance|geburtsdatum|fodselsdato|fodselsdag|fecha de nacimiento|fodelsedatum)$/],
  ['birthPlace',    /^(place of birth|birth place|birthplace|birth location|born in|where born|birth (county|parish|town|country|state|province|city)|geboorteplaats|lieu de naissance|geburtsort|fodested|fodested|fodselssted|lugar de nacimiento|fodelseort)$/],
  ['birth',         /^(born|birth|geboren|geboorte|naissance|ne|nee|fodt|fodd|nacimiento|geburt)$/],

  // Baptism
  ['baptismDate',   /^(baptism date|year of baptism|baptism year|date of baptism|christening date|baptised on|doopdatum|date de bapteme|taufdatum|dapsdato|fecha de bautismo)$/],
  ['baptismPlace',  /^(baptism place|place of baptism|christening place|doopplaats|lieu de bapteme|taufort|dapssted)$/],
  ['baptism',       /^(baptism|baptised|baptized|christening|christened|gedoopt|doop|bapteme|baptise|taufe|getauft|dap|dopt|dopte|daab|bautismo)$/],

  // Death
  ['deathDate',     /^(date of death|death date|deathdate|year of death|death year|died on|overlijdensdatum|date de deces|sterbedatum|todesdatum|dodsdato|dodsdag|fecha de defuncion|dodsdatum)$/],
  ['deathPlace',    /^(place of death|death place|deathplace|death location|died in|overlijdensplaats|lieu de deces|sterbeort|dodssted|dodsort|lugar de defuncion)$/],
  ['death',         /^(died|death|deceased|overleden|overlijden|deces|decede|decedee|gestorben|tod|dod|dode|dodd|fallecimiento|defuncion)$/],
  ['deathCause',    /^(cause of death|doodsoorzaak|cause du deces|todesursache|dodsarsak)$/],

  // Burial
  ['burialDate',    /^(burial date|burialdate|year of burial|burial year|date of burial|buried on|interment date|begraafdatum|date d inhumation|begrabnisdatum|begravelsesdato)$/],
  ['cemetery',      /^(cemetery|cemetery name|burial place|place of burial|grave|cemetery or memorial|memorial|begraafplaats|cimetiere|friedhof|kirkegard|kyrkogard|cementerio|buried at|buried or commemorated at|commemorated|commemorated at|burial location|interment)$/],
  ['burial',        /^(burial|buried|begraven|begrafenis|inhumation|inhume|beerdigt|begraben|beerdigung|begravd|begravet|gravlagt|entierro)$/],

  // Marriage
  ['marriageDate',  /^(marriage date|year of marriage|marriage year|date of marriage|married on|huwelijksdatum|trouwdatum|date de mariage|heiratsdatum|vigseldatum|vielsesdato|fecha de matrimonio)$/],
  ['marriagePlace', /^(marriage place|place of marriage|married in|huwelijksplaats|lieu de mariage|heiratsort|vigselort)$/],
  ['marriage',      /^(married|marriage|huwelijk|getrouwd|mariage|marie|mariee|heirat|verheiratet|hochzeit|gift|vigsel|viet|matrimonio)$/],

  // Military
  ['serviceNumber', /^(service (number|no)|regimental (number|no)|serial (number|no)|service id|army number)$/],
  ['rank',          /^(rank|grade|dienstgrad|grad|rang)$/],
  ['unit',          /^(unit|regiment|battalion|regiment service|unit name|regiment or unit|service branch|branch of service|branch|division|corps|ship)$/],
  ['conflict',      /^(conflict|war|campaign|conflict period)$/],

  // Generic record event (record sites: "Record type", "Date", "Place")
  ['censusYear',    /^(census|census year|year of census|folketelling|volkstelling|recensement|volkszahlung)$/],
  ['eventType',     /^(record type|event type|event|type|type of record|soort akte|soort registratie|aktetype|type d acte|kildetype|kirkebokstype|registration type)$/],
  ['date',          /^(date|datum|dato|fecha|event date|registration date|year)$/],
  ['place',         /^(place|plaats|lieu|ort|sted|lugar|location|event place|parish|church|church name|registration district|registration area|reg area|sr district reg area|district|county|country|state|province|town|city|village|municipality|gemeente|commune|gemeinde|kommune|kirkesogn|prestegjeld)$/]
];

// Event words used when a page says "Record type: Baptism" etc.
var EVENT_WORDS = [
  ['Baptism',   /bapt|christen|doop|dap|taufe|bautis/],
  ['Birth',     /birth|geboort|naissance|fodsel|fodt|geburt|nacim/],
  ['Marriage',  /marri|huwelijk|mariage|heirat|vigsel|viels|matrimon|banns/],
  ['Burial',    /burial|begra|inhum|beerd|gravl|entierr/],
  ['Death',     /death|overlijd|deces|sterbe|dod|defunc/],
  ['Census',    /census|volkstelling|recensement|volkszahl|folketelling|folkrakning|censo/]
];

function normalizeLabel(label){
  return stripAccents((label || '').toLowerCase())
    .replace(/\(.*$/, '')                // "Church name (links to more...)"
    .replace(/['’]s\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    // Role prefixes on record pages: "Person forename", "Child name", "Deceased surname"
    .replace(/^(burial|baptism|marriage|birth|death|christening) (person|deceased|child) (?=\w)/, '')
    .replace(/^(person|principal|child|deceased|individual|subject|the) (?=\w)/, '')
    .trim();
}

/**
 * @param {String} label raw label text
 * @return {String|null} field key
 */
function fieldForLabel(label){
  var norm = normalizeLabel(label);
  if(!norm || norm.length > 40) return null;
  for(var i = 0; i < FIELDS.length; i++){
    if(FIELDS[i][1].test(norm)) return FIELDS[i][0];
  }
  return null;
}

function eventTypeForText(text){
  var norm = normalizeLabel(text);
  for(var i = 0; i < EVENT_WORDS.length; i++){
    if(EVENT_WORDS[i][1].test(norm)) return EVENT_WORDS[i][0];
  }
  return null;
}

var NULLISH = /^(null|none|n a|na|unknown|not stated|not known|not available|not recorded|\?|-|–|—|0|unk)$/;

function isNullish(value){
  return NULLISH.test(normalizeLabel(value) || (value || '').trim());
}

function genderForText(text){
  var norm = normalizeLabel(text);
  if(/^(m|male|man|mann|mand|homme|masculin|mannlich|maennlich|hombre|masculino|man|manlig|mannlig|jongen|son|boy)$/.test(norm)) return 'Male';
  if(/^(f|v|w|k|female|woman|vrouw|femme|feminin|weiblich|kvinne|kvinna|kvinde|mujer|femenino|kvinnlig|meisje|daughter|girl)$/.test(norm)) return 'Female';
  return null;
}

module.exports = {
  fieldForLabel: fieldForLabel,
  eventTypeForText: eventTypeForText,
  genderForText: genderForText,
  isNullish: isNullish,
  normalizeLabel: normalizeLabel
};
