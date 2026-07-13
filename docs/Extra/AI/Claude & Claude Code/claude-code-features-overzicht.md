# Claude (Code) — volledige feature-gids voor software engineers

Jouw situatie: **Claude Pro**, gebruik via **CLI, VS Code-extensie, Desktop app en de website**, stack **Python / FastAPI / Docker / PostgreSQL / Redis**, en je gebruikt daarnaast **GitHub + GitHub Copilot**.

## Leeswijzer

Voor elke belangrijke feature krijg je steeds dezelfde structuur, zodat je snel kan scannen:

| Onderdeel | Betekenis |
|---|---|
| **Wat het doet** | Korte functionele omschrijving |
| **Waarvoor** | Het probleem dat het oplost |
| **Hoe gebruiken** | Concreet commando/stappen |
| **Let op** | Valkuilen, beperkingen |
| **Wanneer best** | Het juiste moment/context |
| **Best practices** | Hoe je het optimaal inzet |
| **Voor jouw stack** | Toepassing op FastAPI/Postgres/Docker/Redis |
| **Usage-tip** | Hoe dit je Pro-limiet beïnvloedt en hoe je bespaart |

Minder kritieke features krijgen een compactere tabelvorm, zodat het document leesbaar blijft.

---

## 0. Snel overzicht — welke feature wanneer?

| Feature | Type | Interface | Prioriteit voor jou |
|---|---|---|---|
| Security-guidance plugin | Gratis laag + normale usage | Alle | ⭐⭐⭐ Direct installeren |
| `/security-review` | Inbegrepen (normale usage) | Alle | ⭐⭐⭐ Voor elke security-gevoelige commit |
| `/code-review` (lokaal) | Inbegrepen | CLI/VS Code | ⭐⭐⭐ Voor elke PR |
| MCP-servers (Postgres/Redis) | Inbegrepen | Alle | ⭐⭐⭐ Kernstuk van je workflow |
| Hooks | Inbegrepen | Alle | ⭐⭐⭐ Automatisering + tokens besparen |
| Skills | Inbegrepen | Alle | ⭐⭐⭐ Herbruikbare kennis, tokens besparen |
| Subagents | Inbegrepen | Alle | ⭐⭐⭐ Parallel werk, context isoleren |
| CLAUDE.md / auto memory | Inbegrepen | Alle | ⭐⭐⭐ Fundament, direct instellen |
| Worktrees | Inbegrepen | CLI | ⭐⭐ Parallelle branches |
| Sandboxing | Inbegrepen | Alle | ⭐⭐ Veilig experimenteren |
| Ultrareview | 3x gratis, dan extra usage | Alle | ⭐⭐ Voor grote/riskante merges |
| Agent Teams | Inbegrepen (experimenteel) | CLI | ⭐ Voor complex parallel onderzoek |
| Ultraplan | Inbegrepen | Web/CLI | ⭐ Voor grote features vooraf plannen |
| GitHub Actions | Inbegrepen | GitHub | ⭐⭐ CI-automatisering |
| Chrome-extensie | Inbegrepen | Desktop/CLI | ⭐⭐ Testen van je webapps (Pavone/WooCommerce) |
| Code Review (GitHub App) | Extra usage | — | ✗ Niet beschikbaar op Pro (Team/Enterprise) |
| Artifacts, Analytics, SSO | — | — | ✗ Niet beschikbaar op Pro (Team/Enterprise) |

---

## 1. Eerst dit: hoe je het meeste uit je Pro-abonnement haalt

Dit is waarschijnlijk het belangrijkste onderdeel van dit document, want het bepaalt hoeveel je met je vaste maandprijs kan doen voordat je tegen limieten of usage credits aanloopt.

### Hoe je limiet werkt

Op Pro reset je sessielimiet **elke 5 uur**, en er is daarnaast een **wekelijkse limiet**. Beide worden gedeeld tussen Claude.ai-chats én Claude Code (CLI, VS Code, Desktop, web — alles telt mee op hetzelfde budget). Praktisch gevolg: plan zware taken (grote refactors, Ultrareview-runs) bewust binnen een 5-uursblok, en verspil dat blok niet aan verkennende, vage vragen.

Check je verbruik met:
```
/usage
```
Dit toont een breakdown per skill, subagent, plugin en MCP-server — heel nuttig om te zien wát je budget precies opeet.

### Prompt caching — de onzichtbare hefboom

Claude Code cachet automatisch herhaalde context (systeemprompt, CLAUDE.md, tool-definities), wat herhaalde kosten drukt. Maar bepaalde acties **breken die cache** en maken de volgende beurt duurder:

| Breekt de cache (duurder) | Behoudt de cache (goedkoop) |
|---|---|
| Model wisselen (`/model`) | Bestanden in je repo bewerken |
| Effort-niveau wijzigen | CLAUDE.md tussentijds bewerken |
| Fast mode aan/uit zetten | Output style wijzigen |
| MCP-server (dis)connecteren | Permission mode wijzigen |
| Plugin in-/uitschakelen | Skills en commands aanroepen |
| Een volledige tool weigeren | `/recap` draaien |
| Conversatie compacten | Terugspoelen (`/rewind`) |
| Claude Code updaten | — |

**Praktisch:** wissel niet nodeloos van model of MCP-servers halverwege een sessie als je aan het itereren bent — begin liever een nieuwe sessie met de juiste configuratie vanaf het begin.

### De vijf grootste besparingen (op volgorde van impact)

