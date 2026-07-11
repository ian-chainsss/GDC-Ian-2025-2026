# Verschillende soorten indexen in PostgreSQL
PostgreSQL gebruikt indexen om sneller data terug te vinden zonder altijd een volledige tabelscan te doen. In de praktijk is een index een extra datastructuur naast je tabel waarmee PostgreSQL minder rijen en minder datablokken hoeft te lezen.

Voor een junior backend engineer is het nuttig om indexen te zien als een afweging tussen leesprestatie, schrijfkost, opslagruimte en onderhoud. Een index versnelt vooral reads, maar maakt inserts, updates en deletes iets duurder omdat PostgreSQL de index ook moet bijwerken.

In dit document worden de meest voorkomende indexsoorten uitgelegd. Per type lees je wat het technisch doet, wanneer je het gebruikt, hoe PostgreSQL het kan benutten in de planner en welke praktische situaties het meest geschikt zijn.

### Hoe PostgreSQL een index gebruikt
- De query planner vergelijkt een sequential scan met een index scan, bitmap index scan of index-only scan.
- PostgreSQL kiest een index alleen als die genoeg voordeel oplevert op basis van statistieken en selectiviteit.
- Een index is vooral nuttig wanneer een klein deel van de tabel nodig is.
- De beste index volgt het echte querypatroon van de applicatie, niet alleen de kolomnaam.

