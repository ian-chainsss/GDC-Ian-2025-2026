# Speciale Handige Datatypes - PostgreSQL
Dit document beschrijft enkele speciale datatypes die beschikbaar zijn in PostgreSQL en hoe ze kunnen worden gebruikt in uw databaseontwerpen.

## Inhoudsopgave
- [JSON en JSONB](#1-json-en-jsonb)
- [JSON Path Type](#2-json-path-type)
- [Arrays](#3-arrays)
- [UUID (Universally Unique Identifier)](#4-uuid-universally-unique-identifier)
- [Range Types](#5-range-types)
- [Network Types](#6-network-types)
- [ENUM Types (Enumerated Types)](#7-enum-types-enumerated-types)
- [Hstore](#8-hstore)
- [Composite Types](#9-composite-types)
- [Geometric Types](#10-geometric-types)
- [XML Type](#11-xml-type)
- [Bit String Types](#12-bit-string-types)
- [References](#13-references)

---

## 1. JSON en JSONB
PostgreSQL biedt ondersteuning voor JSON (JavaScript Object Notation) en JSONB (binary JSON).  

### 1.1. JSON
JSON is een tekstgebaseerd formaat voor het opslaan van gestructureerde gegevens.   
Het is handig voor het opslaan van flexibele gegevensstructuren, zoals configuratie-instellingen of dynamische velden.
- Gewoon opslaan zoals het binnen komt, inclusief witruimtes, dubbele keys en volgorde van objecten.
- Elke keer als deze data wordt gequeryd, wordt het geparsed, wat kan leiden tot prestatieproblemen bij grote datasets.
- Kortere write tijd, maar langere read tijd.
- Handig als je de originele representatie exact wil bewaren, bijvoorbeeld voor logging of import/export.
- Minder geschikt voor intensieve query's op specifieke sleutels of voor indexering.

#### Operators
- `->` : Toegang tot een JSON-object door sleutel en returneert een JSON-object.
- `->>` : Toegang tot een JSON-object door sleutel en retourneert tekst.
- `#>` : Toegang tot een genest JSON-object en retourneert een JSON-object.
- `#>>` : Toegang tot een genest JSON-object en retourneert tekst.

### 1.2. JSONB
Deze datatypes zijn handig voor het opslaan van gestructureerde gegevens in een flexibele manier.  
JSONB is geoptimaliseerd voor opslag en query-prestaties.
- Parsing: JSONB wordt opgeslagen in een binair formaat, waardoor het sneller is om te parsen en te queryen.
- Langere write tijd, maar kortere read tijd.
- Key volgorde gaat verloren, dubbele keys worden verwijderd en je kan indexen maken op JSONB-velden.
- Indexering: JSONB ondersteunt GIN-indexen, wat snelle zoekopdrachten mogelijk maakt.
- Praktisch: flexibele "extra velden" opslaan zonder schemawijzigingen/migraties.
- jsonb_set() : Functie om een waarde in een JSONB-object bij te werken.
- jsonb_build_object() : Functie om een JSONB-object te bouwen uit sleutel-waarde-paren.
- JSONB is meestal de beste keuze voor applicatiedata die je zowel wil bewaren als actief wil bevragen.
- JSONB normaliseert de inhoud, waardoor vergelijking en indexering consistenter werken dan bij JSON.

#### Operators
- `->` : Toegang tot een JSON-object door sleutel en returneert een JSON-object.
- `->>` : Toegang tot een JSON-object door sleutel en retourneert tekst.
- `#>` : Toegang tot een genest JSON-object en retourneert een JSON-object.
- `#>>` : Toegang tot een genest JSON-object en retourneert tekst.
- `@>` : Controleert of een JSONB-object een ander JSONB-object bevat.
- `<@` : Controleert of een JSONB-object volledig in een ander JSONB-object voorkomt.
- `?` : Controleert of een JSONB-object een bepaalde sleutel bevat.
- `?|` : Controleert of een JSONB-object een van de opgegeven sleutels bevat.
- `?&` : Controleert of een JSONB-object alle opgegeven sleutels bevat.
- `||`: Combineert twee JSONB-objecten, merge.
- `-` : Verwijdert een sleutel uit een JSONB-object.

#### JSON vs JSONB
| Eigenschap | JSON | JSONB |
| --- | --- | --- |
| Opslag | Tekst | Binair |
| Originele key-volgorde | Behouden | Niet gegarandeerd |
| Dubbele keys | Behouden | Gecondenseerd naar laatste waarde |
| Indexering | Beperkt | Sterk, o.a. GIN |
| Schrijfprestatie | Vaak sneller | Vaak iets trager |
| Lees- en queryprestatie | Vaak trager | Vaak sneller |

#### Veelgemaakte fouten
- JSON gebruiken terwijl je eigenlijk vaak op losse velden filtert; dan is **JSONB** bijna altijd beter.
- Een JSONB-kolom gebruiken als vervanging voor een normaal schema terwijl de structuur in werkelijkheid stabiel is.
- Vergeten dat `->>` tekst teruggeeft en dus casts nodig zijn voor numerieke vergelijkingen.
- Denken dat een GIN-index automatisch elke JSONB-query snel maakt; complexe filters kunnen nog steeds veel recheck werk vragen.

---

## 2. JSON Path Type

Het **jsonpath** type beschrijft een SQL/JSON path-expressie om gegevens in JSON of JSONB gericht te doorzoeken. Het is geen opslagformaat voor data zelf, maar een manier om query's expressiever en vaak efficiënter te maken.
- Gebruik dit wanneer je complexe filters, vergelijkingen of geneste selecties op JSONB nodig hebt.
- Handig voor validatie-achtige checks zoals: bestaat er ergens in het object een waarde die aan een voorwaarde voldoet.
- Minder nuttig voor simpele key-lookup; daarvoor zijn de gewone JSONB-operatoren vaak duidelijker.

### 2.1. Technische werking
- Een jsonpath-expressie wordt als tekst ingevoerd, maar PostgreSQL kan die intern parsen en valideren als path-expressie.
- De belangrijkste operatoren zijn `@?` voor existence checks en `@@` voor boolean evaluaties.
- Functies zoals `jsonb_path_query()`, `jsonb_path_exists()` en `jsonb_path_match()` laten je gericht JSONB doorzoeken.
- In combinatie met **GIN-indexen** op JSONB kunnen veel path-queries versnellen, al hangt de exacte winst af van het patroon in de expressie.

### 2.2. Wanneer gebruiken
- Voor complexe rapportage op semi-gestructureerde data.
- Wanneer de applicatie meerdere niveaus diep in JSONB moet filteren.
- Wanneer je één querytaal wil voor opslag, filtering en validatie van JSON-inhoud.

### 2.3. Veelgemaakte fouten
- JSONPath gebruiken voor simpele velden waar een gewone kolom of `->>`-extractie duidelijker en sneller is.
- Verwachten dat elke JSONPath-query automatisch index-gedreven wordt.
- Vergeten dat kleine syntaxisverschillen in path-expressies tot totaal andere resultaten leiden.

### 2.4. Handige voorbeelden
- `$.a.b ? (@ > 10)`: filtert op een geneste waarde.
- `$.items[*] ? (@.status == "active")`: zoekt in een array van objecten.
- `jsonb_path_exists(data, '$.customer.id ? (@ != null)')`: controleert of een geneste sleutel bestaat.

---

## 3. Arrays
Arrays zijn een krachtig datatype in PostgreSQL dat het mogelijk maakt om meerdere waarden van hetzelfde type in één kolom op te slaan.  
Dit kan handig zijn voor het opslaan van lijsten of verzamelingen van gegevens.
- Native array-kolommen: PostgreSQL ondersteunt arrays van elk datatype, inclusief gebruikersgedefinieerde types.
    - Bijvoorbeeld: `integer[]`, `text[]`, `jsonb[]` ...
    - Array-literals: Arrays kunnen worden gedefinieerd met behulp van array-literals, bijvoorbeeld: `'{1,2,3}'::integer[]`.
- Handig voor tags, categorieën, permissies of andere gegevens die meerdere waarden kunnen hebben.
- In de praktijk zijn arrays vooral handig als de lijst klein, homogeen en optioneel is.
- Voor relationele many-to-many-relaties blijft een aparte koppeltabel meestal beter.

### 3.1. Array-functies
- `array_length()`: Geeft de lengte van een array terug.
- `unnest()`: Zet een array om in een set van rijen, waardoor het mogelijk is om de elementen van de array te queryen alsof ze afzonderlijke rijen zijn.
- `array_append()`: Voegt een element toe aan het einde van een array.
- `array_remove()`: Verwijdert een element uit een array.
- `array_agg()`: Aggregatiefunctie die een set van waarden samenvoegt tot een array.
- `array_to_string()`: Zet een array om in een string met een opgegeven scheidingsteken.
- `string_to_array()`: Zet een string om in een array op basis van een opgegeven scheidingsteken.
- `array_position()`: Geeft de positie van een element in een array terug.
- `array_replace()`: Vervangt een element in een array door een ander element.
- `array_remove()`: Verwijdert een element uit een array.
- `array_fill()`: Maakt een array gevuld met een opgegeven waarde en dimensies.
- `array_dims()`: Geeft de dimensies van een array terug.
- `array_ndims()`: Geeft het aantal dimensies van een array terug.
- `array_cat()`: Combineert twee arrays tot één array.
- ...

### 3.2. Array-opslag en indexering
- Arrays worden als één kolomwaarde opgeslagen; kleine arrays kunnen inline staan, grotere waarden kunnen naar **TOAST** verhuizen.
- PostgreSQL bewaart de dimensies en het type-element per array, zodat een `text[]` echt iets anders is dan een `jsonb[]`.
- Voor zoeken op containments of overlap zijn **GIN-indexen** vaak nuttig, bijvoorbeeld bij tags of permissies.
- `unnest()` is krachtig, maar kan query's duur maken als je het op grote datasets gebruikt zonder goede filtering.

### 3.3. Array-operators
- `@>`: Controleert of een array een andere array bevat.
- `<@`: Controleert of een array wordt bevat door een andere array.
- `&&`: Controleert of twee arrays overlappen (gemeenschappelijke elementen hebben).
- `||`: Combineert twee arrays tot één array.
- `-`: Verwijdert een element uit een array.
- `#`: Geeft het aantal elementen in een array terug.
- ...

### 3.4. Veelgemaakte fouten
- Een array gebruiken waar je eigenlijk individuele rijen nodig hebt; dat maakt normalisatie, filtering en integriteitsregels moeilijker.
- Vergeten dat PostgreSQL arrays **1-based** indexeren in veel functies en operatoren.
- Lege array en `NULL` door elkaar halen; dat zijn verschillende waarden met verschillende semantics.
- Verwachten dat een array automatisch uniek is; PostgreSQL handhaaft dat niet zonder extra logica.

---

## 4. UUID (Universally Unique Identifier)
UUID is een datatype dat wordt gebruikt om unieke identificatoren te genereren.  
Het is handig voor het identificeren van records op een manier die uniek is over verschillende systemen en databases heen.
- Formaat: UUID's zijn 128-bits waarden die meestal worden weergegeven als een reeks van hexadecimale cijfers, bijvoorbeeld: `550e8400-e29b-41d4-a716-446655440000`.
- Generatie: PostgreSQL kan UUID's genereren via functies zoals `gen_random_uuid()` of `uuid_generate_v4()`, afhankelijk van de gebruikte extensie en setup.
- Gebruik: UUID's worden vaak gebruikt als primaire sleutels in tabellen, vooral in gedistribueerde systemen waar unieke identificatie cruciaal is.
- Voordelen: Ze zijn uniek, moeilijk te raden en kunnen onafhankelijk van de database worden gegenereerd.
- Nadelen: Ze zijn groter dan traditionele integer-sleutels, wat kan leiden tot grotere indexen en iets tragere prestaties bij het gebruik als primaire sleutel.
- In apps met veel inserts is een willekeurige UUID als primaire sleutel vaak slechter voor index-lokaliteit dan een oplopende integer of tijd-geordende sleutel.

### 4.1. UUID-functies
- `uuid_generate_v1()`: Genereert een UUID gebaseerd op de huidige tijd en de MAC-adres van de machine.
- `uuid_generate_v4()`: Genereert een willekeurige UUID.
- `uuid_nil()`: Geeft een "lege" UUID terug (00000000-0000-0000-0000-000000000000).
- `uuid_is_nil(uuid)`: Controleert of een gegeven UUID de "lege" UUID is.
- `gen_random_uuid()`: Genereert een willekeurige UUID (beschikbaar in PostgreSQL 13 en hoger).
- `uuid_generate_v5(namespace uuid, name text)`: Genereert een UUID gebaseerd op een namespace en een naam (versie 5 UUID).
- ...

### 4.2. Veelgemaakte fouten
- UUID's opslaan als tekst in plaats van als **uuid**-type; dat kost ruimte en maakt indexering minder efficiënt.
- Verwachten dat UUID's sorteren op aanmaakvolgorde; een v4-UUID is willekeurig.
- UUID gebruiken als primaire sleutel zonder na te denken over indexfragmentatie en join-kosten.
- Verschillende UUID-generators door elkaar gebruiken zonder een duidelijke migratiestrategie.

---

## 5. Range Types
Range types zijn een krachtig datatype in PostgreSQL dat het mogelijk maakt om een bereik van waarden op te slaan in één kolom.  
Dit kan handig zijn voor het opslaan van datums, tijden, getallen of andere opeenvolgende waarden.
- Voorbeelden van range types:
    - `int4range`: Een bereik van 32-bits gehele getallen.
    - `int8range`: Een bereik van 64-bits gehele getallen.
    - `numrange`: Een bereik van numerieke waarden.
    - `tsrange`: Een bereik van timestamp-waarden zonder tijdzone.
    - `tstzrange`: Een bereik van timestamp-waarden met tijdzone.
    - `daterange`: Een bereik van datums.
    - ...
- Exclusion constraints: Range types kunnen worden gebruikt in combinatie met exclusion constraints om te voorkomen dat overlappende bereiken worden ingevoerd in een tabel.
- Range types gebruiken een **canonieke vorm**: PostgreSQL normaliseert sommige waarden zodat equivalente bereiken hetzelfde worden opgeslagen.
- Ze zijn vooral nuttig als het concept van "tussen twee grenzen" echt centraal staat, bijvoorbeeld planning, reserveringen of prijsintervallen.

### 5.1. Range-functies
- `lower(range)`: Geeft de onderste waarde van het bereik terug.
- `upper(range)`: Geeft de bovenste waarde van het bereik terug.
- `isempty(range)`: Controleert of het bereik leeg is.
- `range_merge(range1, range2)`: Combineert twee bereiken tot één bereik.
- `range_intersect(range1, range2)`: Geeft het overlappende bereik van twee bereiken terug.
- `range_union(range1, range2)`: Geeft het gecombineerde bereik van twee bereiken terug.
- `range_difference(range1, range2)`: Geeft het verschil tussen twee bereiken terug.
- `range_contains(range, value)`: Controleert of een waarde binnen het bereik valt.
- `range_overlaps(range1, range2)`: Controleert of twee bereiken overlappen.
- `range_adjacent(range1, range2)`: Controleert of twee bereiken aan elkaar grenzen.
- `range_before(range1, range2)`: Controleert of het eerste bereik volledig voor het tweede bereik ligt.
- `range_after(range1, range2)`: Controleert of het eerste bereik volledig na het tweede bereik ligt.
- ...

### 5.2. Belangrijke operatoren
| Operator | Betekenis |
| --- | --- |
| `@>` | Bereik bevat waarde of ander bereik |
| `<@` | Waarde of bereik zit in bereik |
| `&&` | Bereiken overlappen |
| `-|-` | Bereiken grenzen aan elkaar |
| `<<` | Ligt volledig voor |
| `>>` | Ligt volledig na |
| `&<` | Ligt links van of overlapt |
| `&>` | Ligt rechts van of overlapt |

### 5.3. Range-varianten
| Type | Gebruik |
| --- | --- |
| `int4range` | Kleine gehele getallen |
| `int8range` | Grote gehele getallen |
| `numrange` | Decimale waarden |
| `daterange` | Datums |
| `tsrange` | Timestamp zonder tijdzone |
| `tstzrange` | Timestamp met tijdzone |

### 5.4. Veelgemaakte fouten
- Twee aparte kolommen `start` en `eind` gebruiken zonder exclusion constraint, waardoor overlappende boekingen of periodes mogelijk blijven.
- Inclusieve en exclusieve grenzen verkeerd interpreteren; PostgreSQL gebruikt vaak half-open intervallen.
- `tsrange` kiezen terwijl je eigenlijk tijdzone-gedrag nodig hebt; dan is `tstzrange` veiliger.
- Vergeten dat indexen op ranges meestal via **GiST** of **SP-GiST** lopen in plaats van een gewone btree.

---

## 6. Network Types
Network types zijn een set van datatypes in PostgreSQL die speciaal zijn ontworpen voor het opslaan en manipuleren van netwerkadressen en netwerken.  
Deze datatypes zijn handig voor toepassingen die werken met IP-adressen, subnetten en andere netwerkgerelateerde gegevens.

### 6.1. Voorbeelden van Network Types
- `inet`: Dit datatype wordt gebruikt om een enkel IP-adres op te slaan, inclusief zowel IPv4- als IPv6-adressen. Het kan ook een optionele netmasker bevatten.
- `cidr`: Dit datatype wordt gebruikt om een netwerkadres op te slaan, inclusief het IP-adres en het bijbehorende netmasker. Het is handig voor het definiëren van subnetten.
- `macaddr`: Dit datatype wordt gebruikt om een MAC-adres op te slaan, dat uniek is voor netwerkinterfaces.
- `macaddr8`: Dit datatype wordt gebruikt om een 8-byte MAC-adres op te slaan, dat wordt gebruikt in sommige netwerktechnologieën.
- ...
- `inet` is meestal de beste keuze als je zowel losse adressen als subnets wil ondersteunen.
- `cidr` is strenger en past beter als je echt netwerkblokken wil modelleren.

### 6.2. Network-functies
- `host(inet)`: Geeft het hostgedeelte van een IP-adres terug.
- `masklen(inet)`: Geeft de lengte van het netmasker van een IP-adres terug.
- `netmask(inet)`: Geeft het netmasker van een IP-adres terug.
- `set_masklen(inet, int)`: Stelt de lengte van het netmasker in voor een IP-adres.
- `abbrev(inet)`: Geeft een afgekorte weergave van een IP-adres terug.
- `family(inet)`: Geeft het adresfamilie van een IP-adres terug (IPv4 of IPv6).
- ...

### 6.3. Technische werking en indexering
- `inet` en `cidr` worden intern als binaire netwerkwaarden opgeslagen en niet als losse tekst.
- PostgreSQL valideert het formaat bij insert of update, waardoor ongeldige adressen vroeg worden afgekeurd.
- Op deze types kun je vaak goed filteren met vergelijkingsoperatoren en subnet-achtige checks.
- Btree-indexen werken voor gelijkheid en sortering; voor subnetvragen zijn de juiste operatoren en indexstrategie belangrijk.

### 6.4. Veelgemaakte fouten
- IP-adressen als tekst opslaan en later zelf proberen te parsen of te valideren.
- `cidr` gebruiken waar je eigenlijk een hostadres nodig hebt, waardoor hostbits onverwacht genormaliseerd worden.
- IPv4 en IPv6 door elkaar gebruiken zonder rekening te houden met `family()` en applicatielogica.
- MAC-adressen als business key gebruiken terwijl ze in de praktijk kunnen veranderen of gemanipuleerd worden.

---

## 7. ENUM Types (Enumerated Types)
ENUM is een datatype voor een **vaste, beperkte set van labels**. Het is handig wanneer de mogelijke waarden klein, stabiel en semantisch duidelijk zijn, zoals statusvelden of prioriteiten.
- Gebruik ENUM als de waardenset zelden verandert en je die expliciet in de database wil afdwingen.
- Gebruik liever een lookup-tabel of `text` met `CHECK` als de set regelmatig wijzigt of metadata per waarde nodig is.
- ENUM-waarden zijn beter leesbaar dan codes of magische strings in de applicatie.

### 7.1. Technische werking
- De labels worden in PostgreSQL-catalogi opgeslagen, terwijl de kolom zelf intern als een compacte waarde wordt bewaard.
- Vergelijkingen volgen de volgorde waarin waarden zijn gedefinieerd, niet alfabetische volgorde.
- `ALTER TYPE ... ADD VALUE` is mogelijk, maar bestaande waarden verwijderen of herordenen is veel lastiger.
- Indexen op ENUM-kolommen werken net als op andere scalar types.

### 7.2. Wanneer gebruiken
- Statusvelden zoals `draft`, `published`, `archived`.
- Beperkte categorieën die functioneel zelden wijzigen.
- Domeinen waarbij de database zelf de allowed values moet afdwingen.

### 7.3. Vergelijking
| Optie | Voordeel | Nadeel |
| --- | --- | --- |
| ENUM | Compact, duidelijk, strikt | Moeilijk wijzigen |
| `text` + `CHECK` | Flexibeler | Minder semantisch strak dan ENUM |
| Lookup-tabel | Metadata en relaties mogelijk | Meer joins en meer onderhoud |

### 7.4. Veelgemaakte fouten
- ENUM gebruiken voor snel veranderende businesswaarden.
- Geen migratiestrategie voorzien wanneer er later nieuwe waarden bijkomen.
- Denken dat ENUM een vervanging is voor autorisatie- of businesslogica; het is alleen een validatiehulpmiddel.

---

## 8. Hstore
**hstore** is een key-value datatype voor platte sleutel-waardeparen met **tekst** als sleutel en waarde. Het was lang handig voor flexible attributes vóór JSONB breed beschikbaar en volwassen werd.
- Gebruik hstore als je enkel een set losse tekstwaarden per rij nodig hebt en je bestaande code of schema daar al op gebaseerd is.
- Voor nieuwe ontwerpen is **JSONB** meestal veelzijdiger.
- Hstore ondersteunt geen geneste objecten of arrays zoals JSONB dat wel doet.

### 8.1. Technische werking
- Hstore wordt als een compacte structuur opgeslagen waarin sleutels en waarden per entry gekoppeld zijn.
- Er zijn operatoren voor key presence, extractie en samenvoegen, vergelijkbaar met een deel van JSONB.
- **GIN-indexen** zijn bruikbaar voor zoeken op sleutel of sleutel-waardecombinaties.
- Waarden zijn altijd tekst; je moet zelf casten naar numerieke of datumtypes.

### 8.2. Handige functies en operatoren
- `hstore(text, text)` of `hstore(ARRAY[...])`: maakt een hstore-waarde aan.
- `->`: haalt een waarde op via sleutel.
- `?`: test of een sleutel bestaat.
- `@>`: test of een hstore een andere hstore bevat.
- `||`: merge twee hstores.
- `-`: verwijdert een sleutel.

### 8.3. Hstore vs JSONB
| Eigenschap | Hstore | JSONB |
| --- | --- | --- |
| Waardetype | Alleen tekst | Meerdere JSON-types |
| Nesting | Nee | Ja |
| Ecosysteem | Ouder, smaller | Breder, moderner |
| Gebruik | Platte key-value data | Flexibele semi-gestructureerde data |

### 8.4. Veelgemaakte fouten
- Hstore kiezen voor data die later toch genest of rijker blijkt te moeten worden.
- Tekstwaarden niet casten voor numerieke logica.
- Hstore gebruiken als vervanging voor een normaal schema terwijl de structuur eigenlijk vast is.

---

## 9. Composite Types
Composite types zijn **zelf gedefinieerde recordtypes** met meerdere velden. Je gebruikt ze wanneer je een logisch groepje velden als één datatype wil behandelen.
- Handig in functies die een gestructureerd resultaat teruggeven.
- Nuttig als meerdere kolommen altijd samen horen en je ze als één concept wil modelleren.
- Minder flexibel dan JSONB, maar veel sterker getypeerd.

### 9.1. Technische werking
- Je definieert een composite type met `CREATE TYPE ... AS (...)`.
- PostgreSQL behandelt het als een rijstructuur met vaste velden en types.
- Composite types kunnen in tabellen, functies, arrays en queryresultaten gebruikt worden.
- Ze zijn sterk type-veilig, maar minder handig als de structuur frequent verandert.

### 9.2. Wanneer gebruiken
- Voor return types van functies en stored procedures.
- Voor herbruikbare adres-, naam- of metadata-structuren.
- Voor modellen waarbij velden altijd samen voorkomen.

### 9.3. Veelgemaakte fouten
- Composite types gebruiken voor data die eigenlijk normalisatie of een aparte tabel nodig heeft.
- Denken dat composite types dezelfde queryflexibiliteit geven als aparte kolommen met indexen.
- Een composite type gebruiken wanneer JSONB beter past bij dynamische of optionele velden.

### 9.4. Praktische opmerking
- Als je vaak op individuele velden moet filteren of indexeren, zijn losse kolommen meestal eenvoudiger en sneller.

---

## 10. Geometric Types
Geometric types zijn ingebouwde PostgreSQL-types voor **2D-vormen** en eenvoudige geometrische berekeningen. Ze zijn nuttig voor simpele meetkundige data, maar niet bedoeld als volwaardige GIS-oplossing.
- Voor echte kaart- of geo-analyse gebruik je meestal **PostGIS**.
- De ingebouwde types zijn handig voor basisgeometrie, spellen, simulaties of eenvoudige posities in vlakke coördinaten.

### 10.1. Belangrijkste types
| Type | Betekenis |
| --- | --- |
| `point` | Eén punt in 2D |
| `line` | Oneindige lijn |
| `lseg` | Lijnsegment |
| `box` | Rechthoekige box |
| `path` | Open of gesloten pad |
| `polygon` | Veelhoek |
| `circle` | Cirkel |

### 10.2. Technische werking
- Coördinaten worden als numerieke waarden opgeslagen in vlakke 2D-ruimte.
- PostgreSQL biedt operatoren voor positie, overlap, containments en afstandsachtige berekeningen.
- Indexering is mogelijk, maar de ingebouwde geometrische types zijn minder krachtig dan gespecialiseerde GIS-indexen en functies.
- Er is geen aardbol-, projectie- of geodetisch model ingebouwd.

### 10.3. Veelgemaakte fouten
- Geometric types gebruiken voor echte geografische data met lat/lon en vervolgens aannemen dat afstanden correct zijn op een bol.
- Verwarren van simpele 2D-geometrie met GIS-functionaliteit.
- Geen rekening houden met numerieke precisie bij vergelijkingen of berekeningen.

### 10.4. Praktisch advies
- Als je alleen eenvoudige 2D-berekeningen nodig hebt, zijn de ingebouwde types voldoende.
- Zodra je kaarten, routes, grenzen of afstand op aarde nodig hebt, stap je beter over naar PostGIS.

---

## 11. XML Type
Het **xml** datatype slaat **welgevormde XML-documenten** op. Het is vooral nuttig voor integraties of systemen die XML als uitwisselformaat gebruiken.
- Gebruik XML als je externe API's, berichten of standaarden moet ondersteunen die XML vereisen.
- Voor nieuwe applicatiedata is JSONB meestal eenvoudiger en praktischer.
- PostgreSQL valideert dat de inhoud echt XML is, waardoor malformed XML niet zomaar opgeslagen wordt.

### 11.1. Technische werking
- XML wordt intern geparseerd en gecontroleerd op welgevormdheid.
- Functies zoals `xpath()`, `xmlexists()`, `xmltable()` en `xmlserialize()` maken query's en conversies mogelijk.
- Indexering is minder natuurlijk dan bij JSONB; vaak gebruik je expression indexes op geëxtraheerde waarden.
- Voor zware XML-verwerking is de ergonomie minder prettig dan relationele kolommen of JSONB.

### 11.2. Veelgemaakte fouten
- XML gebruiken voor applicatiedata die eigenlijk beter relationeel of in JSONB past.
- Verwachten dat XML-query's vanzelf snel zijn zonder extra indexing of extractie.
- Denken dat XML automatisch alle schema- of validatieregels uit de XSD-wereld afdwingt; dat hangt van je implementatie af.

### 11.3. Wanneer gebruiken
- Wanneer je XML-documenten integraal moet bewaren en bevragen.
- Wanneer een externe standaard of legacy-integratie XML oplegt.

---

## 12. Bit String Types
Bit string types bewaren een reeks bits in plaats van tekst of numerieke waarden. Je gebruikt ze voor compacte vlaggen, maskers of protocolvelden.
- `bit(n)` is **vast** van lengte.
- `bit varying(n)` is **variabel** van lengte tot een maximum.
- Voor leesbaarheid zijn gewone booleans vaak beter, tenzij je echt bitniveau-operaties nodig hebt.

### 12.1. Technische werking
- PostgreSQL slaat de bitreeks compact op en voert bitbewerkingen direct op dat patroon uit.
- Operatoren zoals AND, OR, XOR, shift en concatenatie werken op bitniveau.
- Indexen kunnen gebruikt worden voor gewone vergelijkingen, maar bitstrings zijn meestal geen eerste keuze voor complexe zoekpatronen.

### 12.2. Belangrijke functies en operatoren
- `bit_length()`: lengte in bits.
- `get_bit()`: leest een bit op een positie.
- `set_bit()`: zet een bit op een positie.
- `&`, `|`, `#`: bitwise AND, OR en XOR.
- `~`: bitwise NOT.
- `<<`, `>>`: shifts.
- `||`: concatenatie.

### 12.3. Vergelijking
| Type | Voordeel | Nadeel |
| --- | --- | --- |
| `bit(n)` | Vast formaat, compact | Minder flexibel |
| `bit varying(n)` | Flexibeler | Nog steeds minder leesbaar |
| `boolean` kolommen | Heel duidelijk | Meer kolommen nodig |

### 12.4. Veelgemaakte fouten
- Bitmaskers gebruiken waar gewone booleans duidelijker en onderhoudbaarder zijn.
- De betekenis van individuele bits niet documenteren.
- Verwachten dat bitstrings automatisch een vervanging zijn voor een permissie- of rolmodel.

---

## 13. References
- PostgreSQL Documentation: https://www.postgresql.org/docs/current/
- JSON Types: https://www.postgresql.org/docs/current/datatype-json.html
- JSON Functions and Operators: https://www.postgresql.org/docs/current/functions-json.html
- JSON Path: https://www.postgresql.org/docs/current/functions-json.html#FUNCTIONS-SQLJSON-PATH
- Arrays: https://www.postgresql.org/docs/current/arrays.html
- UUID: https://www.postgresql.org/docs/current/datatype-uuid.html
- Range Types: https://www.postgresql.org/docs/current/rangetypes.html
- Network Address Types: https://www.postgresql.org/docs/current/datatype-net-types.html
- ENUM: https://www.postgresql.org/docs/current/datatype-enum.html
- Hstore: https://www.postgresql.org/docs/current/hstore.html
- Composite Types: https://www.postgresql.org/docs/current/rowtypes.html
- Geometric Types: https://www.postgresql.org/docs/current/datatype-geometric.html
- XML: https://www.postgresql.org/docs/current/datatype-xml.html
- Bit String Types: https://www.postgresql.org/docs/current/datatype-bit.html