1. **Houd `CLAUDE.md` onder de 200 regels.** Dit bestand wordt bij élke beurt in context geladen, zelfs als je maar 2 berichten stuurt. Zet gedetailleerde workflow-instructies (bv. "hoe voer je een DB-migratie uit") in een **skill** in plaats van in CLAUDE.md — skills laden alleen on-demand.
2. **`/clear` tussen ongerelateerde taken.** Oude context sleep je anders onnodig mee in elke volgende beurt. Gebruik `/rename` ervoor als je de sessie later nog wil terugvinden, dan `/resume`.
3. **Kies bewust je model.** Sonnet is voor het gros van je FastAPI/PostgreSQL-werk sterk genoeg en goedkoper dan Opus. Bewaar Opus voor architecturale beslissingen. Voor subagents kan je expliciet `model: haiku` instellen voor eenvoudige taken (bv. testresultaten samenvatten).
4. **MCP-overhead beperken.** Tool-definities van MCP-servers worden standaard pas in context geladen wanneer Claude ze effectief gebruikt (deferred), maar draai `/context` om te zien wat er precies ruimte inneemt. Schakel MCP-servers die je niet actief gebruikt uit via `/mcp`. Voor dingen als GitHub gebruik je trouwens beter de `gh` CLI rechtstreeks (die je toch al gebruikt) — dat is nog efficiënter dan een MCP-server, want die voegt geen enkele tool-listing toe aan de context.
5. **Laat hooks en skills het zware werk voorfilteren.** In plaats van dat Claude een volledig logbestand van 10.000 regels leest, laat een hook enkel de `ERROR`-regels doorsturen. Voorbeeld verderop in de stack-playbook (§6).

### Extra gewoontes die schelen

- **Plan mode** (`Shift+Tab` tweemaal) vóór je een complexe taak laat uitvoeren: Claude verkent en stelt een plan voor, jij keurt goed — dat voorkomt dure heruitvoering als de eerste richting fout zat.
- **`/rewind`** (of dubbel Escape) om terug te spoelen naar een checkpoint in plaats van een hele nieuwe sessie te starten na een misser.
- **Wees specifiek.** "Verbeter deze codebase" triggert brede, dure scanning. "Voeg inputvalidatie toe aan de login-functie in `auth.py`" laat Claude gericht werken.
- **Delegeer verbose output naar subagents.** Testresultaten of documentatie ophalen kan veel context opeten — een subagent absorbeert dat in zijn eigen venster en geeft jou enkel een samenvatting terug.
- **Achtergrondverbruik bestaat**: sessie-samenvattingen voor `--resume` en statuscommando's verbruiken een klein beetje tokens (doorgaans onder $0,04 per sessie), ook zonder dat jij actief typt. Geen actie nodig, maar verklaart kleine afwijkingen.

---

## 2. De "review"-verwarring opgelost

Er bestaan **zes** verschillende manieren om Claude naar je code te laten kijken, en ze lijken op elkaar. Hier het overzicht:

| Feature | Waar draait het | Focus | Diepte | Kost | Beschikbaar op Pro? |
|---|---|---|---|---|---|
| **Security-guidance plugin** | Lokaal, tijdens het schrijven | Security | Patroonmatch + 2 model-lagen | Grotendeels gratis, model-lagen tellen mee in normale usage | ✅ Ja |
| **`/security-review`** | Lokaal, op jouw commando | **Enkel security** | Eén grondige doorgang van je huidige diff, met confidence-scoring per bevinding | Normale usage | ✅ Ja |
| **`/review`** | Lokaal in je sessie | Algemeen | Eén doorgang | Normale usage | ✅ Ja |
| **`/code-review`** | Lokaal in je sessie | Correctheid + opschonen | Eén doorgang | Normale usage | ✅ Ja |
| **`/ultrareview`** | Cloud sandbox | Algemeen (bugs) | Vloot agents, onafhankelijk geverifieerd | 3x gratis, dan $5–20/run | ✅ Ja |
| **Code Review (GitHub App)** | Anthropic-infrastructuur, bij elke PR | Correctheid + security | Vloot agents, volledige codebase-context | $15–25/review, altijd extra usage | ❌ Enkel Team/Enterprise |

**Vuistregel voor jou:** laat de security-guidance plugin continu op de achtergrond meedraaien (grotendeels gratis), draai **`/security-review`** vlak vóór je een significante wijziging commit (dit is waarschijnlijk het commando dat je je herinnerde — zie de dieptebespreking hieronder), gebruik `/code-review --fix` vlak voor je pusht voor de algemene correctheidscheck, en reserveer `/ultrareview` voor grote, risicovolle merges (bv. een betaalflow of migratiescript voor Pavone) waar je écht een tweede, onafhankelijke blik wil.

---

## 3. Extra usage features (dieptebespreking)

### Security-guidance plugin

| | |
|---|---|
| **Wat het doet** | Controleert Claude's eigen codewijzigingen continu op kwetsbaarheden en lost ze meteen op in dezelfde sessie |
| **Waarvoor** | Injection, unsafe deserialisatie, onveilige DOM-APIs, workflow-permissies vroeg opvangen — vóór het een PR bereikt |
| **Wanneer best** | Altijd aan laten staan als achtergrondlaag; dit is geen los te draaien commando maar een continue bewaker |
| **Let op** | Blokkeert niets — bevindingen zijn instructies aan Claude, geen harde stop. Zie het als één laag in een verdediging-in-diepte, niet als vervanging van CI-scanners |

**Hoe gebruiken:**
```
/plugin install security-guidance@claude-plugins-official
/reload-plugins
```

**Drie lagen:**

| Laag | Trigger | Model nodig? | Kost |
|---|---|---|---|
| Per-edit patroonmatch | Elke file-edit | Nee | Gratis |
| End-of-turn review | Na elke beurt | Ja (Opus, default) | Normale usage |
| Commit/push review | Bij `git commit`/`git push` | Ja, agentisch, dieper | Normale usage, kan meerdere turns kosten |

**Best practices:**
- Voeg een `.claude/claude-security-guidance.md` toe met je eigen threat model (zie stack-playbook §6 voor een FastAPI-voorbeeld).
- Voeg `.claude/security-patterns.yaml` toe voor deterministische regex/substring-checks specifiek voor jouw codebase (bv. het detecteren van rauwe SQL-string-concatenatie).
- Zet `SECURITY_REVIEW_MODEL=sonnet` als Opus je te veel usage kost en je genoegen neemt met een iets minder grondige maar goedkopere review.
- Combineer met `.github/workflows/` CI-scanners (bv. Bandit voor Python, Trivy voor je Docker-images) — de plugin vervangt die niet.

