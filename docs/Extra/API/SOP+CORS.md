# Uitleg van SOP (Same Origin Policy) en CORS (Cross-Origin Resource Sharing)
## Doel
In deze documentatie leggen we uit wat SOP (Same Origin Policy) en CORS (Cross-Origin Resource Sharing) zijn, wat hun functie en doel is, hoe ze werken en hoe je CORS-instellingen kunt configureren in een FastAPI applicatie. Het correct begrijpen en configureren van SOP en CORS is essentieel om de veiligheid van je applicatie te waarborgen en tegelijkertijd de toegankelijkheid te behouden voor legitieme gebruikers.

## Reden
Je wilt uiteraard dat je API of webapp toegankelijk is voor gebruikers en werkt zoals het hoort. Maar het is gevaarlijk om zomaar alles toe te staan en op wildcard te zetten, omdat dit kan leiden tot beveiligingsproblemen zoals Cross-Site Request Forgery (CSRF) aanvallen. Daarom is het belangrijk om te begrijpen hoe SOP en CORS werken en zorgvuldig te configureren welke origins, methoden en headers je toestaat in je CORS-instellingen.

## Omgeving
Deze uitleg is specifiek voor API systemen die gebouwd zijn in Python met FastAPI, maar de principes kunnen ook worden toegepast in andere programmeertalen en frameworks. FastAPI biedt verschillende opties voor het configureren van CORS-instellingen, afhankelijk van de behoeften van je applicatie.

## Wat is SOP (Same Origin Policy)?
### Definitie
SOP (Same Origin Policy) is een fundamenteel beveiligingsmechanisme dat ingebouwd zit in alle moderne webbrowsers. Het is een regel die bepaalt dat een webpagina alleen mag toegang krijgen tot bronnen (zoals data, scripts, cookies, DOM-elementen) die afkomstig zijn van dezelfde **origin** als de pagina zelf. Een aanvaller kan dus niet zomaar via een kwaadaardige website data uitlezen van een andere website waar de gebruiker op ingelogd is.

### Wat is een Origin?
Een origin bestaat uit drie onderdelen:
1. **Protocol** (bijv. `https://` of `http://`)
2. **Hostnaam** (bijv. `example.com`)
3. **Poort** (bijv. `443` voor HTTPS, `80` voor HTTP)

Als alledrie deze onderdelen hetzelfde zijn, dan spreken we van dezelfde origin. Als ook maar één onderdeel verschilt, dan is het een andere origin.

| URL 1 | URL 2 | Zelfde origin? | Reden |
|---|---|---|---|
| `https://example.com/page1` | `https://example.com/page2` | ✅ Ja | Zelfde protocol, host en poort |
| `https://example.com` | `http://example.com` | ❌ Nee | Verschillend protocol (https vs http) |
| `https://example.com` | `https://api.example.com` | ❌ Nee | Verschillende hostnaam |
| `https://example.com` | `https://example.com:8080` | ❌ Nee | Verschillende poort |

### Functie en Doel van SOP
Het belangrijkste doel van SOP is het voorkomen van **Cross-Site Request Forgery (CSRF)** en het beschermen van gevoelige gebruikersdata. Zonder SOP zou een kwaadaardige website namens de gebruiker acties kunnen uitvoeren op een andere website waar de gebruiker op ingelogd is. Dit zou betekenen dat als een gebruiker ingelogd is op zijn bankwebsite en vervolgens een kwaadaardige website bezoekt, die website namens de gebruiker ongewenste transacties zou kunnen uitvoeren (bijv. geld overmaken) zonder dat de gebruiker dit weet.

SOP voorkomt dit door simpelweg te zeggen: **"Je mag alleen data lezen en verzoeken sturen naar dezelfde origin als waar je vandaan komt."**

### Hoe werkt SOP in de praktijk?
- **DOM-toegang**: Een iframe of pop-up kan alleen het DOM lezen van een pagina met dezelfde origin.
- **XMLHttpRequest / Fetch**: Een AJAX-request mag alleen data ophalen van dezelfde origin. Requests naar een andere origin worden door de browser geblokkeerd (tenzij CORS dit toestaat).
- **Cookies**: Cookies zijn standaard alleen toegankelijk voor de origin die ze heeft ingesteld (tenzij de `Domain` attribute anders aangeeft).

### Beperking van SOP
SOP is heel streng: het blokkeert **alle** cross-origin requests. Dit is veilig, maar in de moderne webwereld is het vaak nodig dat een frontend (bijv. `https://frontend.com`) data ophaalt van een API op een andere origin (bijv. `https://api.backend.com`). SOP zou dit blokkeren, en dat is waar **CORS** om de hoek komt kijken.

## Wat is CORS (Cross-Origin Resource Sharing)?
### Definitie
CORS (Cross-Origin Resource Sharing) is een mechanisme dat **bovenop SOP** werkt. Het biedt een manier om **selectief** cross-origin requests toe te staan die normaal gesproken door de SOP zouden worden geblokkeerd. Met andere woorden: CORS is de "sleutel" die de browser vertelt welke uitzonderingen op de SOP toegestaan zijn.

### Functie en Doel van CORS
CORS maakt het mogelijk om veilig cross-origin requests uit te voeren, terwijl de bescherming van SOP behouden blijft. In plaats van de SOP volledig uit te schakelen (wat onveilig zou zijn), kun je met CORS specifiek aangeven:
- **Welke origins** toegang hebben tot je API
- **Welke HTTP-methoden** (GET, POST, PUT, DELETE, etc.) toegestaan zijn
- **Welke headers** meegestuurd mogen worden
- **Of credentials** (zoals cookies) meegestuurd mogen worden

