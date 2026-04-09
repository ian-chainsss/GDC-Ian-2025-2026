# Uitleg van cookie settings en structuur
## Doel
In deze documentatie zal uitgelegd worden welke cookie settings er zijn, zoals welke tags en flags je kan gebruiken bij het instellen van cookies en wat deze doen.

## Reden
Het is belangrijk dat cookies correct ingesteld worden, omdat dit invloed heeft op de veiligheid en functionaliteit van je webapplicatie. Door de juiste cookie settings te gebruiken, kan je ervoor zorgen dat cookies veilig worden opgeslagen en alleen toegankelijk zijn voor de juiste partijen.

## Omgeving
De voorbeelden en hieronder uitleg zijn specifiek voor API systemen die gebouwd zijn in Python met FastAPI, maar de principes kunnen ook worden toegepast in andere programmeertalen en frameworks.

## Stappen &  de verschillende cookie settings
### Secure Flag
De `Secure` flag zorgt ervoor dat cookies alleen worden verzonden via beveiligde HTTPS-verbindingen. Dit helpt om te voorkomen dat cookies worden onderschept door kwaadwillende partijen tijdens het transport over het netwerk. Het is aan te raden om deze flag altijd in te stellen, vooral als je gevoelige informatie in de cookies opslaat.
```python
from fastapi import FastAPI, Response
app = FastAPI()
@app.get("/set-cookie/")
def set_cookie(response: Response):
    response.set_cookie(key="my_cookie", value="cookie_value", secure=True)
    return {"message": "Cookie set with Secure flag"}
```

### HttpOnly Flag
De `HttpOnly` flag zorgt ervoor dat cookies niet toegankelijk zijn via client-side scripts, zoals JavaScript. Dit helpt om te voorkomen dat cookies worden gestolen door cross-site scripting (XSS) aanvallen. Het is aan te raden om deze flag in te stellen voor cookies die gevoelige informatie bevatten, zoals sessie-ID's.
```python
from fastapi import FastAPI, Response
app = FastAPI()
@app.get("/set-cookie/")
def set_cookie(response: Response):
    response.set_cookie(key="my_cookie", value="cookie_value", httponly=True)
    return {"message": "Cookie set with HttpOnly flag"}
```

### SameSite Attribute
De `SameSite` attribute helpt om te voorkomen dat cookies worden verzonden bij cross-site requests, wat kan helpen om CSRF-aanvallen te voorkomen. Er zijn drie mogelijke waarden voor deze attribute:
- `Strict`: Cookies worden alleen verzonden bij requests die afkomstig zijn van dezelfde site. Dit
    kan de functionaliteit van je webapplicatie beperken, omdat cookies niet worden verzonden bij requests van andere sites, zelfs als deze legitiem zijn.  
    Dit is wel de veiligste optie, omdat het voorkomt dat cookies worden verzonden bij cross-site requests, maar het kan ook leiden tot een slechte gebruikerservaring als cookies niet worden verzonden bij legitieme requests van andere sites.
- `Lax`: Cookies worden verzonden bij top-level navigaties en GET-requests van andere sites, maar niet bij andere cross-site requests. Dit is een goede balans tussen veiligheid en functionaliteit maar dit kan alsnog security risico's met zich meebrengen, omdat cookies nog steeds worden verzonden bij bepaalde cross-site requests.
- `None`: Cookies worden altijd verzonden, ongeacht de bron van het verzoek. Dit is de minst veilige optie, omdat cookies worden verzonden bij alle cross-site requests, wat kan leiden tot CSRF-aanvallen.
```python
from fastapi import FastAPI, Response
app = FastAPI()
@app.get("/set-cookie/")
def set_cookie(response: Response):
    response.set_cookie(key="my_cookie", value="cookie_value", samesite="Strict")
    return {"message": "Cookie set with SameSite attribute"}
```

#### Opmerking
- Let op als je een cookie instelt met `SameSite=None`, dit kan erg gevaarlijk zijn voor CSRF-aanvallen.
- Sommige browsers zullen toch cookies met `SameSite=None` niet meesturen bij cross-site requests, omdat deze ingesteld staan om Third Party cookies te blokkeren. Dit betekent dat zelfs als je `SameSite=None` instelt, cookies mogelijk nog steeds niet worden verzonden bij cross-site requests, afhankelijk van de browserinstellingen van de gebruiker.
- CSRF attack is dus ook vaak browser afhankelijk en de beveiliging van de browser applicatie kan ook een rol spelen in de mata van de beveiliging van cookies en het voorkomen van CSRF-aanvallen.