**Voor jouw stack:** perfect om standaard SQL-injectie-patronen (rauwe string-formatting in queries), onveilige `subprocess`/`os.system`-aanroepen, en hardcoded secrets in je FastAPI-projecten en scripts te vangen vóór ze in een commit belanden.

**Usage-tip:** de per-edit laag is gratis, dus die kost je niets. Als je usage krap wordt, schakel je enkel de duurdere agentische commit-review uit (`ENABLE_COMMIT_REVIEW=0`) en behoud je de end-of-turn laag.

### `/security-review` — het losse commando

Dit is waarschijnlijk de feature die je je eerder herinnerde maar die ik nog niet apart had uitgewerkt. Het is **geen extra usage-feature** (het draait gewoon tegen je normale usage, zoals `/review` of `/code-review`), maar het hoort thematisch bij de security-bespreking hierboven, dus ik behandel het hier.

| | |
|---|---|
| **Wat het doet** | Een ingebouwd slash-commando dat op jouw vraag een **grondige, security-specifieke** analyse maakt van al je openstaande (nog niet gecommitte) wijzigingen |
| **Waarvoor** | Eén gerichte, ad-hoc veiligheidscontrole draaien vlak voordat je commit — een bewuste "laatste check", in plaats van de continue achtergrondbewaking van de security-guidance plugin |
| **Hoe gebruiken** | Typ gewoon `/security-review` in een sessie. Claude doorzoekt je huidige diff en rapporteert bevindingen met uitleg, ernst-inschatting en concrete fix-suggesties |
| **Let op** | Puur **leesgericht**: het commando voert zelf geen bash-commando's uit en schrijft geen bestanden — het redeneert enkel over de code om te bepalen of iets echt exploiteerbaar is, in plaats van het te reproduceren. Het is dus geen vervanging voor het testen van een fix, enkel voor het vínden ervan |
| **Wanneer best** | Vlak vóór je commit of pusht, specifiek bij security-gevoelige wijzigingen: authenticatie, betaallogica, bestandsuploads, admin-routes, alles wat met gebruikersinput of tenant-scheiding te maken heeft |
| **Best practices** | Kopieer het onderliggende `security-review.md`-commandobestand naar `.claude/commands/` in je project om het te personaliseren — je kan dan bv. ernstdrempels aanpassen, bepaalde bestandspatronen uitsluiten, of de scope vernauwen tot enkel je auth-module. Het commando is bewust streng gefilterd op signaalkwaliteit (elke bevinding krijgt een confidence-score en een resem "harde uitsluitingen" zoals DoS-kwetsbaarheden en documentatiebestanden worden standaard genegeerd) — dat betekent minder ruis, maar ook dat het geen brede compliance-scan is |
| **Voor jouw stack** | Draai dit specifiek na wijzigingen aan je FastAPI-authenticatie/autorisatie, aan Alembic-migraties die kolommen met persoonsgegevens raken, of aan endpoints die met WooCommerce-webhooks/betalingen praten bij Pavone |
| **Usage-tip** | Eén doorgang, geen achtergrondlagen — dus voorspelbaarder qua kost dan de continue security-guidance plugin. Combineer ze: laat de plugin dagelijks meedraaien voor snelle feedback, en draai `/security-review` als bewuste, iets grondigere eindcontrole vóór een commit met echte impact |

**Let op — naamconflict met plugins:** als je later een plugin of skill installeert die zelf ook een component genaamd `security-review` bevat (sommige community-security-skills doen dit), dan kan die skill voorrang krijgen op dit ingebouwde commando wanneer je `/security-review` typt. Controleer met `/commands` of `/skills` welke versie je precies aanroept als je twijfelt, zeker na het installeren van een nieuwe security-plugin.

**Verschil met de security-guidance plugin, kort:** de plugin is een **continue, gelaagde bewaker** die tijdens het schrijven meekijkt en zelf fixes voorstelt binnen dezelfde sessie; `/security-review` is een **eenmalige, grondige, security-only scan** van je huidige diff die je bewust op een zelfgekozen moment aanroept. Ze vullen elkaar aan — de plugin vangt de meeste dingen vroeg, `/security-review` is je bewuste laatste check.

### Ultrareview (`/ultrareview`)

| | |
|---|---|
| **Wat het doet** | Lanceert een vloot reviewer-agents in een remote cloud-sandbox die je branch/PR doorlichten, met onafhankelijke verificatie van elke bevinding |
| **Waarvoor** | Een grondige, ruisarme eindcontrole vlak vóór een merge van een substantiële wijziging |
| **Hoe gebruiken** | `/ultrareview` (huidige branch vs. default branch) of `/ultrareview 1234` (specifieke PR) |
| **Let op** | Vereist inloggen met je Claude.ai-account; niet beschikbaar via Bedrock/Vertex/Foundry; draait 5–10 minuten op de achtergrond |
| **Wanneer best** | Vóór het mergen van iets met echte impact: een betaalflow, een databasemigratie, een auth-wijziging — niet voor elke kleine PR |
| **Best practices** | Gebruik `/tasks` om de run te volgen zonder je terminal te blokkeren; combineer met `/code-review ultra --fix` om bevindingen automatisch te laten toepassen |
| **Voor jouw stack** | Zet dit in vóór je een Pavone-release doet die WooCommerce-betalingen of klantdata raakt |
| **Usage-tip** | Je hebt 3 gratis runs (eenmalig, vervalt niet). Gebruik ze bewust op je meest risicovolle wijzigingen, niet op routinematige PR's — daarna kost elke run $5–20 aan usage credits |

### Code Review (GitHub App) — niet beschikbaar op jouw plan

