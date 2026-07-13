# PostgreSQL Performance Analyse — Uitgebreide Gids

> **Doelgroep:** developers die REST API's bouwen met FastAPI, SQLAlchemy en PostgreSQL (16/17), en die willen leren hoe je query- en databaseprestaties systematisch analyseert en verbetert.
>
> **Scope:** deze gids behandelt PostgreSQL-native analysetools, de theorie erachter, praktische voorbeelden met echte `EXPLAIN ANALYZE`-output, en een apart hoofdstuk over ORM-specifieke valkuilen met SQLAlchemy/FastAPI.

---

## Inhoudsopgave

1. [Overzicht: opties om performance te analyseren](#1-overzicht-opties-om-performance-te-analyseren)
2. [Functies & operatoren voor analyse](#2-functies--operatoren-voor-analyse)
3. [Waar je op moet letten bij performance-analyse](#3-waar-je-op-moet-letten-bij-performance-analyse)
4. [Stappenplan om performance te verbeteren](#4-stappenplan-om-performance-te-verbeteren)
5. [Praktische voorbeelden](#5-praktische-voorbeelden)
6. [Best practices](#6-best-practices)
7. [Extensies & externe tools](#7-extensies--externe-tools)
8. [FastAPI + SQLAlchemy: ORM-specifieke performance](#8-fastapi--sqlalchemy-orm-specifieke-performance)
9. [Dat ene belangrijke ding dat je nog niet wist](#9-dat-ene-belangrijke-ding-dat-je-nog-niet-wist)
10. [Cheatsheet & samenvatting](#10-cheatsheet--samenvatting)

---

## 1. Overzicht: opties om performance te analyseren

PostgreSQL biedt performance-analyse op **vier niveaus**. Het is belangrijk deze te onderscheiden, want elk niveau beantwoordt een andere vraag.

| Niveau | Vraag die het beantwoordt | Belangrijkste tools |
|---|---|---|
| **1. Query-niveau** | "Waarom is *deze specifieke* query traag?" | `EXPLAIN`, `EXPLAIN ANALYZE`, `auto_explain` |
| **2. Statistieken-niveau** | "Welke queries/tabellen/indexen kosten globaal het meest?" | `pg_stat_statements`, `pg_stat_user_tables`, `pg_stat_user_indexes` |
| **3. Systeem-niveau** | "Is de bottleneck CPU, geheugen, I/O of locking?" | `pg_stat_activity`, `pg_stat_io` (v16+), `pg_locks`, OS-tools (`iostat`, `top`) |
| **4. Structureel niveau** | "Is mijn schema/indexstrategie/configuratie wel geschikt?" | `pg_stat_user_indexes`, `pg_stat_bgwriter`, `EXPLAIN` op DDL-niveau, configuratie-audit |

### 1.1 De twee fundamentele analysemethoden

**A. Reactief (query-gericht)**
Je hebt een concrete trage query en wil weten *waarom*. Je gebruikt `EXPLAIN (ANALYZE, BUFFERS)` om het effectieve uitvoeringsplan te bekijken.

**B. Proactief (systeem-gericht)**
Je wil weten *welke* queries in je hele applicatie het meeste tijd/resources opslokken, nog vóór iemand klaagt. Hiervoor gebruik je `pg_stat_statements` om alle queries te aggregeren en te sorteren op totale tijd, I/O, of aantal calls.

> 💡 **Vuistregel:** begin altijd proactief (statistieken bekijken om te weten *wat* je moet onderzoeken), en ga dan reactief in detail (EXPLAIN ANALYZE op de specifieke query).

### 1.2 De analyse-flow (visueel overzicht)

```
┌─────────────────────────────────────────────────────────────┐
│  STAP 1: SIGNALEN VERZAMELEN                                  │
│  pg_stat_statements  →  "welke queries kosten het meest?"     │
│  pg_stat_activity    →  "wat draait er NU en hangt het vast?" │
└───────────────────────────┬─────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  STAP 2: QUERY IN DETAIL BEKIJKEN                              │
│  EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) <query>               │
│  → planner-keuzes, effectieve rijen, buffers, tijd per node   │
└───────────────────────────┬─────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  STAP 3: OORZAAK BEPALEN                                       │
│  - Verkeerde/ontbrekende index?                                │
│  - Verouderde statistieken (ANALYZE)?                          │
│  - Sequential scan op grote tabel?                             │
│  - Lock-conflict / bloat / slechte configuratie?                │
└───────────────────────────┬─────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  STAP 4: FIX TOEPASSEN & VALIDEREN                              │
│  Index toevoegen / query herschrijven / config aanpassen        │
│  → opnieuw EXPLAIN ANALYZE om verbetering te bevestigen         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Functies & operatoren voor analyse

### 2.1 `EXPLAIN` — het uitvoeringsplan

`EXPLAIN` toont hoe de query planner van plan is een query uit te voeren, **zonder ze effectief uit te voeren**. Dit is een *geschat* plan, gebaseerd op tabelstatistieken.

```sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 42;
```

**Belangrijkste opties (samen te combineren):**

| Optie | Wat het doet |
|---|---|
| `ANALYZE` | **Voert de query effectief uit** en toont echte tijden + echte rijaantallen naast de schattingen. ⚠️ Bij `INSERT`/`UPDATE`/`DELETE` wijzigt dit echt data — combineer dan met `ROLLBACK` in een transactie, of gebruik `EXPLAIN` zonder `ANALYZE`. |
| `BUFFERS` | Toont hoeveel data-blokken (8 KB pagina's) gelezen werden uit **shared buffers (cache)** vs. **disk**. Cruciaal om I/O-problemen te zien. Vereist meestal `ANALYZE`. |
| `COSTS` | Toont de geschatte kostwaarden (aan/uit, standaard aan). |
| `TIMING` | Toont effectieve tijd per node (standaard aan bij `ANALYZE`). Uitzetten (`TIMING OFF`) vermindert overhead bij het meten zelf. |
| `SETTINGS` | Toont welke niet-standaard configuratieparameters (bv. `work_mem`) de planner beïnvloedden. |
| `WAL` | Toont hoeveel WAL (Write-Ahead Log) gegenereerd werd — relevant bij schrijf-zware queries. |
| `FORMAT` | Output als `TEXT`, `JSON`, `XML` of `YAML`. `JSON` is handig om programmatisch te verwerken (bv. met tools zoals `explain.dalibo.com`). |

**Aanbevolen "go-to" commando voor diagnose:**

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
SELECT * FROM orders WHERE customer_id = 42;
```

### 2.2 De belangrijkste plan-node types

Wanneer je een `EXPLAIN`-output leest, kom je steeds terug bepaalde "node types" tegen. Elk vertelt iets anders over hoe data wordt opgehaald of verwerkt.

| Node type | Betekenis | Wanneer is dit een probleem? |
|---|---|---|
| **Seq Scan** | Leest de volledige tabel rij per rij. | Problematisch op grote tabellen wanneer slechts een klein deel van de rijen nodig is — signaal dat een index ontbreekt of niet gebruikt wordt. |
| **Index Scan** | Gebruikt een index om relevante rijen te vinden, en haalt per gevonden rij de volledige tuple op uit de heap (tabel). | Prima, maar bij veel matches kan het duurder zijn dan een Seq Scan door willekeurige I/O. |
| **Index Only Scan** | Zoals Index Scan, maar alle gevraagde kolommen staan al in de index — **geen heap-toegang nodig**. Sneller. | Check de `Heap Fetches`-waarde: als die hoog is, is de *visibility map* niet up-to-date (zie `VACUUM`). |
| **Bitmap Heap Scan / Bitmap Index Scan** | Bouwt eerst een "bitmap" van te bezoeken pagina's via de index, leest dan de heap in fysieke volgorde. Efficiënt bij een gemiddeld aantal matches. | Normaal gedrag, geen probleem op zich. |
| **Nested Loop** | Voor elke rij van de buitenste input wordt de binnenste input doorzocht. | Snel bij kleine datasets, **traag bij grote datasets** zonder goede index aan de binnenkant. |
| **Hash Join** | Bouwt een hash-tabel van de kleinste input, matcht dan de andere input ertegen. | Efficiënt voor grote, ongesorteerde datasets. Let op `Batches > 1` → onvoldoende `work_mem`. |
| **Merge Join** | Sorteert beide inputs en voegt ze samen als een rits. | Efficiënt als data al gesorteerd is (bv. via index); anders kost het sorteren extra tijd. |
| **Sort** | Sorteert rijen expliciet. | Let op of dit **in-memory** gebeurt of **on disk** (`Sort Method: external merge` = traag, betekent te weinig `work_mem`). |
| **Aggregate / HashAggregate** | Berekent aggregaten (`COUNT`, `SUM`, `GROUP BY`). | `HashAggregate` kan veel geheugen gebruiken bij veel unieke groepen. |
| **Limit** | Beperkt het aantal geretourneerde rijen. | Let op: als `Limit` bovenop een dure `Sort` zit zonder ondersteunende index, wordt vaak toch alles gesorteerd vóór het limiteren. |

### 2.3 `pg_stat_statements` — geaggregeerde queryanalyse

Dit is de **belangrijkste extensie** voor performance-monitoring. Ze houdt statistieken bij over *elke* uitgevoerde query, geaggregeerd op basis van de querystructuur (parameters genormaliseerd).

**Activeren** (eenmalig, vereist herstart):
```sql
-- In postgresql.conf:
shared_preload_libraries = 'pg_stat_statements'

-- Dan in de database:
CREATE EXTENSION pg_stat_statements;
```

**Belangrijkste kolommen:**

| Kolom | Betekenis |
|---|---|
| `query` | De genormaliseerde querytekst (parameters vervangen door `$1`, `$2`, ...). |
| `calls` | Hoeveel keer deze query werd uitgevoerd. |
| `total_exec_time` | Totale tijd (ms) besteed aan het **uitvoeren** van deze query, over alle calls samen. |
| `mean_exec_time` | Gemiddelde tijd per call — handig om trage individuele calls te herkennen. |
| `rows` | Totaal aantal geretourneerde/verwerkte rijen. |
| `shared_blks_hit` | Aantal blokken gelezen uit **cache** (shared buffers). |
| `shared_blks_read` | Aantal blokken gelezen van **disk** (duurder). |
| `shared_blks_dirtied` / `shared_blks_written` | Aantal blokken gewijzigd/weggeschreven — relevant voor schrijf-belasting. |
| `wal_bytes` | Hoeveelheid WAL gegenereerd door deze query. |

**Typische diagnostische query — top 10 traagste queries op totale tijd:**
```sql
SELECT query, calls, total_exec_time, mean_exec_time, rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

**Top queries op cache-inefficiëntie (veel disk reads):**
```sql
SELECT query, shared_blks_read, shared_blks_hit,
       round(100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0), 2) AS cache_hit_ratio
FROM pg_stat_statements
ORDER BY shared_blks_read DESC
LIMIT 10;
```

> 💡 `total_exec_time` sorteert op **totale impact** (calls × gemiddelde tijd) — dit is vaak nuttiger dan sorteren op `mean_exec_time`, want een query die 10.000× per seconde draait en elk maar 2ms kost, kan meer totale belasting geven dan een zware query die 1× per uur draait.

### 2.4 `pg_stat_activity` — wat gebeurt er nu?

Toont alle actieve (en idle) databaseconnecties in real-time. Onmisbaar om **vastlopende** of **langlopende** queries te vinden.

```sql
SELECT pid, usename, state, wait_event_type, wait_event,
       now() - query_start AS running_since, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY running_since DESC;
```

**Belangrijkste kolommen:**

| Kolom | Betekenis |
|---|---|
| `state` | `active`, `idle`, `idle in transaction` (⚠️ potentieel probleem — zie sectie 3), `idle in transaction (aborted)`. |
| `wait_event_type` / `wait_event` | Waarom de query wacht: `Lock` (wacht op een andere transactie), `IO` (wacht op disk), `Client` (wacht op de applicatie zelf). |
| `query_start` | Wanneer de huidige query begon — `now() - query_start` geeft de looptijd. |
| `xact_start` | Wanneer de **transactie** begon (kan langer lopen dan de huidige query). |

### 2.5 `pg_stat_io` (PostgreSQL 16+) — I/O-statistieken per backend-type

Nieuw sinds versie 16: een genormaliseerde weergave van I/O-activiteit, opgesplitst per `backend_type` (bv. `client backend`, `autovacuum worker`) en `io_object` (`relation`, `temp relation`).

```sql
SELECT backend_type, io_object, io_context,
       reads, read_time, writes, write_time, hits
FROM pg_stat_io
WHERE reads > 0
ORDER BY read_time DESC;
```

Dit maakt het mogelijk om bv. te zien of **autovacuum** veel I/O veroorzaakt, los van reguliere queries — iets wat vóór v16 veel moeilijker te isoleren was.

### 2.6 `pg_stat_user_tables` en `pg_stat_user_indexes`

**Tabelstatistieken** — toont scan-patronen en onderhoudsstatus per tabel:

```sql
SELECT relname, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch,
       n_live_tup, n_dead_tup, last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;
```

| Kolom | Betekenis |
|---|---|
| `seq_scan` | Aantal keer dat een sequentiële scan werd uitgevoerd op deze tabel. |
| `seq_tup_read` | Aantal rijen gelezen via sequentiële scans — hoog + grote tabel = alarmsignaal. |
| `idx_scan` | Aantal keer een index werd gebruikt om deze tabel te bevragen. |
| `n_live_tup` / `n_dead_tup` | Aantal levende vs. "dode" (verwijderde maar nog niet opgeruimde) rijen — hoge `n_dead_tup` wijst op **bloat**. |
| `last_autovacuum` / `last_autoanalyze` | Wanneer autovacuum/autoanalyze laatst liep — te lang geleden = verouderde statistieken. |

**Indexstatistieken** — toont welke indexen daadwerkelijk gebruikt worden:

```sql
SELECT relname AS table_name, indexrelname AS index_name,
       idx_scan, idx_tup_read, idx_tup_fetch,
       pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

> 💡 Indexen met `idx_scan = 0` op een productiedatabase die al lang draait, zijn kandidaten om te **verwijderen** — ze kosten schrijfprestaties (elke INSERT/UPDATE moet ze onderhouden) zonder ooit leesvoordeel te leveren.

### 2.7 `pg_locks` — lock-conflicten opsporen

```sql
SELECT locktype, relation::regclass, mode, granted, pid
FROM pg_locks
WHERE NOT granted;
```

Combineer met `pg_stat_activity` om te zien **welke query** een lock vasthoudt waarop een andere query wacht (blocking chain).

### 2.8 `ANALYZE` en `VACUUM` — onderhoudscommando's die de analyse beïnvloeden

| Commando | Doel |
|---|---|
| `ANALYZE tablename;` | Werkt de **statistieken** bij (kolomverdeling, aantal rijen) die de planner gebruikt om kostenschattingen te maken. Verouderde statistieken = slechte plankeuzes. |
| `VACUUM tablename;` | Ruimt "dode" tuples op (van UPDATE/DELETE) en werkt de **visibility map** bij, wat Index Only Scans efficiënter maakt. |
| `VACUUM ANALYZE tablename;` | Beide gecombineerd — vaak de eerste stap bij onderzoek naar een onverwacht traag plan. |
| `VACUUM (VERBOSE, ANALYZE)` | Toont gedetailleerde output over hoeveel ruimte gereclaimed werd. |

### 2.9 Operator- en functie-overzicht: kostgerelateerde instellingen

Deze **planner cost constants** bepalen hoe de planner kosten inschat (en dus welk plan hij kiest) — geen "functies" om aan te roepen, maar cruciale parameters om te kennen bij het interpreteren van `EXPLAIN`-kosten:

| Parameter | Standaardwaarde | Betekenis |
|---|---|---|
| `seq_page_cost` | 1.0 | Geschatte kost om 1 pagina sequentieel te lezen. |
| `random_page_cost` | 4.0 | Geschatte kost om 1 pagina willekeurig te lezen (hoger dan sequentieel door disk-seek-tijd). **Op SSD/NVMe vaak te verlagen naar 1.1–2.0**, wat de planner sneller richting Index Scans stuurt. |
| `cpu_tuple_cost` | 0.01 | Kost per verwerkte rij. |
| `cpu_index_tuple_cost` | 0.005 | Kost per indexrij-verwerking. |
| `effective_cache_size` | 4GB (voorbeeld) | Schatting van hoeveel geheugen (OS-cache + shared_buffers) beschikbaar is voor caching — **geen geheugen-allocatie**, puur een hint aan de planner. Te laag ingesteld = planner kiest onnodig vaak Seq Scans. |

---

## 3. Waar je op moet letten bij performance-analyse

### 3.1 Meet nooit alleen "geschat" — meet altijd "effectief"

`EXPLAIN` zonder `ANALYZE` toont enkel **schattingen**. Een query kan een prima geschat plan hebben en toch traag zijn omdat de schatting fout is (bv. verouderde statistieken). Vergelijk altijd:

- **Geschatte rijen** (`rows=...` in de `EXPLAIN`-output) vs.
- **Effectieve rijen** (`actual rows=...` met `ANALYZE`)

Een groot verschil (bv. schatting 10, effectief 100.000) is een **rode vlag**: de planner koos zijn plan op basis van foute aannames.

### 3.2 Cache-effecten vertekenen metingen

De eerste keer dat je een query uitvoert, moet data van disk gelezen worden (traag). Bij herhaling zit die data in de **shared buffers cache** (snel). Als je een query test, test ze dus:
- **Koud** (na een herstart of `DISCARD ALL` / cache-flush) om worst-case te zien.
- **Warm** (na een paar keer uitvoeren) om het realistische productiegedrag te zien — de meeste productiequeries draaien immers herhaaldelijk.

Gebruik `BUFFERS` in je `EXPLAIN`-commando om `shared hit` (cache) vs. `shared read` (disk) te onderscheiden.

### 3.3 Test met realistische datavolumes

Een query die instant is op 1.000 testrijen kan drastisch anders presteren op 10 miljoen productierijen — niet enkel qua tijd, maar **de planner kan zelfs een compleet ander plan kiezen** (bv. Seq Scan i.p.v. Index Scan) omdat kostenberekeningen schaalafhankelijk zijn.

### 3.4 "Idle in transaction" is een stille killer

Een applicatieconnectie die een transactie opent maar niet sluit (bv. door een vergeten `commit()` in de ORM, of een lang wachtende externe call binnen een transactie) houdt:
- Locks vast (blokkeert andere schrijvers).
- Voorkomt dat `VACUUM` dode tuples kan opruimen (want die tuples zouden nog zichtbaar kunnen zijn voor die oude transactie).

Controleer regelmatig:
```sql
SELECT pid, usename, state, now() - xact_start AS transaction_age, query
FROM pg_stat_activity
WHERE state = 'idle in transaction'
ORDER BY transaction_age DESC;
```

### 3.5 Correlatie ≠ causaliteit bij trage queries

Een trage query kan traag zijn door:
1. **De query zelf** (slecht plan, ontbrekende index).
2. **Contention** — een andere transactie houdt een lock vast (de query "wacht", ze is niet zelf traag).
3. **Resourcedruk elders** — CPU/geheugen/disk wordt opgeslokt door een andere workload (bv. een zware batch-job of autovacuum) op hetzelfde moment.

Check daarom altijd `wait_event_type` in `pg_stat_activity` vóór je de query zelf gaat optimaliseren.

### 3.6 Parametersensitiviteit ("parameter sniffing")

PostgreSQL genereert plannen soms op basis van specifieke parameterwaarden (bij `PREPARE`d statements na meerdere executies, plan caching). Een plan dat optimaal is voor `WHERE status = 'pending'` (weinig rijen) kan **suboptimaal** zijn voor `WHERE status = 'completed'` (veel rijen) als hetzelfde gecachede plan hergebruikt wordt. Dit is vooral relevant bij ORM's die prepared statements gebruiken (zie hoofdstuk 8).

### 3.7 N+1-queries zijn onzichtbaar in een enkele `EXPLAIN`

Een individuele query kan perfect presteren (`EXPLAIN ANALYZE` toont < 1ms), maar als je applicatie deze query 500× uitvoert in een lus (klassiek ORM-probleem), is de **totale** impact enorm. Dit zie je niet in een losse `EXPLAIN` — hiervoor heb je `pg_stat_statements` (kijk naar `calls`) of applicatie-logging nodig.

### 3.8 Statistieken vs. realiteit — `default_statistics_target`

De planner gebruikt steekproef-statistieken (histogrammen) om rijaantallen te schatten. Bij zeer scheve dataverdelingen (bv. 90% van de rijen heeft `status = 'closed'`, 10% verdeeld over 5 andere statussen) kan de standaard steekproefgrootte (`default_statistics_target = 100`) te grof zijn. Verhogen (tot 1000) per kolom kan schattingen sterk verbeteren:

```sql
ALTER TABLE orders ALTER COLUMN status SET STATISTICS 500;
ANALYZE orders;
```

---

## 4. Stappenplan om performance te verbeteren

Dit is een generiek, herbruikbaar stappenplan dat je op elk performance-probleem kan toepassen.

### Stap 1 — Identificeer de zwaarste belasting (proactief)
```sql
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```
→ Noteer de top 3–5 queries. Dit is je prioriteitenlijst.

### Stap 2 — Analyseer het uitvoeringsplan
```sql
EXPLAIN (ANALYZE, BUFFERS) <query met representatieve parameters>;
```
→ Zoek naar: Seq Scans op grote tabellen, grote verschillen tussen geschatte en effectieve rijen, hoge `shared_blks_read`, `Sort Method: external merge`.

### Stap 3 — Controleer de "gezondheid" van betrokken tabellen
```sql
SELECT n_live_tup, n_dead_tup, last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables WHERE relname = 'orders';
```
→ Veel dode tuples of oude `last_autoanalyze`? Draai eerst `VACUUM ANALYZE` en herhaal Stap 2 — dit alleen al lost soms alles op.

### Stap 4 — Bepaal de oorzaak-categorie

| Symptoom in `EXPLAIN`-output | Waarschijnlijke oorzaak | Typische fix |
|---|---|---|
| Seq Scan op grote tabel met selectieve `WHERE` | Ontbrekende index | `CREATE INDEX` op de gefilterde kolom(men) |
| Index Scan gekozen, maar toch traag | Slechte selectiviteit / verkeerde indexvolgorde bij samengestelde index | Kolomvolgorde herzien, of composite/partial index |
| `Heap Fetches` hoog bij Index Only Scan | Visibility map niet up-to-date | `VACUUM` |
| `Sort Method: external merge Disk` | Te weinig `work_mem` | `work_mem` verhogen (sessie of globaal) |
| `Hash Batches > 1` | Te weinig `work_mem` voor hash join | `work_mem` verhogen |
| Grote afwijking geschat vs. effectief rijen | Verouderde/te grove statistieken | `ANALYZE`, evt. `SET STATISTICS` verhogen |
| Nested Loop met hoog aantal iteraties | Ontbrekende index aan de binnenkant van de loop | Index toevoegen op de join-kolom |
| Veel tijd in `wait_event_type = Lock` | Lock-contention | Transacties korter maken, juiste isolatie-niveau, `NOWAIT`/`SKIP LOCKED` overwegen |
| Query op zich snel, maar `calls` extreem hoog | N+1-probleem in applicatiecode | Eager loading / batching in ORM (zie hoofdstuk 8) |

### Stap 5 — Pas één wijziging per keer toe
Wijzig **niet** meerdere zaken tegelijk (index + config + query herschrijven). Zo weet je niet welke wijziging het verschil maakte, en kan je niet correct terugdraaien als iets averechts werkt.

### Stap 6 — Valideer met dezelfde meetmethode
Herhaal exact dezelfde `EXPLAIN (ANALYZE, BUFFERS)`-query en vergelijk:
- Uitvoeringstijd (`Execution Time`)
- Gekozen node types (bv. Seq Scan → Index Scan)
- `shared_blks_read` (minder disk-I/O = beter)

### Stap 7 — Monitor op lange termijn
Eenmalige verbetering ≠ blijvende verbetering. Data groeit, verdelingen veranderen. Zet periodieke checks op (zie hoofdstuk 6, monitoring) en reset `pg_stat_statements` periodiek (`SELECT pg_stat_statements_reset();`) om met verse cijfers te werken na een grote wijziging.

### Visueel beslisschema

```
Trage query gevonden
        │
        ▼
  VACUUM ANALYZE recent gedraaid?
        │
   ┌────┴────┐
  NEE        JA
   │           │
   ▼           ▼
Draai VACUUM   EXPLAIN (ANALYZE, BUFFERS)
ANALYZE eerst        │
   │                 ▼
   │          Seq Scan op grote tabel + selectieve filter?
   │                 │
   │            ┌────┴────┐
   │           JA         NEE
   │            │           │
   │            ▼           ▼
   │      Index toevoegen   Sort/Hash op disk?
   │            │                │
   │            │           ┌────┴────┐
   │            │          JA         NEE
   │            │           │           │
   │            │           ▼           ▼
   │            │     work_mem      Check locks /
   │            │     verhogen      N+1 / applicatie
   │            │           │           │
   └────────────┴───────────┴───────────┘
                       │
                       ▼
              Hermeet & vergelijk
```

---

## 5. Praktische voorbeelden

> ℹ️ De onderstaande `EXPLAIN ANALYZE`-outputs zijn representatieve voorbeelden opgesteld in het exacte PostgreSQL 16/17-outputformaat, gebaseerd op een typische `orders`/`customers`-schema zoals je dat in een boekingsplatform (vergelijkbaar met je Pavone-project) zou tegenkomen. De structuur en interpretatie zijn 1-op-1 toepasbaar op jouw eigen output — voer dezelfde commando's uit op je eigen database om je exacte cijfers te zien.

### Voorbeeld 1 — Ontbrekende index: Seq Scan vs. Index Scan

**Situatie:** een `orders`-tabel met 2 miljoen rijen. We zoeken alle bestellingen van één klant.

```sql
SELECT * FROM orders WHERE customer_id = 4821;
```

**Vóór — geen index op `customer_id`:**
```
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 4821;

                                                    QUERY PLAN
------------------------------------------------------------------------------------------------------------------
 Seq Scan on orders  (cost=0.00..48291.00 rows=42 width=186) (actual time=0.041..312.887 rows=38 loops=1)
   Filter: (customer_id = 4821)
   Rows Removed by Filter: 1999962
   Buffers: shared hit=128 read=39812
 Planning Time: 0.112 ms
 Execution Time: 313.021 ms
```

**Analyse van deze output:**
- `Seq Scan on orders`: de volledige tabel wordt doorlopen.
- `Rows Removed by Filter: 1999962`: bijna 2 miljoen rijen werden gelezen en **weer weggegooid** om 38 relevante rijen te vinden — extreem inefficiënt.
- `Buffers: shared hit=128 read=39812`: 39.812 pagina's (~311 MB) moesten van disk gelezen worden.
- `Execution Time: 313.021 ms` voor een query die eigenlijk instant zou moeten zijn.

**Fix:**
```sql
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
```

**Nadien:**
```
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 4821;

                                                        QUERY PLAN
--------------------------------------------------------------------------------------------------------------------------
 Index Scan using idx_orders_customer_id on orders  (cost=0.42..8.87 rows=42 width=186) (actual time=0.018..0.041 rows=38 loops=1)
   Index Cond: (customer_id = 4821)
   Buffers: shared hit=6
 Planning Time: 0.098 ms
 Execution Time: 0.061 ms
```

**Resultaat:** van **313 ms naar 0,06 ms** — een verbetering van ruim 5000×. `Buffers` daalde van 39.812 naar 6. Dit is het meest voorkomende en meest impactvolle type fix.

---

### Voorbeeld 2 — Verouderde statistieken leiden tot een verkeerd plan

**Situatie:** na een grote bulk-import van 500.000 nieuwe `orders`-rijen met `status = 'pending'` is `ANALYZE` nog niet gedraaid.

```
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE status = 'pending';

                                                     QUERY PLAN
---------------------------------------------------------------------------------------------------------------------
 Index Scan using idx_orders_status on orders  (cost=0.43..1204.11 rows=850 width=186) (actual time=0.023..891.442 rows=500120 loops=1)
   Index Cond: (status = 'pending'::text)
   Buffers: shared hit=1022 read=48211
 Planning Time: 0.089 ms
 Execution Time: 923.667 ms
```

**Analyse:**
- Geschat (`rows=850`) vs. effectief (`rows=500120`): een factor **588× te laag** geschat.
- De planner koos een `Index Scan` omdat hij dacht dat er maar 850 matches zouden zijn — in werkelijkheid zijn het er 500.120. Een Index Scan die 500.000 individuele heap-lookups doet, is trager dan een Seq Scan zou zijn geweest.
- Dit is een **directe indicatie van verouderde statistieken** na de bulk-import.

**Fix:**
```sql
ANALYZE orders;
```

**Nadien:**
```
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE status = 'pending';

                                                 QUERY PLAN
----------------------------------------------------------------------------------------------------------------
 Seq Scan on orders  (cost=0.00..52340.00 rows=498750 width=186) (actual time=0.021..201.334 rows=500120 loops=1)
   Filter: (status = 'pending'::text)
   Rows Removed by Filter: 1499880
   Buffers: shared hit=812 read=39209
 Planning Time: 0.095 ms
 Execution Time: 234.981 ms
```

**Resultaat:** van 924 ms naar 235 ms. De planner koos nu terecht een `Seq Scan`, want bij zo'n groot percentage matches (25% van de tabel) is dat sneller dan honderdduizenden individuele index-lookups.

> 💡 **Les:** meer/betere indexen is niet altijd de oplossing. Soms is het probleem dat de planner de **verkeerde** keuze maakt door foute informatie — `ANALYZE` lost dat structureel op, ongeacht welk plan uiteindelijk gekozen wordt.

---

### Voorbeeld 3 — Sortering die niet in geheugen past

**Situatie:** een rapportquery die alle bestellingen van het jaar sorteert op bedrag.

```
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE order_date >= '2026-01-01' ORDER BY total_amount DESC;

                                                      QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------
 Sort  (cost=95210.32..96430.11 rows=487916 width=186) (actual time=1821.223..2340.552 rows=487916 loops=1)
   Sort Key: total_amount DESC
   Sort Method: external merge  Disk: 98432kB
   Buffers: shared hit=920 read=41022, temp read=12304 written=12310
   ->  Seq Scan on orders  (cost=0.00..52340.00 rows=487916 width=186) (actual time=0.033..298.771 rows=487916 loops=1)
         Filter: (order_date >= '2026-01-01'::date)
 Planning Time: 0.101 ms
 Execution Time: 2489.887 ms
```

**Analyse:**
- `Sort Method: external merge  Disk: 98432kB`: de sortering paste niet in `work_mem` en werd naar **tijdelijke bestanden op disk** geschreven — dit is traag.
- `temp read=12304 written=12310`: bevestigt schrijf-/leesactiviteit op disk voor de sortering.
- De sort zelf kost hier ~2 seconden van de totale 2,49 seconden.

**Fix (op sessieniveau, voor rapportqueries):**
```sql
SET work_mem = '256MB';  -- was standaard 4MB
```

**Nadien:**
```
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE order_date >= '2026-01-01' ORDER BY total_amount DESC;

                                                    QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------
 Sort  (cost=95210.32..96430.11 rows=487916 width=186) (actual time=298.991..341.208 rows=487916 loops=1)
   Sort Key: total_amount DESC
   Sort Method: quicksort  Memory: 61402kB
   Buffers: shared hit=920 read=41022
   ->  Seq Scan on orders  (cost=0.00..52340.00 rows=487916 width=186) (actual time=0.030..287.552 rows=487916 loops=1)
         Filter: (order_date >= '2026-01-01'::date)
 Planning Time: 0.098 ms
 Execution Time: 358.129 ms
```

**Resultaat:** van 2490 ms naar 358 ms. `Sort Method` wijzigde van `external merge Disk` naar `quicksort Memory`.

> ⚠️ **Let op:** `work_mem` wordt **per sort/hash-operatie, per connectie** toegepast — niet globaal gedeeld. Bij veel gelijktijdige connecties kan een te hoge globale `work_mem` je server geheugen laten opraken. Verhoog dit liever **per sessie** voor specifieke rapportqueries (zoals hierboven) dan globaal in `postgresql.conf`, tenzij je zeker weet dat je connectielimiet dit toelaat.

---

### Voorbeeld 4 — Inefficiënte Nested Loop bij een JOIN

**Situatie:** ontbrekende index op de foreign key kant van een join.

```sql
SELECT c.name, o.id, o.total_amount
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'BE';
```

**Vóór — geen index op `orders.customer_id`:**
```
EXPLAIN (ANALYZE, BUFFERS)
SELECT c.name, o.id, o.total_amount
FROM customers c JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'BE';

                                                        QUERY PLAN
----------------------------------------------------------------------------------------------------------------------------
 Nested Loop  (cost=0.29..184920.55 rows=98420 width=48) (actual time=0.061..4821.332 rows=97650 loops=1)
   ->  Seq Scan on customers c  (cost=0.00..3210.00 rows=8420 width=24) (actual time=0.028..18.220 rows=8390 loops=1)
         Filter: (country = 'BE'::text)
         Rows Removed by Filter: 91610
   ->  Index Scan using idx_orders_customer_id on orders o  (cost=0.42..21.15 rows=12 width=32) (actual time=0.002..0.532 rows=12 loops=8390)
         Index Cond: (customer_id = c.id)
 Planning Time: 0.201 ms
 Execution Time: 4890.114 ms
```

**Analyse:**
- `loops=8390`: voor elke Belgische klant (8390 stuks) wordt een aparte Index Scan uitgevoerd op `orders`.
- Dit lijkt legitiem (het gebruikt een index!), maar 8390 losse index-lookups met individuele overhead is trager dan één efficiënte hash join zou zijn.
- **Oorzaak:** `work_mem` is hier te laag ingesteld waardoor de planner een `Hash Join` (die een hashtabel van 8390 klanten zou bouwen) vermeed en koos voor Nested Loop.

**Fix — `work_mem` verhogen zodat de planner een Hash Join kan overwegen:**
```sql
SET work_mem = '64MB';
```

**Nadien:**
```
EXPLAIN (ANALYZE, BUFFERS)
SELECT c.name, o.id, o.total_amount
FROM customers c JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'BE';

                                                     QUERY PLAN
------------------------------------------------------------------------------------------------------------------------
 Hash Join  (cost=3420.25..42910.80 rows=98420 width=48) (actual time=25.331..198.552 rows=97650 loops=1)
   Hash Cond: (o.customer_id = c.id)
   ->  Seq Scan on orders o  (cost=0.00..35210.00 rows=2000000 width=32) (actual time=0.012..85.221 rows=2000000 loops=1)
   ->  Hash  (cost=3210.00..3210.00 rows=8420 width=24) (actual time=19.882..19.883 rows=8390 loops=1)
         Buckets: 16384  Batches: 1  Memory Usage: 621kB
         ->  Seq Scan on customers c  (cost=0.00..3210.00 rows=8420 width=24) (actual time=0.021..15.442 rows=8390 loops=1)
               Filter: (country = 'BE'::text)
               Rows Removed by Filter: 91610
 Planning Time: 0.188 ms
 Execution Time: 210.667 ms
```

**Resultaat:** van 4890 ms naar 211 ms. `Batches: 1` bevestigt dat de hashtabel volledig in geheugen paste (geen disk spill).

---

### Voorbeeld 5 — Index Only Scan en het belang van `VACUUM`

**Situatie:** een query die enkel geaggregeerde info nodig heeft, waarbij alle gevraagde kolommen in de index zitten.

```sql
CREATE INDEX idx_orders_customer_status ON orders (customer_id, status);

SELECT customer_id, status FROM orders WHERE customer_id = 4821;
```

**Direct na veel UPDATE-activiteit, vóór VACUUM:**
```
EXPLAIN (ANALYZE, BUFFERS)
SELECT customer_id, status FROM orders WHERE customer_id = 4821;

                                                              QUERY PLAN
----------------------------------------------------------------------------------------------------------------------------------------
 Index Only Scan using idx_orders_customer_status on orders  (cost=0.42..8.85 rows=38 width=12) (actual time=0.045..0.211 rows=38 loops=1)
   Index Cond: (customer_id = 4821)
   Heap Fetches: 38
   Buffers: shared hit=42
 Planning Time: 0.088 ms
 Execution Time: 0.244 ms
```

**Analyse:**
- `Heap Fetches: 38`: ondanks dat het een "Index Only" Scan is, moest voor **elke** rij toch de heap geraadpleegd worden — de visibility map wist niet zeker of de rijen zichtbaar waren voor deze transactie (typisch na veel schrijfactiviteit zonder recente `VACUUM`).

**Fix:**
```sql
VACUUM orders;
```

**Nadien:**
```
EXPLAIN (ANALYZE, BUFFERS)
SELECT customer_id, status FROM orders WHERE customer_id = 4821;

                                                              QUERY PLAN
----------------------------------------------------------------------------------------------------------------------------------------
 Index Only Scan using idx_orders_customer_status on orders  (cost=0.42..8.85 rows=38 width=12) (actual time=0.019..0.028 rows=38 loops=1)
   Index Cond: (customer_id = 4821)
   Heap Fetches: 0
   Buffers: shared hit=4
 Planning Time: 0.075 ms
 Execution Time: 0.041 ms
```

**Resultaat:** `Heap Fetches` daalt naar 0, `Buffers` van 42 naar 4, tijd van 0,24 ms naar 0,04 ms. Een kleine wijziging op microniveau, maar bij hoge frequentie (duizenden calls/seconde) telt dit sterk op.

---

## 6. Best practices

### 6.1 Bij het analyseren

- ✅ **Gebruik altijd `EXPLAIN (ANALYZE, BUFFERS)`**, nooit enkel `EXPLAIN`, wanneer je een écht performanceprobleem onderzoekt.
- ✅ **Meet met representatieve parameters.** `WHERE status = 'pending'` en `WHERE status = 'completed'` kunnen totaal verschillende plannen opleveren bij scheve verdelingen.
- ✅ **Begin bij `pg_stat_statements`**, niet bij losse queries — zo optimaliseer je wat er écht toe doet, niet wat toevallig opviel.
- ✅ **Isoleer variabelen.** Test op een omgeving met representatieve data, niet op een lege dev-database.
- ✅ **Reset statistieken na een grote wijziging** (`pg_stat_statements_reset()`) zodat je metingen niet vervuild worden door "oude" cijfers.
- ❌ **Vertrouw geen microbenchmarks van één enkele run.** Draai queries meerdere keren (warm cache) voor een stabiel beeld.
- ❌ **Interpreteer `cost` niet als milliseconden.** De `cost`-waarden in `EXPLAIN` (zonder ANALYZE) zijn abstracte, relatieve eenheden — enkel `actual time` is een echte tijdsmeting.

### 6.2 Bij indexen

- ✅ **Indexeer kolommen die vaak in `WHERE`, `JOIN ON` en `ORDER BY` voorkomen.**
- ✅ **Composite indexen:** volgorde van kolommen doet ertoe. Zet de kolom met de hoogste selectiviteit (of de kolom die met `=` gefilterd wordt) eerst, gevolgd door kolommen gebruikt in bereik-condities of sortering.
- ✅ **Partial indexes** voor veelgebruikte filters op een subset (bv. `WHERE status = 'active'`):
  ```sql
  CREATE INDEX idx_orders_active ON orders (customer_id) WHERE status = 'active';
  ```
  Kleiner, sneller te onderhouden, en de planner gebruikt ze automatisch wanneer de query-conditie overeenkomt.
- ✅ **Verwijder ongebruikte indexen** (`idx_scan = 0` in `pg_stat_user_indexes` na een representatieve periode) — ze vertragen elke schrijfoperatie zonder leesvoordeel.
- ❌ **Overindexeer niet.** Elke index kost schrijfprestatie (INSERT/UPDATE/DELETE moeten alle indexen bijwerken) en opslagruimte.
- ⚠️ **`CREATE INDEX` blokkeert schrijfoperaties** op de tabel tijdens het bouwen. Gebruik in productie altijd:
  ```sql
  CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders (customer_id);
  ```
  (trager om te bouwen, maar blokkeert geen `INSERT`/`UPDATE`/`DELETE` op de tabel.)

### 6.3 Bij onderhoud

- ✅ **Vertrouw autovacuum, maar controleer het.** Op tabellen met zeer hoge schrijffrequentie kan de standaard autovacuum-drempel (`autovacuum_vacuum_scale_factor = 0.2`, d.w.z. pas bij 20% dode tuples) te traag reageren — verlaag dit per tabel bij zware write-workloads:
  ```sql
  ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.05);
  ```
- ✅ **Monitor tabel-bloat periodiek** via `n_dead_tup` in `pg_stat_user_tables`.
- ✅ **Plan `ANALYZE` na grote bulk-operaties** (imports, migraties) — autovacuum's `autoanalyze` reageert soms te laat voor onmiddellijk daaropvolgende queries.

### 6.4 Bij configuratie

- ✅ Stem `shared_buffers` af op ~25% van het beschikbare RAM (algemene vuistregel, geen absolute regel).
- ✅ Stem `effective_cache_size` af op ~50–75% van het beschikbare RAM (het is enkel een *hint*, geen allocatie).
- ✅ Verlaag `random_page_cost` naar 1.1–2.0 bij gebruik van SSD/NVMe-opslag (in plaats van de standaard 4.0, die uitgaat van traditionele HDD's).
- ✅ Gebruik `pg_settings` om huidige waarden te controleren:
  ```sql
  SELECT name, setting, unit, context FROM pg_settings 
  WHERE name IN ('shared_buffers','work_mem','effective_cache_size','random_page_cost');
  ```

### 6.5 Bij continue monitoring

- ✅ Automatiseer periodieke snapshots van `pg_stat_statements`, `pg_stat_user_tables`, en `pg_stat_activity` (bv. via je bestaande Prometheus/Grafana-stack met `postgres_exporter`) in plaats van enkel handmatig te controleren.
- ✅ Zet alerting op voor: connecties in `idle in transaction` langer dan X minuten, `n_dead_tup`-ratio boven een drempel, en queries met `mean_exec_time` boven een drempel.
- ✅ Bewaar historische `EXPLAIN`-outputs van kritieke queries zodat je regressies (een plan dat plots verandert na een data- of PostgreSQL-upgrade) kan detecteren.

---

## 7. Extensies & externe tools

### 7.1 PostgreSQL-extensies (draaien in de database zelf)

| Extensie | Doel |
|---|---|
| **`pg_stat_statements`** | (zie hoofdstuk 2) Geaggregeerde query-statistieken — de basis van elke serieuze performance-analyse. |
| **`auto_explain`** | Logt automatisch `EXPLAIN`-plannen van queries die trager zijn dan een ingestelde drempel, zonder dat je de query manueel moet uitvoeren. Ideaal om **onvoorspelbare** trage queries in productie te vangen. Configuratie: `auto_explain.log_min_duration = '500ms'`. |
| **`pg_buffercache`** | Toont wat er precies in de shared buffers cache zit — welke tabellen/indexen het meeste cache-ruimte innemen. |
| **`pgstattuple`** | Gedetailleerde analyse van tabel-/index-bloat (dode ruimte), preciezer dan de schattingen in `pg_stat_user_tables`. |
| **`pg_repack`** | Herbouwt tabellen/indexen om bloat te verwijderen **zonder** een exclusieve lock te vereisen (in tegenstelling tot `VACUUM FULL`). Zeer nuttig in productie. |
| **`hypopg`** | Simuleert het bestaan van een (hypothetische) index en toont hoe de planner zou reageren, **zonder** de index effectief aan te maken. Perfect om te testen of een index zou helpen vóór je de bouw-kost (tijd + lock) effectief betaalt. |
| **`pg_hint_plan`** | Laat je (in uitzonderlijke gevallen) de planner "hints" geven om een specifiek plan te forceren — met de nodige voorzichtigheid, want dit omzeilt de planner-logica. |
| **`pg_qualstats`** | Houdt bij welke `WHERE`/`JOIN`-condities (qualifiers) het vaakst voorkomen — helpt bij het identificeren van **ontbrekende** indexen op basis van effectief queryverkeer, complementair aan `pg_stat_statements`. |

### 7.2 Command-line en GUI-tools

| Tool | Doel |
|---|---|
| **`pgBadger`** | Analyseert PostgreSQL-logbestanden (met `log_min_duration_statement` ingeschakeld) en genereert uitgebreide HTML-rapporten met trends, top-queries, en grafieken. Uitstekend voor periodieke performance-audits. |
| **`pg_activity`** | Terminal-based, real-time dashboard vergelijkbaar met `htop`, maar dan voor PostgreSQL-connecties — toont actieve queries, locks, I/O live. |
| **`explain.dalibo.com`** (of `explain.depesz.com`) | Online visualisatie van `EXPLAIN`-output (plak je JSON/tekst-plan) — kleurt trage nodes, maakt complexe geneste plannen veel leesbaarder dan platte tekst. |
| **`pgAdmin`** | GUI met ingebouwde grafische `EXPLAIN`-visualisatie (boomstructuur i.p.v. platte tekst). |
| **`pgBouncer` / `pgCat`** | Externe **connection poolers**. Cruciaal bij veel korte connecties (zoals typisch bij serverless/FastAPI-workers) om de overhead van het opzetten van nieuwe PostgreSQL-connecties te vermijden. |

### 7.3 Monitoring & observability (aansluitend bij je bestaande stack)

Aangezien je al een Prometheus/Loki/Grafana-observability-stack hebt draaien:

| Tool | Rol |
|---|---|
| **`postgres_exporter`** | Prometheus-exporter die metrics uit `pg_stat_*`-views omzet naar Prometheus-metrics — sluit direct aan op je bestaande Grafana-dashboards. |
| **Grafana dashboard "PostgreSQL Database"** (community ID 9628 e.a.) | Kant-en-klare dashboards bovenop `postgres_exporter`-data: cache hit ratio, connecties, locks, replicatie-lag. |
| **`pgwatch2`** | Alternatief, specifiek voor PostgreSQL-monitoring, met ingebouwde Grafana-dashboards en flexibele metric-collectie — een alternatief voor losse `postgres_exporter`+Grafana-opzet. |

### 7.4 Managed/cloud-specifieke tools

Indien je in de toekomst naar managed hosting migreert (relevant gezien je exploratie van Proxmox/Virtualizor voor eigen infra vs. mogelijke cloud-opties):

- **AWS RDS Performance Insights** / **Azure Database for PostgreSQL Query Performance Insight** — vergelijkbare functionaliteit als `pg_stat_statements`, maar met kant-en-klare grafische interfaces en langere historische retentie zonder zelf iets op te zetten.

---

## 8. FastAPI + SQLAlchemy: ORM-specifieke performance

ORM's zoals SQLAlchemy verbergen SQL achter Python-objecten — comfortabel, maar dit is ook exact waar de meeste performance-problemen ontstaan: **je ziet de effectief gegenereerde SQL niet meer automatisch**. Dit hoofdstuk behandelt de meest voorkomende valkuilen specifiek in een async FastAPI + SQLAlchemy-context.

### 8.1 Het N+1-probleem — de meest voorkomende ORM-valkuil

**Wat het is:** je haalt N objecten op (1 query), en voor elk object triggert een relatie-toegang een aparte query (N extra queries) — in totaal N+1 queries in plaats van 1 of 2.

**Fout voorbeeld (async SQLAlchemy 2.0):**
```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

async def get_orders_with_customers(session: AsyncSession):
    result = await session.execute(select(Order))
    orders = result.scalars().all()

    # ⚠️ PROBLEEM: voor elke order wordt hier een aparte query getriggerd
    # bij toegang tot order.customer (lazy loading)
    return [
        {"order_id": o.id, "customer_name": o.customer.name}
        for o in orders
    ]
```

Bij 500 orders genereert dit **501 queries**: 1 om de orders op te halen, en 500 aparte queries (één per order) om telkens `order.customer` op te halen. Dit is precies het scenario uit sectie 3.7 — elke query afzonderlijk is snel (< 1ms), maar `pg_stat_statements` zou hier `calls = 500` tonen voor de klant-lookup-query, met een enorme totale impact.

> ⚠️ **Belangrijke valkuil in async context:** lazy loading (`order.customer` buiten een `await`-context aanspreken) werkt **niet** standaard met AsyncSession en gooit een `MissingGreenlet`-fout, of vereist `lazy="raise"`/expliciete async-loading-strategieën. Dit dwingt je in de praktijk om join-strategieën expliciet te maken — wat op zich al helpt om N+1 te vermijden.

**Fix — Eager loading met `selectinload` of `joinedload`:**

```python
from sqlalchemy.orm import selectinload

async def get_orders_with_customers(session: AsyncSession):
    result = await session.execute(
        select(Order).options(selectinload(Order.customer))
    )
    orders = result.scalars().all()
    return [
        {"order_id": o.id, "customer_name": o.customer.name}
        for o in orders
    ]
```

Dit genereert **2 queries** in totaal: één voor de orders, één `SELECT ... WHERE customer.id IN (...)` die alle benodigde klanten in bulk ophaalt.

**Wanneer `selectinload` vs. `joinedload` gebruiken:**

| Strategie | Genereert | Beste bij |
|---|---|---|
| `selectinload` | 2 aparte queries (`SELECT ... IN (...)`) | **One-to-many** relaties, of wanneer je veel parent-rijen hebt (vermijdt een grote gedupliceerde JOIN-resultset). |
| `joinedload` | 1 query met `LEFT JOIN` | **Many-to-one** relaties (zoals `order.customer` hierboven), of wanneer je weinig rijen hebt — vermijdt een tweede round-trip. |
| `subqueryload` | 2 queries via subquery | Legacy-optie, `selectinload` is er in de meeste gevallen een efficiëntere vervanger van. |

### 8.2 SQL zichtbaar maken vanuit SQLAlchemy

Voordat je kan optimaliseren, moet je zien wat er effectief naar PostgreSQL gestuurd wordt.

**Optie A — `echo=True` op de engine (development):**
```python
engine = create_async_engine(DATABASE_URL, echo=True)
```
Logt elke gegenereerde SQL-query naar stdout. **Niet gebruiken in productie** (performance-overhead + logt mogelijk gevoelige data).

**Optie B — Compileer een query naar ruwe SQL zonder uit te voeren:**
```python
compiled = str(stmt.compile(compile_kwargs={"literal_binds": True}))
print(compiled)
```
Handig om een query te **kopiëren** en direct in `psql` te testen met `EXPLAIN (ANALYZE, BUFFERS)`.

**Optie C — Query-logging via `sqlalchemy.engine`-logger (fijnmaziger, productie-vriendelijker):**
```python
import logging
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
```

### 8.3 Van SQLAlchemy-query naar `EXPLAIN ANALYZE`

Een concreet werkproces om een trage endpoint te onderzoeken:

```python
# Stap 1: compileer de query naar ruwe SQL
stmt = select(Order).where(Order.customer_id == 4821).options(selectinload(Order.items))
print(str(stmt.compile(compile_kwargs={"literal_binds": True})))
```
```
# Stap 2: plak de output rechtstreeks in psql, voorafgegaan door EXPLAIN
EXPLAIN (ANALYZE, BUFFERS)
SELECT orders.id, orders.customer_id, orders.total_amount
FROM orders
WHERE orders.customer_id = 4821;
```
```python
# Stap 3 (alternatief, direct vanuit Python via raw connection):
from sqlalchemy import text

async def explain_query(session: AsyncSession, stmt):
    compiled = stmt.compile(compile_kwargs={"literal_binds": True})
    result = await session.execute(text(f"EXPLAIN (ANALYZE, BUFFERS) {compiled}"))
    for row in result:
        print(row[0])
```

### 8.4 Connection pooling in async context

Elke nieuwe PostgreSQL-connectie kost tijd om op te zetten (TCP-handshake, authenticatie, backend-proces spawnen). Bij FastAPI met veel gelijktijdige requests is een correct geconfigureerde pool cruciaal.

**Correcte async engine-configuratie:**
```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,          # aantal permanent open connecties in de pool
    max_overflow=5,        # extra connecties toegelaten bij piekbelasting
    pool_timeout=30,       # max wachttijd (s) voor een vrije connectie
    pool_recycle=1800,     # connecties na 30 min recyclen (voorkomt "stale" connecties)
    pool_pre_ping=True,    # test een connectie vóór gebruik (vangt afgesloten connecties op)
)
```

| Parameter | Veelgemaakte fout |
|---|---|
| `pool_size` | Te laag ingesteld → requests wachten op een vrije connectie (`pool_timeout`-errors onder load). Te hoog → overweldigt PostgreSQL's `max_connections`-limiet, zeker bij meerdere FastAPI-workers/replicas die elk hun eigen pool hebben. |
| `pool_pre_ping` | Niet ingeschakeld → "stale connection"-fouten na load balancer timeouts of DB-herstarts. |
| Meerdere Uvicorn/Gunicorn-workers | **Elke worker heeft zijn eigen pool.** 4 workers × `pool_size=10` = mogelijk 40 connecties richting PostgreSQL. Reken dit door t.o.v. `max_connections` in `postgresql.conf` (standaard 100). |

> 💡 **Praktisch advies voor jouw setup:** overweeg **PgBouncer** (transaction pooling mode) tussen je FastAPI-app en PostgreSQL wanneer je meerdere workers/containers draait. Dit ontkoppelt "aantal app-connecties" van "aantal effectieve PostgreSQL-backend-connecties", en is efficiënter dan enkel SQLAlchemy's eigen pool te vergroten.

### 8.5 `AsyncSession`-valkuilen die tot extra queries leiden

**Impliciete flush vóór elke query:**
SQLAlchemy voert automatisch een `flush()` uit vóór elke `SELECT`, zodat pending wijzigingen zichtbaar zijn binnen dezelfde sessie. Bij veel objecten in de sessie kan dit onverwachte overhead geven. Voor bulk-operaties waarbij dit niet nodig is:
```python
async with session.no_autoflush:
    # bulk logic zonder tussentijdse flush
    ...
```

**`session.refresh()` misbruik:** het herladen van een object na elke `commit()` (bv. om een `server_default`-waarde te krijgen) triggert een aparte `SELECT`. Vermijd dit bij bulk-inserts — gebruik i.p.v. dat `RETURNING`-clausules waar mogelijk.

**Ontbrekende `.limit()` bij paginatie:** een klassieke fout is alle rijen ophalen en in Python te slicen (`results[:20]`) i.p.v. `LIMIT`/`OFFSET` (of beter: keyset-paginatie) in de query zelf te gebruiken. Dit haalt onnodig veel data van PostgreSQL naar de applicatie.

```python
# ❌ Fout: haalt alles op, filtert in Python
result = await session.execute(select(Order).order_by(Order.created_at.desc()))
page = result.scalars().all()[:20]

# ✅ Correct: LIMIT in de query zelf
result = await session.execute(
    select(Order).order_by(Order.created_at.desc()).limit(20).offset(page * 20)
)
```

> ⚠️ **`OFFSET` op grote paginanummers is traag** — PostgreSQL moet alle voorgaande rijen tellen en overslaan. Bij diepe paginatie (bv. pagina 5000) is **keyset-paginatie** (`WHERE created_at < :laatste_gezien_waarde ORDER BY created_at DESC LIMIT 20`) drastisch sneller, want het gebruikt de index direct zonder te moeten tellen.

### 8.6 Bulk-operaties: ORM-overhead vermijden

Het aanmaken van 10.000 individuele Python-objecten en ze één voor één `add()`en is traag door ORM-overhead (identity map, change-tracking per object).

```python
# ❌ Traag bij grote aantallen: elk object wordt individueel getrackt
for row in data:
    session.add(Order(**row))
await session.commit()

# ✅ Sneller: SQLAlchemy Core bulk insert, omzeilt ORM-overhead
from sqlalchemy import insert
await session.execute(insert(Order), data)  # data = lijst van dicts
await session.commit()
```

Voor zeer grote bulk-imports (honderdduizenden rijen) is PostgreSQL's native `COPY`-commando (via `psycopg`'s `copy`-API) nog aanzienlijk sneller dan zelfs bulk `INSERT`.

### 8.7 Prepared statements en parametersensitiviteit bij SQLAlchemy

SQLAlchemy gebruikt standaard parameterized queries (goed voor SQL-injectiepreventie én voor plan-hergebruik). Zoals vermeld in sectie 3.6 kan dit bij sterk scheve dataverdelingen leiden tot een suboptimaal hergebruikt plan. Als je dit vermoedt bij een specifieke query, test met `EXPLAIN ANALYZE` op zowel de "kleine" als "grote" parameterwaarde om te zien of het plan sterk verschilt.

### 8.8 Checklist: SQLAlchemy performance-audit

| # | Controle | Hoe |
|---|---|---|
| 1 | Zijn er N+1-queries? | `echo=True` in dev, of `pg_stat_statements` op `calls` sorteren en zoeken naar identieke query's met absurd hoge `calls` |
| 2 | Worden relaties eager geladen waar nodig? | Check `.options(selectinload(...))`/`joinedload(...)` op elke query die relaties gebruikt |
| 3 | Is de connection pool correct gedimensioneerd? | `pool_size × aantal workers` vs. `max_connections` in PostgreSQL |
| 4 | Wordt paginatie correct gedaan? | `LIMIT`/`OFFSET` (of keyset) in de query, niet Python-side slicing |
| 5 | Zijn bulk-operaties geoptimaliseerd? | Core `insert()` i.p.v. losse `session.add()` in een lus, bij > ~1000 rijen |
| 6 | Matchen ORM-gegenereerde indexen met querypatronen? | Vergelijk `Column(index=True)`-definities met werkelijk queryverkeer via `pg_stat_statements`/`pg_qualstats` |

---

## 9. Dat ene belangrijke ding dat je nog niet wist

**De query planner van PostgreSQL is *kosten-gebaseerd*, niet *regel-gebaseerd* — en dat betekent dat "de snelste index" niet bestaat in isolatie.**

Veel developers benaderen indexen alsof er een vaste regel is: "elke `WHERE`-kolom moet een index hebben" of "een Index Scan is altijd beter dan een Seq Scan". Dat klopt niet. De planner schat voor **elk mogelijk plan** een kost, gebaseerd op:

1. Hoeveel rijen naar schatting matchen (**selectiviteit**).
2. Hoe die rijen fysiek verspreid liggen over de tabel (**correlatie** — zie `correlation` in `pg_stats`).
3. De huidige `random_page_cost`/`seq_page_cost`-instellingen.
4. Wat er al in cache zit.

Concreet gevolg: **een index die perfect werkt op een tabel van 10.000 rijen kan door de planner genegeerd worden op een tabel van 10 miljoen rijen** wanneer de query >5-10% van de tabel matcht — niet omdat de index "kapot" is, maar omdat een Seq Scan bij zulke volumes objectief sneller is (sequentiële I/O verslaat honderdduizenden willekeurige I/O-operaties). Dit is exact wat er gebeurde in **Voorbeeld 2** hierboven: een perfect functionerende index werd terecht *niet* gebruikt zodra de planner (na `ANALYZE`) besefte dat 25% van de tabel matchte.

**Waarom dit zo belangrijk is om te weten:**

- Als je een index toevoegt en de planner "kiest hem niet", is dat **niet automatisch een bug of misconfiguratie** — controleer eerst of de query wel selectief genoeg is vóór je gaat forceren (`pg_hint_plan`) of de configuratie gaat aanpassen.
- **Testen op een kleine ontwikkel-database is misleidend.** Een query die daar via een Index Scan draait, kan in productie (10-100× meer data) een volledig ander plan krijgen. Test performance-kritieke queries altijd met representatieve datavolumes, of gebruik `hypopg` (sectie 7.1) om planner-gedrag te simuleren zonder productiedata nodig te hebben.
- **Dit verklaart ook waarom dezelfde query soms "traag" en soms "snel" is** in productie: naarmate een tabel groeit of krimpt (bv. door archivering), kan de planner op een dag overschakelen tussen plantypes voor exact dezelfde query — dit heet een **plan flip**, en is een van de meest verwarrende performance-regressies om te diagnosticeren zonder deze achtergrondkennis.

> 🎯 **Kernles:** optimaliseer nooit blindelings naar "meer indexen" of "forceer Index Scans". Begrijp *waarom* de planner een bepaalde keuze maakt door de kosten en schattingen in `EXPLAIN` te lezen — dat is de vaardigheid die je in staat stelt élk performanceprobleem te diagnosticeren, in plaats van enkel de symptomen uit dit document te herkennen.

---

## 10. Cheatsheet & samenvatting

### 10.1 Snelle diagnose-commando's

```sql
-- Top trage queries (totale impact)
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;

-- Wat draait er nu, en waarom wacht het?
SELECT pid, state, wait_event_type, wait_event, now()-query_start AS duur, query
FROM pg_stat_activity WHERE state != 'idle' ORDER BY duur DESC;

-- Tabellen met veel sequentiële scans (potentieel ontbrekende index)
SELECT relname, seq_scan, seq_tup_read, idx_scan
FROM pg_stat_user_tables ORDER BY seq_scan DESC LIMIT 10;

-- Ongebruikte indexen (kandidaat om te verwijderen)
SELECT relname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes WHERE idx_scan = 0 ORDER BY pg_relation_size(indexrelid) DESC;

-- Tabel-bloat check
SELECT relname, n_live_tup, n_dead_tup,
       round(100.0*n_dead_tup/NULLIF(n_live_tup+n_dead_tup,0),2) AS dead_pct
FROM pg_stat_user_tables ORDER BY dead_pct DESC LIMIT 10;

-- Diagnose van één query
EXPLAIN (ANALYZE, BUFFERS) <query>;
```

### 10.2 Samenvattend stroomschema: welk tool voor welke vraag?

| Jouw vraag | Tool |
|---|---|
| "Welke queries kosten globaal het meest?" | `pg_stat_statements` |
| "Waarom is déze query traag?" | `EXPLAIN (ANALYZE, BUFFERS)` |
| "Wat gebeurt er nu, hangt er iets vast?" | `pg_stat_activity` + `pg_locks` |
| "Is mijn tabel/index verwaarloosd?" | `pg_stat_user_tables` / `pg_stat_user_indexes` |
| "Is de bottleneck I/O-gerelateerd?" | `pg_stat_io` (v16+) + `EXPLAIN BUFFERS` |
| "Genereert mijn ORM te veel/verkeerde queries?" | `echo=True` + `pg_stat_statements` (`calls`) |
| "Zou een nieuwe index helpen, zonder ze te bouwen?" | `hypopg` |
| "Wat gebeurde er historisch, buiten realtime?" | `auto_explain` + `pgBadger`-loganalyse |

### 10.3 Belangrijkste inzichten van dit document

1. Analyseer **proactief** (`pg_stat_statements`) vóór **reactief** (`EXPLAIN` op één query).
2. `EXPLAIN ANALYZE` toont de **waarheid**; `EXPLAIN` alleen toont een **schatting**.
3. Een groot verschil tussen geschat en effectief aantal rijen = verouderde statistieken → `ANALYZE`.
4. Niet elk performanceprobleem is een ontbrekende index — check ook `work_mem`, bloat, locks en de planner-kostenlogica zelf.
5. In een ORM-context is het probleem zelden de individuele query, maar bijna altijd **hoe vaak** en **op welke manier** ze wordt aangeroepen (N+1, ontbrekende eager loading, verkeerd gedimensioneerde connection pool).
6. De planner is kosten-gebaseerd: "de beste index" hangt af van dataverdeling en -volume, niet van een vaste regel.