## Inhoudsopgave
- [B-tree Index](#1-b-tree-index)
- [Hash Index](#2-hash-index)
- [GIN Index (Generalized Inverted Index)](#3-gin-index-generalized-inverted-index)
- [GiST Index (Generalized Search Tree)](#4-gist-index-generalized-search-tree)
- [SP-GiST Index (Space-Partitioned Generalized Search Tree)](#5-sp-gist-index-space-partitioned-generalized-search-tree)
- [BRIN Index (Block Range Index)](#6-brin-index-block-range-index)
- [Expression Index](#7-expression-index)
- [Partial Index](#8-partial-index)
- [Unique Index](#9-unique-index)
- [Multicolumn Index](#10-multicolumn-index)
- [Covering Index](#11-covering-index)
- [Concurrent Index Creation](#12-concurrent-index-creation)
- [Index Maintenance](#13-index-maintenance)
- [Indexing Best Practices](#14-indexing-best-practices)
- [References](#15-references)

---

## 1. B-tree Index

B-tree is het standaard indextype in PostgreSQL en veruit het meest gebruikte type. Intern bewaart PostgreSQL de waarden in een gebalanceerde boomstructuur, waardoor zoeken via logaritmische sprongen kan gebeuren in plaats van rij per rij te scannen.

Technisch is dit de beste algemene keuze voor:
- exacte matches;
- range queries;
- sorteringen;
- prefix-zoekacties zoals `LIKE 'abc%'`;
- samengestelde filters wanneer de kolomvolgorde klopt.

De planner kan deze index gebruiken als het filter- of sorteerpatroon aansluit op de kolommen in de index. De beste winst zie je vaak bij kolommen met veel verschillende waarden, zoals e-mailadressen, primary keys en tijdstempels.

### Wanneer gebruik je dit?
| Situatie | Geschikt? | Waarom |
|---|---:|---|
| Zoeken op ID of status | Ja | Snel voor exacte matches |
| Sorteren op datum | Ja | Kan de sortering vaak mee ondersteunen |
| Bereik op numerieke of datumkolom | Ja | Sterk in range scans |
| Tekst zoeken met `%abc%` | Nee | Hiervoor is meestal GIN of trigram beter |

### Technische werking
- PostgreSQL springt via de boomstructuur direct naar een zoekwaarde of waardebereik.
- Bij een `ORDER BY` kan de indexvolgorde soms de sortering vervangen.
- Bij samengestelde indexen is de linkerkolom meestal het belangrijkst voor de bruikbaarheid.

### Praktische implementatie
Gebruik dit type wanneer je bijvoorbeeld vaak zoekt op:
- `user_id`;
- `created_at`;
- `email`;
- `status` in combinatie met een andere selectieve kolom.

### Voordelen
- Standaard en veelzijdig.
- Goed voor de meeste OLTP-query's.
- Ondersteunt zowel zoekopdrachten als sorteringen.

### Nadelen
- Niet ideaal voor vrije tekst of complexe overlap-zoekopdrachten.
- Extra indexen maken inserts, updates en deletes trager.

### Voorbeeld
```sql
CREATE INDEX idx_users_email ON users (email);

SELECT id, email
FROM users
WHERE email = 'alice@example.com';
```

### Praktische tip
Als je niet zeker weet welk indextype je nodig hebt, begin dan meestal met een B-tree index. In veel backend-applicaties is dit de beste eerste keuze.

Gebruik `EXPLAIN ANALYZE` om te controleren of PostgreSQL de index echt pakt en niet alsnog een sequential scan kiest.

---

## 2. Hash Index

Hash indexen zijn geoptimaliseerd voor exacte gelijkheidsvergelijkingen, zoals `WHERE username = 'ian'`. Intern slaat PostgreSQL hashwaarden op in buckets, waardoor gelijkheidszoekopdrachten efficiënt kunnen verlopen. De keerzijde is dat deze structuur niet bruikbaar is voor sorteren of bereikqueries.

In moderne PostgreSQL-versies zijn hash indexes betrouwbaarder dan vroeger, maar in de praktijk worden ze nog steeds veel minder gebruikt dan B-tree indexen. Dat komt omdat B-tree bijna altijd minstens zo nuttig is en bovendien veel breder inzetbaar is.

### Wanneer gebruik je dit?
| Situatie | Geschikt? | Opmerking |
|---|---:|---|
| Exacte match op een kolom | Ja | Bijvoorbeeld token of key lookup |
| Sorteren | Nee | B-tree is beter |
| Bereikquery's | Nee | Niet geschikt |

### Technische werking
- PostgreSQL berekent een hashwaarde voor de zoekwaarde.
- Alle waarden met dezelfde hash komen in dezelfde bucket of bucketreeks terecht.
- De query planner kan deze index alleen inzetten bij exacte gelijkheidsvergelijkingen.
- Omdat hashes geen volgorde bevatten, is er geen ondersteuning voor `<`, `>` of `ORDER BY`.

### Praktische implementatie
Gebruik hash indexen alleen als je een heel duidelijk exact-zoekpatroon hebt en je zeker weet dat sorteren of bereikqueries geen rol spelen.

### Voordelen
- Specifiek en snel voor exact zoeken.
- Conceptueel eenvoudig.

### Nadelen
- Alleen bruikbaar voor `=`.
- Minder algemeen bruikbaar dan B-tree.
- In de praktijk vaak niet nodig, omdat B-tree meestal al goed genoeg is.

### Voorbeeld
```sql
CREATE INDEX idx_sessions_token_hash ON sessions USING hash (token);

SELECT *
FROM sessions
WHERE token = 'abc123';
```

### Praktische tip
In de meeste backendprojecten is het verstandiger om eerst een B-tree te proberen en alleen af te wijken als je een concrete reden hebt.

---

## 3. GIN Index (Generalized Inverted Index)

GIN indexen zijn handig voor kolommen met meerdere waarden of onderdelen, zoals arrays, JSONB en full-text search. Technisch werkt GIN als een omgekeerde index: de index bewaart per waarde welke rijen die waarde bevatten. Dat maakt dit type ideaal voor "zoek naar alle rijen die dit element bevatten".

Dit is vooral nuttig wanneer één rij veel zoekbare onderdelen bevat, bijvoorbeeld:
- tags in een array;
- losse woorden in een tekstindex;
- sleutels en waarden in JSONB;
- meerdere zoektermen in één veld.

### Typische use cases
- Zoeken in arrays.
- JSONB queries.
- Full-text search.
- Zoeken op meerdere woorden of tags.

### Hoe werkt het in simpele taal?
Een GIN index bewaart een omgekeerde structuur: in plaats van van rij naar waarde te denken, denkt PostgreSQL van waarde naar alle rijen waarin die waarde voorkomt.

Dat betekent dat een query zoals "geef mij alle documenten met tag X" veel efficiënter is dan steeds heel de tabel uitlezen en per rij controleren.

### Technische werking
- De index bevat postingslijsten: per waarde staat welke rijen erbij horen.
- Bij containment queries zoals `@>` kan PostgreSQL snel kandidaten vinden.
- Voor JSONB kan de planner de index inzetten als de operator geschikt is voor GIN.
- Writes zijn zwaarder omdat één wijziging vaak meerdere indexitems beïnvloedt.

### Voordelen
- Zeer sterk voor containment en membership queries.
- Vaak de beste keuze voor JSONB en full-text search.

### Nadelen
- Groter en zwaarder dan veel andere indexen.
- Writes zijn duurder, omdat de index meer onderhoud vraagt.

### Voorbeeld
```sql
CREATE INDEX idx_posts_tags_gin ON posts USING gin (tags);

SELECT *
FROM posts
WHERE tags @> ARRAY['postgresql'];
```

### Extra voorbeeld met JSONB
```sql
CREATE INDEX idx_orders_payload_gin ON orders USING gin (payload);

SELECT *
FROM orders
WHERE payload @> '{"status": "paid"}';
```

### Praktische tip
Als je JSONB gebruikt, is GIN vaak de index die je als eerste moet onderzoeken. Controleer wel altijd of de query echt profijt heeft van de index, want niet elke JSONB-query is geschikt.

Een veelgemaakte fout is een GIN index maken op JSONB zonder de daadwerkelijke operatoren van de applicatie te controleren.

---

## 4. GiST Index (Generalized Search Tree)

GiST is een flexibel indexframework dat PostgreSQL gebruikt voor complexe datatypes en zoekproblemen. In plaats van één vaste opslagmethode is GiST een framework waarop verschillende indexstrategieën kunnen worden gebouwd. Daardoor kan PostgreSQL dit type gebruiken voor ruimtelijke data, ranges, nearest-neighbor queries en andere gespecialiseerde operators.

Technisch werkt GiST vaak met samenvattende grenzen of afbakeningen. De index helpt de planner om snel te bepalen welke takken van de boom mogelijk relevant zijn en welke takken meteen kunnen worden overgeslagen.

### Typische use cases
- Geografische of ruimtelijke data.
- Range types, zoals tijdvensters.
- Nearest-neighbor zoekopdrachten.

### Voordelen
- Erg flexibel.
- Ondersteunt complexe datatypes en operators.

### Nadelen
- Minder simpel dan B-tree.
- Niet altijd de snelste keuze voor standaard equalities.

### Technische werking
- GiST bewaart vaak geen exacte waarden op hogere niveaus, maar een samenvatting of bounding box.
- PostgreSQL gebruikt die samenvatting om delen van de boom uit te sluiten.
- Voor ranges helpt dit om overlappende intervallen snel terug te vinden.
- Voor ruimtelijke data helpt dit om gebieden te beperken voordat exacte checks gebeuren.

### Praktische implementatie
Gebruik GiST wanneer je query's hebt zoals:
- welke afspraken overlappen dit tijdslot;
- welke punten liggen in deze regio;
- welke objecten zijn het dichtst bij een locatie.

### Voorbeeld
```sql
CREATE INDEX idx_events_period_gist ON events USING gist (tsrange(start_time, end_time));

SELECT *
FROM events
WHERE tsrange(start_time, end_time) && tsrange('2026-07-11', '2026-07-12');
```

### Praktische tip
GiST is vaak de juiste keuze zodra je data niet meer netjes een losse waarde is, maar een bereik, geometrie of andere complexe structuur.

Als je alleen exacte lookup's nodig hebt, is B-tree meestal eenvoudiger en sneller.

---

## 5. SP-GiST Index (Space-Partitioned Generalized Search Tree)

SP-GiST is geschikt voor data die je logisch kunt opdelen in aparte zones of takken. Het verschilt van GiST doordat het expliciet ruimte of zoekgebied partitioneert in plaats van vooral samenvattingen te bewaren. Daardoor kan het heel efficiënt zijn voor data met een natuurlijke geometrische of hiërarchische structuur.

Je ziet dit vooral bij prefix-achtige data, boomstructuren en geometrische partitionering.

### Wanneer gebruik je dit?
- Bij data die goed in ruimtes of segmenten kan worden opgesplitst.
- Voor speciale indexproblemen waarbij gewone B-tree of GiST minder geschikt is.

### Voordelen
- Efficiënt bij data die zich goed laat partitioneren.
- Kan beter presteren op gespecialiseerde zoekpatronen.

### Nadelen
- Minder algemeen bruikbaar.
- Vereist meer begrip van de datastructuur.

### Technische werking
- De index splitst de zoekruimte in partitions of segmenten.
- Elke tak vertegenwoordigt een deel van de totale zoekruimte.
- PostgreSQL kan daardoor heel gericht zoeken wanneer de data een duidelijke vorm of structuur heeft.

### Praktische implementatie
SP-GiST is interessant wanneer je bijvoorbeeld werkt met:
- prefix-gebaseerde zoekproblemen;
- geometrische punten die goed in regio's op te delen zijn;
- datastructuren met veel hiërarchische splitsing.

### Voorbeeld
```sql
CREATE INDEX idx_locations_spgist ON locations USING spgist (point_column);
```

### Praktische tip
SP-GiST is een specialistisch hulpmiddel. Gebruik het pas wanneer je weet dat de data zich natuurlijk laat opdelen en je een duidelijk performanceprobleem hebt.

Voor algemene applicatiequery's is dit meestal niet de eerste keuze.

---

## 6. BRIN Index (Block Range Index)

BRIN is bedoeld voor zeer grote tabellen waarin kolommen een natuurlijke volgorde hebben, zoals een tijdstempel, autoincrement-ID of andere monotone data. In plaats van elke rij apart te indexeren, bewaart BRIN samenvattende informatie per blok of range van blokken. Daardoor is de index extreem klein.

De grote kracht van BRIN zit in data die fysiek ongeveer geordend is. Als rijen met vergelijkbare waarden bij elkaar staan, kan PostgreSQL snel blokken uitsluiten die zeker niet matchen.

### Wanneer is BRIN interessant?
| Situatie | Geschikt? | Waarom |
|---|---:|---|
| Heel grote tabel | Ja | De index blijft klein |
| Tijdreeksen | Ja | Data is vaak grotendeels geordend |
| Random data zonder patroon | Minder | Samenvatting is dan minder nuttig |

### Voordelen
- Zeer klein in opslag.
- Goedkoop in onderhoud.
- Interessant voor data warehouse-achtige tabellen.

### Nadelen
- Minder precies dan andere indexen.
- Prestatiewinst hangt sterk af van de fysieke volgorde van de data.

### Technische werking
- BRIN houdt per block range minimale en maximale waarden bij.
- Bij een query vergelijkt PostgreSQL de zoekvoorwaarde met die samenvatting.
- Alleen blokken die mogelijk relevant zijn worden verder gelezen.
- Hoe beter de fysieke clustering, hoe beter de filterkwaliteit.

### Praktische implementatie
Gebruik BRIN voor logtabellen, event streams, historiek-tabellen en append-only datasets met veel records.

### Voorbeeld
```sql
CREATE INDEX idx_logs_created_at_brin ON logs USING brin (created_at);

SELECT *
FROM logs
WHERE created_at >= '2026-07-01'
	AND created_at < '2026-07-02';
```

### Praktische tip
BRIN is vaak een goede keuze als je data vooral append-only is en je tabel erg groot wordt.

Als je veel updates door elkaar hebt of de data random verspreid staat, wordt BRIN veel minder effectief.

---

## 7. Expression Index

Een expression index indexeert niet een ruwe kolom, maar het resultaat van een expressie. Dat is handig als je query's vaak een berekening of functie op een kolom uitvoeren. PostgreSQL bewaart dus de uitkomst van een berekening in de index, niet de originele waarde zelf.

Dat is nuttig wanneer je query's telkens dezelfde bewerking doen, zoals lowercasing, datumafleiding of tekstnormalisatie.

### Voorbeelden van situaties
- Case-insensitive zoeken.
- Zoeken op een deel van een datum.
- Normaliseren van tekst voor zoekopdrachten.

### Voordelen
- Versnelt query's die dezelfde bewerking herhalen.
- Laat je indexeren op een afgeleide waarde.

### Nadelen
- De query moet dezelfde expressie gebruiken om optimaal te profiteren.
- Meer onderhoud bij writes.

### Technische werking
- De index wordt opgebouwd op de berekende uitkomst van de expressie.
- De planner kan de index alleen goed gebruiken als de query dezelfde expressie toepast.
- Hierdoor moet de SQL-vorm vaak precies overeenkomen met de indexdefinitie.

### Praktische implementatie
Gebruik dit wanneer je bijvoorbeeld altijd zoekt op:
- `LOWER(email)`;
- `DATE(created_at)`;
- een genormaliseerde versie van een tekstveld;
- een berekende business key.

### Voorbeeld
```sql
CREATE INDEX idx_users_lower_email ON users (LOWER(email));

SELECT *
FROM users
WHERE LOWER(email) = LOWER('Alice@Example.com');
```

### Praktische tip
Zet eerst in je query vast welke expressie je telkens nodig hebt. Als die expressie vaak terugkomt, is een expression index een logische optimalisatie.

Verander de queryvorm niet per endpoint, anders wordt de index moeilijk voorspelbaar bruikbaar.

---

## 8. Partial Index

Een partial index bevat alleen rijen die aan een voorwaarde voldoen. Daardoor blijft de index kleiner en sneller als je vaak op een subset van de data zoekt. PostgreSQL hoeft minder indexentries bij te houden en de planner kan de index alleen gebruiken wanneer jouw query logisch binnen die subset past.

Dit is erg krachtig wanneer een statuskolom of vlag een klein, maar vaak opgevraagd deel van de tabel markeert.

### Wanneer gebruik je dit?
- Wanneer je vaak zoekt naar open tickets, actieve users of recent data.
- Wanneer slechts een klein deel van de tabel relevant is.

### Voordelen
- Kleinere index.
- Sneller onderhoud.
- Vaak betere performance dan een volledige index op dezelfde kolom.

### Nadelen
- Alleen bruikbaar als de query dezelfde voorwaarde bevat.
- Minder flexibel dan een volledige index.

### Technische werking
- De index bevat enkel de rijen waarvoor de `WHERE`-voorwaarde van de index waar is.
- PostgreSQL probeert te bewijzen dat jouw query binnen datzelfde subset valt.
- Als dat niet lukt, wordt de partial index genegeerd.

### Praktische implementatie
Gebruik dit bijvoorbeeld voor:
- open supporttickets;
- actieve accounts;
- niet-gearchiveerde records;
- rows met `deleted_at IS NULL`.

### Voorbeeld
```sql
CREATE INDEX idx_orders_open_only ON orders (created_at)
WHERE status = 'open';

SELECT *
FROM orders
WHERE status = 'open'
	AND created_at >= NOW() - INTERVAL '7 days';
```

### Praktische tip
Partial indexes zijn zeer nuttig in applicaties met veel statuskolommen. Denk aan `active`, `archived`, `deleted`, `paid` of `pending`.

Let op dat de queryvoorwaarde exact genoeg overeenkomt met de indexvoorwaarde, anders gebruikt PostgreSQL de index niet.

---

## 9. Unique Index

Een unique index zorgt ervoor dat waarden uniek blijven. Dit wordt vaak gebruikt voor e-mailadressen, gebruikersnamen, externe referenties of andere velden die nooit dubbel mogen voorkomen. De index helpt hier niet alleen met snelheid, maar vooral met dataconsistentie.

### Belangrijk om te weten
- Een unique index is niet alleen een performance-instrument, maar ook een datakwaliteitsregel.
- PostgreSQL gebruikt dit om dubbele waarden te voorkomen.

### Voordelen
- Garandeert dat data uniek blijft.
- Voorkomt bugs en inconsistente records.

### Nadelen
- Elke insert of update moet de uniciteit controleren.
- Bij foutieve data-invoer krijg je direct een foutmelding.

### Technische werking
- Bij elke insert of update controleert PostgreSQL of dezelfde waarde al bestaat in de index.
- Bij een conflict wordt de write geweigerd.
- Dat maakt unique indexes essentieel voor business rules die in de database moeten worden afgedwongen.

### Praktische implementatie
Gebruik dit voor:
- login-e-mail;
- gebruikersnaam;
- API-key of externe identifier;
- combinaties die uniek moeten zijn, zoals `project_id + slug`.

### Voorbeeld
```sql
CREATE UNIQUE INDEX idx_users_email_unique ON users (email);

INSERT INTO users (email)
VALUES ('alice@example.com');
```

### Praktische tip
Gebruik unique indexes voor business rules die absoluut moeten kloppen. Dat is veiliger dan uniciteit alleen in applicatiecode proberen af te dwingen.

Als de uniciteit semantisch onderdeel is van je domein, hoort die regel in de database.

---

## 10. Multicolumn Index

Een multicolumn index bevat meerdere kolommen in een vaste volgorde. Dit is handig als je vaak zoekt op dezelfde combinatie van kolommen. De volgorde is technisch belangrijk, omdat PostgreSQL de index het best gebruikt wanneer de linkerkant van de index ook echt in de filterconditie voorkomt.

Multicolumn indexen zijn daarom sterk voor samengestelde filters zoals tenant + status of klant + datum.

### Hoe werkt de volgorde?
De volgorde van de kolommen is belangrijk. Een index op `(last_name, first_name)` werkt anders dan een index op `(first_name, last_name)`.

De eerste kolom bepaalt vaak hoe bruikbaar de index is. Als die niet in de query voorkomt, kan de planner de index minder efficiënt of helemaal niet gebruiken.

### Technische werking
- PostgreSQL leest de index van links naar rechts.
- De eerste kolom verkleint de zoekruimte het sterkst.
- Latere kolommen helpen vooral als de eerdere kolommen al genoeg selectiviteit geven.
- De volgorde moet ook aansluiten op `ORDER BY` als je sortering wilt versnellen.

### Praktische implementatie
Gebruik dit voor:
- `tenant_id + created_at`;
- `customer_id + status`;
- `country_code + postal_code`;
- `organization_id + slug`.

### Voordelen
- Erg nuttig voor samengestelde filters.
- Kan meerdere querypatronen ondersteunen als de volgorde goed gekozen is.

### Nadelen
- Verkeerde kolomvolgorde maakt de index minder bruikbaar.
- Niet elke combinatie wordt even goed geholpen.

### Voorbeeld
```sql
CREATE INDEX idx_orders_customer_status ON orders (customer_id, status);

SELECT *
FROM orders
WHERE customer_id = 42
	AND status = 'open';
```

### Praktische tip
Zet de meest selectieve of meest gebruikte kolom vaak eerst, maar laat de echte querypatronen leidend zijn. De beste volgorde hangt af van hoe je applicatie de data opvraagt.

Analyseer echte query's voordat je de volgorde vastlegt, anders optimaliseer je mogelijk het verkeerde patroon.

---

## 11. Covering Index

Een covering index bevat niet alleen de kolommen waar je op filtert, maar ook extra kolommen die je in de `SELECT` nodig hebt. Daardoor kan PostgreSQL soms de tabel zelf overslaan. Dit helpt vooral bij index-only scans, waarbij alle benodigde informatie al in de index beschikbaar is.

### Hoe helpt dit?
Als alle benodigde data al in de index staat, hoeft PostgreSQL minder of geen extra tabelopslag te lezen.

### Technische werking
- PostgreSQL controleert of de query volledig uit de index kan worden beantwoord.
- Als de benodigde kolommen aanwezig zijn en de zichtbaarheidstoestand klopt, kan een index-only scan ontstaan.
- Dat vermindert I/O omdat de tabelheap minder vaak hoeft te worden gelezen.

### Praktische implementatie
Gebruik dit wanneer je vaak dezelfde selectie doet, bijvoorbeeld:
- zoek op e-mail, toon `id` en `created_at`;
- zoek op `order_id`, toon `status` en `total_amount`;
- lijstweergaves met een vast kolomschema.

### Voordelen
- Minder I/O.
- Snellere query's bij veel voorkomende selecties.

### Nadelen
- Grotere index.
- Meer onderhoud bij writes.

### Voorbeeld
```sql
CREATE INDEX idx_users_email_covering ON users (email) INCLUDE (id, created_at);

SELECT id, created_at
FROM users
WHERE email = 'alice@example.com';
```

### Praktische tip
Gebruik covering indexes vooral voor veelgebruikte leesquery's die steeds dezelfde kolommen ophalen.

Maak de index niet onnodig breed, want dan verlies je weer ruimte en write-performance.

---

## 12. Concurrent Index Creation

Een index aanmaken met `CONCURRENTLY` zorgt ervoor dat PostgreSQL de tabel minder lang blokkeert. Dit is vooral belangrijk in productieomgevingen waar writes gewoon door moeten kunnen lopen. PostgreSQL bouwt de index in fases zodat bestaande write-activiteit zo veel mogelijk doorgaat.

De trade-off is dat de operatie langer duurt en minder goed past in simpele transactionele migraties.

### Wanneer gebruik je dit?
- Bij grote tabellen in productie.
- Als je downtime wilt vermijden.

### Voordelen
- Minder blokkade van writes.
- Beter geschikt voor live systemen.

### Nadelen
- Het aanmaken duurt langer.
- Je mag het niet in een transactieblok uitvoeren.

### Technische werking
- PostgreSQL bouwt de index zonder langdurige exclusieve tabelblokkade.
- Tijdens het proces kunnen writes doorgaan en worden die later mee verwerkt.
- Daardoor is de operatie veiliger voor live verkeer, maar minder snel dan een gewone index build.

### Praktische implementatie
Gebruik dit bij productiemigraties, grote tabellen met veel verkeer en online schema changes waarbij beschikbaarheid belangrijk is.

### Voorbeeld
```sql
CREATE INDEX CONCURRENTLY idx_logs_created_at ON logs (created_at);
```

### Praktische tip
Gebruik concurrent index creation tijdens onderhoudsvensters of migration flows die rekening houden met de beperkingen van PostgreSQL.

Controleer ook vooraf of je migratietool `CONCURRENTLY` correct ondersteunt.

---

## 13. Index Maintenance

Indexen zijn niet iets dat je eenmalig maakt en daarna vergeet. Ze hebben onderhoud nodig, vooral op tabellen met veel writes. PostgreSQL moet indexen bijhouden terwijl data verandert, en dat kan op termijn leiden tot bloat, suboptimale plannen of onnodige indexen die alleen maar extra werk veroorzaken.

### Waar moet je op letten?
- Bloat: indexen kunnen groeien door updates en deletes.
- Ongebruikte indexen: sommige indexen leveren niets op maar kosten wel onderhoud.
- Statistieken: PostgreSQL moet goede statistieken hebben om een index goed te kunnen gebruiken.

### Veelvoorkomende onderhoudstaken
| Taak | Waarom |
|---|---|
| `VACUUM` | Ruimt oude data op en houdt prestaties stabiel |
| `ANALYZE` | Verbetert queryplannen door statistieken bij te werken |
| `REINDEX` | Bouwt een index opnieuw op als die te veel bloat heeft |

### Technische werking
- `VACUUM` maakt oude, niet meer zichtbare tuples vrij.
- `ANALYZE` vernieuwt statistieken zodat de planner betere keuzes kan maken.
- `REINDEX` bouwt een index opnieuw op en kan structurele bloat verminderen.

### Praktische implementatie
Onderhoud is vooral belangrijk bij tabellen met veel updates of deletes, grote productiedatabases, indexen op vaak veranderende kolommen en systemen waar queryplannen plots slechter lijken te worden.

### Voorbeeld
```sql
VACUUM ANALYZE users;
REINDEX INDEX idx_users_email;
```

### Praktische tip
Als een query ineens trager wordt, kijk dan niet alleen naar de query zelf. Controleer ook of de indexen nog gezond zijn en of PostgreSQL recente statistieken heeft.

Gebruik periodieke monitoring om te zien welke indexen wel bestaan maar nauwelijks gebruikt worden.

---

## 14. Indexing Best Practices

Goede indexering draait niet om zoveel mogelijk indexen maken, maar om de juiste index op de juiste plek zetten. De beste indexstrategie komt uit query-analyse, databestandsgrootte, schrijffrequentie en de manier waarop je applicatie data gebruikt.

Technisch gezien wil je een index die selectief genoeg is, klein genoeg blijft om snel te onderhouden en aansluit op de operators die de planner echt kan benutten.

### Richtlijnen
- Indexeer kolommen die vaak in `WHERE`, `JOIN`, `ORDER BY` of `GROUP BY` voorkomen.
- Maak niet onnodig veel indexen op schrijfintensieve tabellen.
- Meet altijd met `EXPLAIN` of `EXPLAIN ANALYZE` of een index echt gebruikt wordt.
- Kies het indextype dat past bij het querypatroon, niet bij een gok.
- Houd rekening met opslagruimte en onderhoudskost.

### Praktische checklist
1. Is de query echt traag?
2. Welke kolommen worden gefilterd of gesorteerd?
3. Is de data groot genoeg om indexering te rechtvaardigen?
4. Past B-tree, of is een gespecialiseerd type beter?
5. Heeft de index aantoonbaar effect met `EXPLAIN ANALYZE`?

### Veelgemaakte fouten
- Te veel indexen aanmaken uit voorzorg.
- Een index maken op een kolom met weinig onderscheidend vermogen zonder duidelijk voordeel.
- Vergeten dat writes duurder worden door extra indexen.
- Niet kijken naar de echte query's van de applicatie.

### Technische checklist
- Gebruik `EXPLAIN ANALYZE` om te zien of de planner de index pakt.
- Kijk naar selectiviteit: hoe kleiner het nuttige resultaat, hoe meer kans op winst.
- Denk aan operator support: niet elk indextype ondersteunt elke vergelijking.
- Controleer write-last: een tabel met veel writes kan slechter worden door te veel indexen.

### Praktische implementatie
Kies meestal deze volgorde:
1. Meet de trage query.
2. Begrijp de filter- en sorteercondities.
3. Kies het simpelste indextype dat past.
4. Test met `EXPLAIN ANALYZE`.
5. Houd alleen indexen over die echt waarde toevoegen.

### Voorbeeld van analyse
```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC;
```

Gebruik dit soort analyses om te zien of PostgreSQL een index scan, bitmap scan of sequential scan kiest.

Als de planner een sequential scan kiest terwijl je een index verwachtte, kan dat betekenen dat de tabel klein is, de conditie niet selectief genoeg is of dat de statistieken verouderd zijn.

---

## 15. References

- PostgreSQL documentation: Indexes and Index-Only Scans
- PostgreSQL documentation: `CREATE INDEX`
- PostgreSQL documentation: B-tree, GIN, GiST, SP-GiST en BRIN index types
- PostgreSQL documentation: `EXPLAIN` en `EXPLAIN ANALYZE`

### Handige vuistregel
Als je twijfelt, begin met begrijpen van de query. Pas daarna kies je het indextype. Een goede index volgt het gebruikspatroon van de applicatie, niet andersom.

Een index is dus geen doel op zich; het is een antwoord op een concreet queryprobleem.