| | |
|---|---|
| **Wat het doet** | Automatische, multi-agent review op élke pull request in GitHub, met inline comments |
| **Waarom niet voor jou** | Enkel beschikbaar op Team- en Enterprise-abonnementen, niet op Pro |
| **Alternatief** | `/code-review` lokaal (gratis, inbegrepen) of `/ultrareview` (3x gratis) geven je vergelijkbare waarde zonder een Team-seat nodig te hebben |

### 1M-token contextvenster

| | |
|---|---|
| **Wat het doet** | Verhoogt het contextvenster van Sonnet naar 1 miljoen tokens |
| **Waarvoor** | Enorme codebases in één keer laten doorzoeken zonder compactie |
| **Let op** | Vereist expliciet ingeschakelde usage credits — zonder credits krijg je de foutmelding "Usage credits required for 1M context" |
| **Wanneer best** | Zelden nodig voor je huidige projectgroottes; relevant als je ooit een groot monorepo-achtig project analyseert in één sessie |
| **Usage-tip** | Voor de meeste van je projecten (Pavone, WeerWijs-achtige projecten) is dit overkill — gerichte file-inclusie en goede CLAUDE.md-structuur lossen hetzelfde probleem goedkoper op |

---

## 4. Inbegrepen features — dieptebespreking

### CLAUDE.md & auto memory

| | |
|---|---|
| **Wat het doet** | `CLAUDE.md` is een bestand met projectinstructies dat automatisch bij elke sessie geladen wordt; auto memory legt automatisch relevante feiten uit je sessies vast |
| **Waarvoor** | Voorkomt dat je elke sessie opnieuw moet uitleggen hoe je project in elkaar zit, welke package manager je gebruikt, testconventies, enz. |
| **Hoe gebruiken** | Plaats `CLAUDE.md` in de root van je project; gebruik `/memory` om het te bekijken/bewerken; gelaagd per directory mogelijk voor grotere monorepo's |
| **Let op** | Dit bestand blijft **de hele sessie** in context, ongeacht hoeveel berichten je stuurt — een bestand van 5.000 tokens kost dus 5.000 tokens op élke beurt |
| **Wanneer best** | Vanaf dag één van elk project instellen |
| **Best practices** | Houd het onder de 200 regels; documenteer beslissingen en conventies, geen aspiraties; verplaats gedetailleerde workflows (migraties, releaseproces) naar skills |
| **Voor jouw stack** | Zie het concrete voorbeeld in §6 — vermeld je package manager (poetry/uv/pip), Alembic-migratieconventies, Docker Compose-commando's, testrunner (`pytest`) |
| **Usage-tip** | Dit is dé belangrijkste hefboom voor kostenbesparing over al je sessies heen — één keer goed instellen bespaart honderden tot duizenden tokens per sessie, elke sessie opnieuw |

### Skills

| | |
|---|---|
| **Wat het doet** | Herbruikbare "playbooks" met domeinkennis die Claude enkel laadt wanneer ze effectief nodig zijn (on-demand, niet bij sessiestart) |
| **Waarvoor** | Gespecialiseerde workflows (bv. "hoe voer je een DB-migratie uit", "hoe zet je een nieuwe FastAPI-router op") uit je altijd-geladen CLAUDE.md houden |
| **Hoe gebruiken** | Maak een map met een `SKILL.md`-bestand aan; Claude ontdekt en activeert ze automatisch op basis van de beschrijving |
| **Let op** | Een te vage beschrijving triggert de skill niet op het juiste moment — wees net zo specifiek als je zou zijn bij het schrijven van een tool-beschrijving |
| **Wanneer best** | Voor elke workflow die je vaker dan een paar keer per maand herhaalt en die te gedetailleerd is voor CLAUDE.md |
| **Best practices** | Eén skill = één duidelijk afgebakende taak; test met `skill-creator` of de skill correct triggert; deel skills tussen projecten via een plugin |
| **Voor jouw stack** | Een `fastapi-router-skill` (hoe je een nieuwe endpoint + Pydantic-schema + test opzet volgens jouw conventies), een `alembic-migration-skill`, een `docker-compose-debug-skill` |
| **Usage-tip** | Community-benchmarks tonen 15.000+ tokens per sessie bespaard door workflow-kennis in skills te steken in plaats van alles vooraf in CLAUDE.md te proppen — controleer dit zelf via `/usage` voor- en na |

### Hooks

| | |
|---|---|
| **Wat het doet** | Laat je eigen scripts draaien op specifieke momenten in Claude's werk-loop (na een edit, vóór een commit, bij sessiestart, enz.) |
| **Waarvoor** | Automatisering (auto-formatteren, beschermde bestanden blokkeren) én **contextfiltering** om tokens te besparen |
| **Hoe gebruiken** | Configureer in `settings.json` onder `hooks`, gematcht op tool en event (`PreToolUse`, `PostToolUse`, `Stop`, enz.) |
| **Let op** | Hooks draaien met jouw rechten — behandel ze met dezelfde voorzichtigheid als een CI-script; test lokaal voor je ze op een gedeeld project zet |
| **Wanneer best** | Zodra je een repetitieve nabewerking (linten, testoutput filteren, secrets scannen) meer dan één keer met de hand doet |
| **Best practices** | Begin met één hook per probleem; gebruik `PreToolUse` op `Bash` om testoutput te filteren vóór het in context komt (voorbeeld in §6); de security-guidance plugin zelf is volledig op hooks gebouwd — een goed referentievoorbeeld |
| **Voor jouw stack** | Filter `pytest`/`docker compose logs`-output tot enkel `FAIL`/`ERROR`-regels; blokkeer edits aan `.env`-bestanden of migratiebestanden die al gemerged zijn |
| **Usage-tip** | Dit is een van de krachtigste besparingen: een hook die een log van 10.000 regels terugbrengt tot 100 relevante regels bespaart tienduizenden tokens per beurt |

### Subagents

