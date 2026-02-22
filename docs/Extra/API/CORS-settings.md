# Verschillende opties voor CORS-instellingen
## Doel
In deze documentatie leggen we uit hoe je verschillende opties voor CORS-instellingen kunt configureren in een FastAPI applicatie. CORS (Cross-Origin Resource Sharing) is een beveiligingsmechanisme dat bepaalt welke bronnen van andere domeinen toegang hebben tot je API of webapp. Het correct configureren van CORS-instellingen is essentieel om de veiligheid van je applicatie te waarborgen en tegelijkertijd de toegankelijkheid te behouden voor legitieme gebruikers.

## Reden
Je wilt uiteraard dat je API of webapp toegankelijk is voor gebruikers en werkt zoals het hoord. Maar het is gevaarlijk om zo maar alles toe te staan en op wildcard te zetten, omdat dit kan leiden tot beveiligingsproblemen zoals Cross-Site Request Forgery (CSRF) aanvallen. Daarom is het belangrijk om zorgvuldig te configureren welke origins, methoden en headers je toestaat in je CORS-instellingen.

## Omgeving
Deze uitleg is specifiek voor API systemen die gebouwd zijn in Python met FastAPI, maar de principes kunnen ook worden toegepast in andere programmeertalen en frameworks. FastAPI biedt verschillende opties voor het configureren van CORS-instellingen, afhankelijk van de behoeften van je applicatie.

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