Dit geeft je fijne controle over wie er toegang heeft tot je API, zonder de beveiliging van SOP volledig op te geven.

### Hoe werkt CORS?
CORS werkt met **HTTP-headers** die de server meestuurt in de response. De browser controleert deze headers en beslist op basis daarvan of het request toegestaan is.

1. De frontend op `https://frontend.com` doet een request naar `https://api.backend.com`.
2. De browser detecteert dat dit een cross-origin request is (andere origin dan de huidige pagina).
3. De browser stuurt het request naar de server en controleert de response-headers:
   - Bevat de response de header `Access-Control-Allow-Origin: https://frontend.com`? Dan is het request toegestaan.
   - Bevat de response deze header niet, of staat de origin er niet in? Dan blokkeert de browser het request en krijgt de JavaScript-code een foutmelding.

### Preflight Requests
Voor bepaalde "complexe" requests (bijv. requests met custom headers, of andere methoden dan GET/POST) stuurt de browser eerst een **preflight request**. Dit is een `OPTIONS` request dat de server vraagt of het eigenlijke request toegestaan is.

1. De browser stuurt een `OPTIONS` request met de header `Access-Control-Request-Method` en eventueel `Access-Control-Request-Headers`.
2. De server antwoordt met de toegestane methoden, headers en origins via de `Access-Control-Allow-*` headers.
3. Als de preflight slaagt, stuurt de browser het eigenlijke request. Zo niet, dan wordt het geblokkeerd.

### Overzicht van CORS-headers

| Header | Functie |
|---|---|
| `Access-Control-Allow-Origin` | Welke origins toegestaan zijn |
| `Access-Control-Allow-Methods` | Welke HTTP-methoden toegestaan zijn |
| `Access-Control-Allow-Headers` | Welke headers toegestaan zijn in het request |
| `Access-Control-Allow-Credentials` | Of credentials (cookies, auth) meegestuurd mogen worden |
| `Access-Control-Max-Age` | Hoe lang de preflight response gecached mag worden |
| `Access-Control-Expose-Headers` | Welke response-headers de client mag lezen |

### Relatie tussen SOP en CORS
SOP en CORS werken samen als een beveiligingssysteem:
- **SOP** is de standaardregel: "Alles van een andere origin wordt geblokkeerd."
- **CORS** is de uitzondering: "Maar deze specifieke origins, methoden en headers mogen wel."

Zonder SOP zou er geen beveiliging zijn en zou elke website data van elke andere website kunnen uitlezen. Zonder CORS zou SOP te streng zijn en zou het onmogelijk zijn om legitieme cross-origin requests uit te voeren. Samen bieden ze een balans tussen veiligheid en functionaliteit.

## Stappen
### CORS Middleware Toevoegen
1. Importeer de `CORSMiddleware` van `fastapi.middleware.cors` en voeg deze toe aan je FastAPI applicatie.
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Sta alle origins toe, of specificeer een lijst van toegestane origins
    allow_methods=["*"],  # Sta alle HTTP-methoden toe, of specificeer een lijst van toegestane methoden
    allow_headers=["*"],  # Sta alle headers toe, of specificeer een lijst van toegestane headers
    max_age=3600  # Optioneel: stel de maximale leeftijd van de CORS-preflight response in (in seconden)
)
```
Dit is een zeer onveilig en slecht voorbeeld om alles toe te staan en op wildcard te zetten, maar het is hier om te laten zien hoe je de CORS middleware kan toevoegen. In een productieomgeving wil je waarschijnlijk specifieker zijn over welke origins, methoden en headers je toestaat.  
Dit kan zeer gevaarlijk zijn voor CSRF-aanvallen, dus wees voorzichtig met het gebruik van wildcard-instellingen in een productieomgeving.

### Allow Origins Configureren - Access-Control-Allow-Origin
1. In plaats van het toestaan van alle origins met `allow_origins=["*"]`, kun je een lijst van specifieke origins opgeven die toegang hebben tot je API of webapp.
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com", "https://anotherdomain.com"],  # Specificeer toegestane origins
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Allow Origins by Regex Configureren - Access-Control-Allow-Origin met Regex
1. Je kunt ook regex gebruiken om origins toe te staan die aan een bepaald patroon voldoen.
```python
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https://*.example.com",  # Sta alle subdomeinen van example.com toe
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Allow Methods Configureren - Access-Control-Allow-Methods
1. In plaats van het toestaan van alle HTTP-methoden met `allow_methods=["*"]`, kun je een lijst van specifieke methoden opgeven die zijn toegestaan.
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT"],  # Specificeer toegestane HTTP-methoden
    allow_headers=["*"],
)
```

### Allow Headers Configureren - Access-Control-Allow-Headers
1. In plaats van het toestaan van alle headers met `allow_headers=["*"]`, kun je een lijst van specifieke headers opgeven die zijn toegestaan.
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],  # Specificeer toegestane headers
)
```

### Max Age Configureren - Access-Control-Max-Age
1. Je kunt de maximale leeftijd van de CORS-preflight response instellen, wat aangeeft hoe lang de resultaten van een preflight request kunnen worden gecached door de browser.
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600  # Stel de maximale leeftijd in op 1 uur (3600 seconden)
)
```

### Allow Credentials Configureren - Access-Control-Allow-Credentials
1. Je kunt aangeven of je wilt toestaan dat cookies en andere credentials worden meegestuurd in CORS-verzoeken.
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True  # Sta credentials toe in CORS-verzoeken
)
```

### Expose Headers Configureren - Access-Control-Expose-Headers
1. Je kunt specificeren welke headers toegankelijk zijn voor de client in de CORS-response.
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Custom-Header"]  # Specificeer headers die toegankelijk zijn voor de client
)
```