| | |
|---|---|
| **Wat het doet** | Gespecialiseerde "hulp-agents" binnen dezelfde sessie, elk met een eigen contextvenster, die resultaten terugrapporteren naar de hoofdsessie |
| **Waarvoor** | Onderzoekstaken isoleren (bv. "doorzoek de codebase naar alle plekken die Redis gebruiken") zonder je hoofdgesprek vol te proppen met tussentijdse zoekresultaten |
| **Hoe gebruiken** | Definieer een subagent-bestand (project-, user- of plugin-scope) of laat Claude er automatisch een spawnen voor een taak |
| **Let op** | Subagents erven de conversatiegeschiedenis **niet** — geef ze expliciet de context die ze nodig hebben in de spawn-prompt |
| **Wanneer best** | Voor verbose operaties: tests draaien, logs doorzoeken, documentatie ophalen, of een geïsoleerde "database query validator"-rol |
| **Best practices** | Stel `model: haiku` in voor eenvoudige subagent-taken om kosten te drukken; gebruik ze voor onderzoek vóór je een plan maakt |
| **Voor jouw stack** | Een `db-query-validator`-subagent die elke door Claude voorgestelde SQL-query tegen je Postgres-schema valideert vóór uitvoering; een `docker-log-analyzer`-subagent |
| **Usage-tip** | Verreweg de goedkoopste manier om parallel/verkennend werk te doen — veel goedkoper dan Agent Teams, omdat enkel een samenvatting terugkeert naar je hoofdcontext |

### Agent Teams *(experimenteel)*