### Expires Attribute
De `Expires` attribute bepaalt wanneer een cookie verloopt. Na de opgegeven datum en tijd zal de cookie niet langer worden verzonden door de browser. Het is belangrijk om cookies een redelijke vervaldatum te geven, vooral als ze gevoelige informatie bevatten, zodat ze niet onbeperkt geldig blijven.
```python
from fastapi import FastAPI, Response
from datetime import datetime, timedelta
app = FastAPI()
@app.get("/set-cookie/")
def set_cookie(response: Response):
    expires = datetime.utcnow() + timedelta(days=7)  # Cookie verloopt na 7 dagen
    response.set_cookie(key="my_cookie", value="cookie_value", expires=expires)
    return {"message": "Cookie set with Expires attribute"}
```

### Max-Age Attribute
De `Max-Age` attribute bepaalt de levensduur van een cookie in seconden. Na het verstrijken van deze tijd zal de cookie niet langer worden verzonden door de browser. Dit is een alternatieve manier om de vervaldatum van een cookie te bepalen, in plaats van de `Expires` attribute.
```python
from fastapi import FastAPI, Response
app = FastAPI()
@app.get("/set-cookie/")
def set_cookie(response: Response):
    max_age = 7 * 24 * 60 * 60  # Cookie verloopt na 7 dagen (in seconden)
    response.set_cookie(key="my_cookie", value="cookie_value", max_age=max_age)
    return {"message": "Cookie set with Max-Age attribute"}
```

### Path Attribute
De `Path` attribute bepaalt het pad waarvoor de cookie geldig is. Cookies worden alleen verzonden bij requests die overeenkomen met het opgegeven pad. Dit kan helpen om te voorkomen dat cookies worden verzonden bij requests die niet relevant zijn voor de cookie, wat de veiligheid kan verbeteren.
```python
from fastapi import FastAPI, Response
app = FastAPI()
@app.get("/set-cookie/")
def set_cookie(response: Response):
    response.set_cookie(key="my_cookie", value="cookie_value", path="/specific-path")
    return {"message": "Cookie set with Path attribute"}
```

### Domain Attribute
De `Domain` attribute bepaalt voor welke domeinen de cookie geldig is. Cookies worden alleen verzonden bij requests die overeenkomen met het opgegeven domein. Dit kan helpen om te voorkomen dat cookies worden verzonden bij requests van andere domeinen, wat de veiligheid kan verbeteren.  
Pasop de browser zal enkel accepteren dat je een cookie instelt voor een domein dat gelijk is aan of de parent of een subdomein is van het domein van de huidige pagina. Dit betekent dat als je een cookie wilt instellen voor `example.com`, je dit alleen kunt doen als je pagina zich op `example.com` of een subdomein daarvan bevindt, zoals `sub.example.com`. Je kunt geen cookie instellen voor een volledig ander domein, zoals `anotherdomain.com`, vanuit een pagina op `example.com`.
```python
from fastapi import FastAPI, Response
app = FastAPI()
@app.get("/set-cookie/")
def set_cookie(response: Response):
    response.set_cookie(key="my_cookie", value="cookie_value", domain="example.com")
    return {"message": "Cookie set with Domain attribute"}
```

### Prefix Attribute
De `Prefix` attribute is een manier om aan te geven dat een cookie een speciale betekenis heeft. Er zijn twee mogelijke waarden voor deze attribute:
- `__Secure-`: Cookies met deze prefix moeten de `Secure` flag hebben ingesteld en worden alleen verzonden via beveiligde HTTPS-verbindingen. Dit helpt om te voorkomen dat cookies worden onderschept door kwaadwillende partijen tijdens het transport over het netwerk.
- `__Host-`: Cookies met deze prefix moeten de `Secure` flag hebben ingesteld, mogen geen `Domain` attribute hebben en moeten een `Path` attribute hebben ingesteld op `/`. Dit betekent dat deze cookies alleen worden verzonden bij requests naar het exacte domein van de huidige pagina en niet bij requests van andere domeinen of subdomeinen. Dit is de veiligste optie voor cookies, omdat het voorkomt dat cookies worden verzonden bij cross-site requests en dat ze alleen toegankelijk zijn voor het exacte domein waarvoor ze zijn ingesteld.
```python
from fastapi import FastAPI, Response
app = FastAPI()
@app.get("/set-cookie/")
def set_cookie(response: Response):
    response.set_cookie(key="__Secure-my_cookie", value="cookie_value", secure=True)
    return {"message": "Cookie set with Prefix attribute"}
```