| | |
|---|---|
| **Wat het doet** | Meerdere **volwaardige, onafhankelijke** Claude Code-instanties die rechtstreeks met elkaar communiceren via een gedeelde takenlijst, met een "lead"-sessie die coördineert |
| **Waarvoor** | Taken waar parallel onderzoek écht waarde toevoegt: concurrerende hypotheses testen bij een lastige bug, of een feature opsplitsen in frontend/backend/tests die elk een eigen teamlid krijgen |
| **Hoe gebruiken** | Zet eerst `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in je `settings.json`, beschrijf dan in gewone taal welke rollen je wil spawnen |
| **Let op** | Verbruikt **~7x meer tokens** dan een gewone sessie wanneer teamleden in plan mode draaien — geen lichte beslissing op een Pro-limiet |
| **Wanneer best** | Zeldzaam gebruik: complexe debugging met meerdere plausibele oorzaken, of een grote parallelle codereview met verschillende invalshoeken (security/performance/tests) |
| **Best practices** | Start met 3–5 teamleden max; gebruik Sonnet voor teamleden (niet Opus); houd spawn-prompts kort maar volledig; sluit teamleden expliciet af zodra hun taak klaar is |
| **Voor jouw stack** | Minder relevant voor je dagelijkse solo-freelancewerk; wel bruikbaar bij een grote architectuurbeslissing (bv. "onderzoek 3 opties voor Pavone's caching-laag: Redis, in-memory, of een CDN-laag — één teamlid per optie") |
| **Usage-tip** | Op een Pro-plan is dit een dure feature — reserveer het voor de paar keer per maand dat de parallelle discussie echt sneller tot een beter antwoord leidt dan jij zelf drie keer na elkaar vragen |

### Worktrees

| | |
|---|---|
| **Wat het doet** | Start Claude Code in een aparte git worktree, zodat meerdere sessies parallel op verschillende branches werken zonder elkaars bestanden te overschrijven |
| **Waarvoor** | Tegelijk aan een hotfix én een feature werken zonder voortdurend te moeten stashen/wisselen van branch |
| **Hoe gebruiken** | Claude Code beheert de worktree-aanmaak voor je; zie `/en/worktrees` voor manueel beheer |
| **Let op** | Gitignored bestanden (bv. `.env`, `venv/`) worden niet automatisch meegekopieerd — daar moet je zelf voor zorgen |
| **Wanneer best** | Bij het combineren van een dringende klantenfix (bv. Pavone) met langlopend feature-werk in hetzelfde project |
| **Best practices** | Ruim worktrees op zodra de branch gemerged is; combineer met subagents die elk hun eigen worktree krijgen voor geïsoleerde parallelle taken |
| **Voor jouw stack** | Handig wanneer je tegelijk een Docker Compose-stack op een feature-branch draait en een hotfix op main test — elk in zijn eigen worktree/container-omgeving |
| **Usage-tip** | Geen directe kostenimpact, maar voorkomt dure "verkeerde branch"-fouten die tot heruitvoering leiden |

### MCP-servers

| | |
|---|---|
| **Wat het doet** | Verbindt Claude Code met externe tools, databanken en API's via het open Model Context Protocol |
| **Waarvoor** | Claude rechtstreeks tegen je PostgreSQL-databank, Redis-instantie, GitHub, of monitoringtools laten werken in plaats van dat jij data moet copy-pasten |
| **Hoe gebruiken** | `claude mcp add <naam> -- <commando>` of een `.mcp.json` in je project; bekijk verbonden servers met `/mcp` |
| **Let op** | **Belangrijk voor jou specifiek**: de officiële `@modelcontextprotocol/server-postgres` is **gedeprecateerd en heeft een bekende SQL-injectiekwetsbaarheid**. Gebruik in plaats daarvan een actief onderhouden alternatief (bv. Postgres MCP Pro / `mcp-server-pg`) en verbind altijd met een **read-only databankrol**, nooit met je superuser-credentials |
| **Wanneer best** | Zodra je jezelf betrapt op het kopiëren van query-resultaten, logs, of ticketinhoud in de chat |
| **Best practices** | Gebruik een dedicated `claude_readonly`-databankrol met enkel `SELECT`-rechten op de schema's die je nodig hebt; schakel servers die je niet gebruikt uit (`/mcp`) om contextoverhead te vermijden; verkies CLI-tools (`gh`, `docker`) boven een MCP-server wanneer beide bestaan, want die voegen geen tool-listing toe aan je context |
| **Voor jouw stack** | Verbind een read-only Postgres-MCP-server voor schema-inspectie en query-hulp bij je PostgreSQL-verdieping (JSONB, indexering); voor Redis is er geen officiële Anthropic-server, maar community MCP-servers voor Redis bestaan — controleer onderhoudsstatus voor je die vertrouwt met productiedata |
| **Usage-tip** | Tool-definities laden pas volledig in context als Claude de tool effectief gebruikt (deferred loading) — dus véél verbonden servers is minder erg dan je zou denken, maar overbodige servers uitschakelen blijft de context opruimen |

### Plugins & marketplaces

| | |
|---|---|
| **Wat het doet** | Bundelt skills, agents, hooks en MCP-servers in één installeerbaar pakket, gedistribueerd via een marketplace (officieel of je eigen GitHub-repo) |
| **Waarvoor** | Herbruikbaarheid tussen projecten en klanten, en om tooling makkelijk te delen als je ooit met andere developers samenwerkt |
| **Hoe gebruiken** | `/plugin install <naam>@<marketplace>`; eigen marketplace hosten via een GitHub-repo met een marketplace-manifest |
| **Let op** | Vertrouw enkel marketplaces waarvan je de bron kent — een plugin heeft dezelfde rechten als een hook |
| **Wanneer best** | Zodra je een set skills/hooks/MCP-configuratie voor de derde keer naar een nieuw project kopieert |
| **Best practices** | Begin met de officiële marketplace (`security-guidance`, code intelligence plugins); bouw pas een eigen marketplace als je client-overstijgende conventies hebt die het waard zijn om te herbruiken |
| **Voor jouw stack** | Bouw op termijn een eigen "kmo-webstack"-plugin met je standaard FastAPI/Docker/PostgreSQL-conventies, herbruikbaar over al je klantenprojecten heen |

### Permission modes & Auto mode

| | |
|---|---|
| **Wat het doet** | Bepaalt hoeveel autonomie Claude krijgt: van "vraag toestemming voor alles" tot volledig autonoom binnen veilige grenzen |
| **Modi** | `plan` (enkel lezen/voorstellen), standaard (vraagt per actie), `acceptEdits` (edits automatisch goedgekeurd), `dontAsk` (enkel vooraf goedgekeurde tools), `bypassPermissions` (alles toegestaan), `auto` (classifier beslist wat veilig genoeg is) |
| **Let op** | `bypassPermissions` is krachtig maar riskant — gebruik dit nooit op een repo met productie-secrets zonder sandboxing erbovenop |
| **Wanneer best** | `plan` voor complexe/riskante taken, `acceptEdits` voor routinematige refactors waar je toch alles reviewt via git diff, `auto` als je een goed ingesteld classifier-beleid hebt |
| **Best practices** | Combineer `auto mode` met expliciete "trusted infrastructure"-regels in je settings zodat routineuze Docker/pytest-commando's niet steeds om toestemming vragen |
| **Voor jouw stack** | Sta `docker compose`, `pytest`, en `alembic upgrade` toe in een read-only/staging-context via permission rules, maar hou productie-gerelateerde commando's (`docker compose -f prod.yml`) achter een expliciete bevestiging |

### Sandboxing

| | |
|---|---|
| **Wat het doet** | Draait Bash-commando's en file-operaties in een geïsoleerde sandbox met filesystem- en netwerkisolatie |
| **Waarvoor** | Claude experimenteel laten werken (bv. dependencies installeren, scripts testen) zonder risico voor de rest van je systeem |
| **Hoe gebruiken** | Configureerbaar via settings; ook beschikbaar via dev containers of een eigen custom container |
| **Let op** | Sandboxing is een aanvulling op, geen vervanging van, permission modes — beide werken samen |
| **Wanneer best** | Bij het testen van onbekende packages, het uitvoeren van scripts van een klant, of wanneer je `auto mode` gebruikt en extra zekerheid wil |
| **Voor jouw stack** | Sluit goed aan bij je UFW/firewall-gevoel: combineer sandboxing met je bestaande Docker-gebaseerde ontwikkelomgevingen voor een extra isolatielaag |

### Checkpoints / rewind

| | |
|---|---|
| **Wat het doet** | Automatische snapshots tijdens een sessie waarmee je bestandswijzigingen kan terugdraaien zonder naar git te grijpen |
| **Hoe gebruiken** | `/rewind` of dubbel Escape |
| **Let op** | Bash-commando's (bv. een `DROP TABLE` die Claude via een shell-commando uitvoerde) worden **niet** getrackt — dit is geen vervanging voor version control of databank-backups |
| **Wanneer best** | Direct na een misser, in plaats van een hele nieuwe sessie te starten |
| **Usage-tip** | Vroeg terugspoelen na een verkeerde richting is veel goedkoper dan Claude laten doorwerken op een fout uitgangspunt |

### Plan mode, effort levels & extended thinking

| | |
|---|---|
| **Wat het doet** | Plan mode scheidt verkennen/plannen van uitvoeren; effort levels bepalen hoeveel "denktijd" (en dus outputtokens) een taak krijgt |
| **Hoe gebruiken** | `Shift+Tab` tweemaal voor plan mode; `/effort` om het niveau te wijzigen; extended thinking staat standaard aan |
| **Let op** | Denktokens worden als **output**tokens gefactureerd — voor eenvoudige taken kan een hoog effort-niveau onnodig duur zijn |
| **Best practices** | Hoog effort voor architecturale beslissingen en debugging van lastige bugs; laag effort voor routineuze CRUD-endpoints of kleine fixes |
| **Voor jouw stack** | Zet effort hoog bij het ontwerpen van je Patroni/pg_auto_failover-architectuur; laag bij het toevoegen van een simpele nieuwe FastAPI-route |

### Vergelijking: parallelisatie-opties

| | Subagents | Agent Teams | Worktrees |
|---|---|---|---|
| **Communicatie** | Enkel terug naar hoofdsessie | Rechtstreeks tussen agents | Geen — jij coördineert manueel |
| **Kost** | Laag | Hoog (~7x) | Neutraal (jouw eigen sessies) |
| **Setup** | Automatisch of gedefinieerd | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` | Ingebouwd git-commando |
| **Beste voor** | Onderzoek, verbose taken isoleren | Debatteren over concurrerende hypotheses | Parallel werken op losse branches |

---

## 5. Inbegrepen features — overzichtstabel (interfaces & extra's)

### Interfaces (jij gebruikt momenteel alle vier)

| Interface | Sterk in | Aandachtspunt |
|---|---|---|
| **CLI** | Snelheid, scripting, headless/non-interactive gebruik in build-scripts | Geen visuele diff-viewer; leun op `git diff` |
| **VS Code-extensie** | Geïntegreerde diffs, bestanden direct openen, contextmenu's | Los van CLI-sessies — check `/resume` om over te schakelen |
| **Desktop app** | Computer use, preview-servers, parallelle sessies in tabs, browsen op externe sites | Zwaarder qua lokale resources bij veel parallelle sessies |
| **Website (Claude Code on the web)** | Cloud-sessies, mobiel bereikbaar, geen lokale setup nodig | Netwerktoegang is beperkt/gecontroleerd — niet alles wat lokaal werkt, werkt hier |

**Tip:** gebruik `--teleport` om een cloud-sessie (web) naar je lokale terminal over te zetten en verder te werken met volledige toegang tot je lokale Docker-omgeving.

### Automatisering & CI

| Feature | Wat | Wanneer |
|---|---|---|
| **GitHub Actions / GitLab CI/CD** | Laat Claude reageren op `@claude`-mentions in issues/PR's, binnen jouw eigen pipeline | Voor geautomatiseerde PR-hulp op Pavone-gerelateerde repo's |
| **`/loop`** | Herhaal een prompt op een interval (bv. elke 2 uur) | Terugkerende checks (bv. "controleer of alle DMARC-rapporten normaal binnenkomen") |
| **Routines (`/schedule`)** | Geplande of trigger-gebaseerde runs (schedule, API-call, GitHub-event) | Periodieke onderhoudstaken zonder dat je zelf een sessie moet openen |
| **Workflows** | Claude schrijft en bewaart een herbruikbaar script voor een repetitieve taak | "Doorloop elk bestand en pas dezelfde fix toe" |

### Model-gerelateerde extra's

| Feature | Wat | Kost |
|---|---|---|
| **Advisor tool** *(experimenteel)* | Koppelt je hoofdmodel aan een sterker adviesmodel op cruciale beslismomenten (bv. Sonnet + Opus-advisor) | Telt tegen je normale usage, geen aparte factuur |
| **Fast mode** | Snellere antwoorden tegen een ander kostenprofiel | Afweging snelheid vs. verbruik, per sessie te kiezen |
| **Automatic model fallback** | Valt automatisch terug op een ander model bij overbelasting | Voorkomt onderbrekingen, geen extra kost |
| **Ultraplan** | Cloud-planningssessie met inline commentaar in de browser, daarna uitvoeren op web of terugsturen naar terminal | Inbegrepen, niet apart geprijsd |

### Interface-personalisatie

| Feature | Wat |
|---|---|
| **Statusline** | Toon context-gebruik, git-status, kosten live in je promptregel |
| **Output styles** | Persistente aanpassing van hoe Claude antwoordt |
| **Voice dictation** | Spraak-naar-tekst invoer |
| **Channels** *(research preview)* | Koppel Claude Code aan chatplatformen voor notificaties buiten je terminal |

### Browser & desktop-automatisering

| Feature | Wat | Voor jou |
|---|---|---|
| **Chrome-extensie** | Claude bestuurt je browser: lokale webapps testen, console-logs debuggen, formulieren invullen | Perfect om je Pavone WooCommerce-booking-flow end-to-end te testen |
| **Computer use** *(Pro/Max)* | Claude bedient je volledige desktop, niet enkel de browser | Voor native app-tests of workflows buiten de browser |
| **Remote Control** | Bedien een sessie op je eigen machine vanaf een ander toestel | Handig als je onderweg een lange Claude Code-taak wil checken vanaf je telefoon |

---

## 6. Jouw stack: FastAPI + PostgreSQL + Docker + Redis — concreet playbook

### Voorbeeld `CLAUDE.md`

```markdown
# Project: <naam>

## Stack
- Python 3.12, FastAPI, Pydantic v2
- PostgreSQL 16 (via Docker Compose), Alembic voor migraties
- Redis voor caching/sessies
- Package manager: uv (gebruik nooit `pip install` rechtstreeks)

## Conventies
- Elke nieuwe endpoint krijgt een Pydantic request/response-schema en een test in `tests/`
- Migraties: `alembic revision --autogenerate -m "<omschrijving>"`, altijd manueel nakijken vóór `alembic upgrade head`
- Database queries via SQLAlchemy Core/ORM, nooit rauwe string-concatenatie
- Multi-tenant queries: filter altijd op `organization_id`

## Commando's
- Tests: `docker compose exec api pytest`
- Lokale stack opstarten: `docker compose up -d`
- Formatteren: `ruff format . && ruff check --fix .`

## Compact-instructies
Focus bij het compacten op recente codewijzigingen en testresultaten, niet op verkennende discussie.
```

### MCP-configuratie voor PostgreSQL (veilig)

⚠️ Gebruik **niet** de gedeprecateerde `@modelcontextprotocol/server-postgres` (bekende SQL-injectiekwetsbaarheid). Maak eerst een read-only rol aan:

```sql
CREATE USER claude_readonly WITH PASSWORD '...';
GRANT CONNECT ON DATABASE mydb TO claude_readonly;
GRANT USAGE ON SCHEMA public TO claude_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO claude_readonly;
```

En verbind daarmee via een actief onderhouden MCP-server, bv.:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "mcp-server-pg", "--connection-string",
        "postgresql://claude_readonly:...@localhost:5432/mydb"]
    }
  }
}
```

Zo kan Claude je schema inspecteren en queryvoorstellen doen zonder ooit schrijftoegang te hebben — relevant zowel voor je eigen projecten als voor klantendatabanken.

### Voorbeeld `.claude/security-patterns.yaml` voor FastAPI

```yaml
patterns:
  - rule_name: raw_sql_string_format
    regex: "\\.execute\\(f[\"']"
    reminder: "Gebruik parameterized queries (SQLAlchemy text() met bind params), geen f-strings in execute()."
  - rule_name: tenant_unfiltered_query
    regex: "\\.query\\(.*\\)\\.all\\(\\)"
    paths: ["app/**"]
    reminder: "Controleer of deze query filtert op organization_id."
```

### Voorbeeld hook: gefilterde testoutput

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{"type": "command", "command": "~/.claude/hooks/filter-pytest.sh"}]
      }
    ]
  }
}
```

```bash
#!/bin/bash
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command')
if [[ "$cmd" =~ ^(pytest|docker compose exec api pytest) ]]; then
  filtered="$cmd 2>&1 | grep -A 5 -E '(FAIL|ERROR|Error)' | head -100"
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"allow\",\"updatedInput\":{\"command\":\"$filtered\"}}}"
else
  echo "{}"
fi
```

Dit voorkomt dat een volledige, groene pytest-run met honderden regels je context opeet — enkel de fouten komen door.

### Devcontainer voor je Docker-workflow

Claude Code ondersteunt dev containers rechtstreeks: je kan Claude in dezelfde geïsoleerde container laten draaien als je applicatie, met netwerkrestricties die je zelf configureert. Sluit goed aan bij hoe je nu al met Docker Compose werkt, en geeft een extra isolatielaag bovenop permission modes.

---

## 7. Claude Code + GitHub Copilot combineren

Korte, praktische tips om ze niet tegen elkaar te laten werken:

- **Verschillend mentaal model:** Copilot is vooral **inline autocomplete + chat binnen één bestand/context**; Claude Code is **agentisch**: het leest meerdere bestanden, draait commando's, past tests uit en kan hele PR's voorbereiden. Gebruik Copilot voor het "vloeiend blijven typen"-gevoel, Claude Code voor multi-file werk, planning en infrastructuur.
- **Vermijd dubbel agentisch werk op hetzelfde bestand tegelijk.** Als je Copilot's agentmodus en Claude Code tegelijk op dezelfde files laat schrijven, krijg je conflicterende edits. Kies per taak één "driver".
- **Bespaar Claude-usage door kleine, lokale vragen aan Copilot Chat te stellen** ("wat doet deze regel", "kleine syntaxfix") en Claude Code te reserveren voor taken die écht meerdere bestanden, commando's of beslissingen vereisen.
- **`gh` CLI is de gemeenschappelijke noemer.** Zowel Copilot als Claude Code werken goed samen met GitHub via de `gh` CLI — zorg dat die correct geauthenticeerd is, dan kan Claude Code PR's, issues en reviews rechtstreeks beheren zonder een aparte MCP-server nodig te hebben.
- **Gebruik Claude Code voor de PR-beschrijving en `/code-review`, Copilot voor de laatste inline polish** tijdens het typen — een prettige verdeling die weinig overlap heeft.

---

## 8. Dingen waar je waarschijnlijk nog niet aan dacht

- **De gedeprecateerde officiële Postgres MCP-server heeft een bekende SQL-injectiekwetsbaarheid.** Gezien je net PostgreSQL aan het verdiepen bent en waarschijnlijk snel een MCP-koppeling wil proberen: dit is precies het moment om dat meteen goed (read-only rol, onderhouden server) op te zetten in plaats van later te moeten migreren.
- **`/context`** toont je exact wat op dit moment je contextvenster vult (CLAUDE.md, tool-definities, bestanden, geschiedenis) — gebruik dit actief tijdens lange sessies in plaats van te gokken waarom een sessie duur aanvoelt.
- **Prompt cache-invalidatie is stiller dan je denkt.** Zomaar tussendoor van model wisselen of een MCP-server aan/uit zetten kost je meer dan je zou verwachten — zie de tabel in §1.
- **Er is een wekelijkse limiet bovenop de 5-uursvensters.** Zelfs als je binnen je 5-uursblok blijft, kan een zware week je wekelijkse budget raken. `/usage` toont beide.
- **Code intelligence-plugins** (LSP-gebaseerd) geven Claude precieze "ga naar definitie"-navigatie in plaats van tekstueel zoeken, wat het aantal bestand-reads drukt — minder relevant voor dynamisch Python dan voor sterk getypeerde talen, maar de moeite waard als je ook TypeScript/Java-achtige onderdelen hebt (bv. een frontend voor Pavone).
- **`features-overview`-pagina in de docs** is letterlijk een gids die je helpt de juiste feature te kiezen én het contextkosten-profiel van elke feature toont — de moeite waard als naslagwerk zodra je dieper in deze features duikt.
- **Achtergrondverbruik bestaat, maar is klein** (doorgaans onder $0,04/sessie) — geen paniek als je in `/usage` iets ziet lopen zonder dat je typt.

---

## 9. Actieplan — komende week

1. Installeer de **security-guidance plugin** in al je actieve projecten, en maak er een gewoonte van om `/security-review` te draaien vóór elke commit met echte security-impact.
2. Schrijf of trim je **`CLAUDE.md`** naar onder de 200 regels per project (gebruik het voorbeeld in §6).
3. Zet een **read-only Postgres MCP-server** op met een dedicated `claude_readonly`-rol — niet de gedeprecateerde officiële server.
4. Voeg één **hook** toe die je testoutput filtert (voorbeeld in §6).
5. Test `/ultrareview` één keer op een bestaande, afgeronde PR om te zien wat de kwaliteit/kost-verhouding voor jou is, vóór je het bewaart voor echt risicovolle merges.
6. Check na een week `/usage` om te zien waar je budget precies naartoe gaat, en stel op basis daarvan bij.
