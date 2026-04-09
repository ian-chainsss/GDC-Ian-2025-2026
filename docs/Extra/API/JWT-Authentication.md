# Uitleg van JWT (JSON Web Token) Authenticatie

## Doel
In deze documentatie zal uitgelegd worden wat JWT's (JSON Web Tokens) zijn, hoe ze werken, waarvoor ze gebruikt worden, en hoe ze zich verhouden tot alternatieve authenticatiemethoden zoals sessions in een database. Ook zal worden uitgelegd hoe je JWT's kunt aanbieden via verschillende methoden, inclusief Authorization headers en HttpOnly cookies.

## Reden
Authenticatie is essentieel voor de veiligheid van je webapplicatie. Het is belangrijk te begrijpen hoe JWT's werken en wat de voordelen en nadelen zijn ten opzichte van andere methoden. Dit helpt je om de juiste authenticatiestrategie te kiezen voor je applicatie. JWT's zijn populair omdat ze stateless zijn, schaalbaar, en kunnen worden gebruikt in microservices-architecturen.

## Omgeving
De voorbeelden en uitleg hieronder zijn specifiek voor API systemen die gebouwd zijn in Python met FastAPI, maar de principes kunnen ook worden toegepast in andere programmeertalen en frameworks.

---

## Wat is een JWT (JSON Web Token)?

### Definitie
Een JWT (JSON Web Token) is een compacte, URL-veilige manier om informatie (claims) veilig uit te wisselen tussen twee partijen. Een JWT bestaat uit drie delen, gescheiden door punten:

```
header.payload.signature
```

### Structuur van een JWT

#### 1. Header (Base64URL gecodeerd)
De header bevat informatie over het type token en het gebruikte algorithme.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- **alg**: Het algoritme gebruikt voor ondertekening (bijv., HS256, RS256)
- **typ**: Het type token (altijd "JWT")

#### 2. Payload (Base64URL gecodeerd)
De payload bevat de claims. Dit zijn statements over de gebruiker of applicatie. Er zijn drie soorten claims:

**Registered Claims** (standaard claims):
- `iss` (Issuer): Wie heeft het token uitgegeven?
- `sub` (Subject): Voor wie is het token (meestal user ID)?
- `aud` (Audience): Voor wie is het bestemd?
- `exp` (Expiration Time): Wanneer verloopt het token?
- `iat` (Issued At): Wanneer is het token gegenereerd?
- `nbf` (Not Before): Wanneer mag het token gebruikt worden?

**Public Claims**: Standaard gedefinieerde claims die openbaar gebruikt kunnen worden

**Private Claims**: Custom claims gedefinieerd door de applicatie

Voorbeeld payload:
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "iat": 1516239022,
  "exp": 1516242622
}
```

#### 3. Signature (Base64URL gecodeerd)
De signature zorgt ervoor dat het token niet is gewijzigd. De server gebruikt de secret key om de signature te verifiëren.

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Voorbeeld volledige JWT
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

---

## Waarvoor wordt JWT gebruikt? (Functies en Doelen)

### 1. Stateless Authenticatie
JWT's zijn **stateless**, wat betekent dat de server geen sessie-informatie hoeft op te slaan. Dit is anders dan sessions in een database, waar de server alle actieve sessies moet onthouden.

### 2. Microservices en Gedistribueerde Systemen
JWT's kunnen eenvoudig worden verdeeld tussen verschillende servers/services zonder centrale sessie-opslag. Dit maakt JWT's ideaal voor microservices-architecturen.

### 3. Mobile Apps en Cross-Platform Integratie
JWT's kunnen eenvoudig worden verzonden naar mobile apps, single-page applications (SPA's) en andere platformtypes.

### 4. Autorisatie (Authorization)
Naast authenticatie (wie ben je?), kunnen JWT's informatie over autorisatie (wat mag je doen?) bevatten. Rollen, machtigingen en andere autorisatie-informatie kunnen in het token worden opgeslagen.

### 5. Third-Party Integratie
JWT's zijn veilig om naar externe services te sturen omdat ze ondertekend zijn en geverifieerd kunnen worden.

---

## Hoe werkt JWT Authenticatie?

### Stap 1: Login (Token aanmaken)
De gebruiker logt in met username en wachtwoord. De server verifieert de inloggegevens en creëert vervolgens een JWT:

```python
from fastapi import FastAPI, HTTPException
from datetime import datetime, timedelta
import jwt

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

@app.post("/login")
def login(username: str, password: str):
    # Verifieer de inloggegevens
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Maak JWT aan
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}
```

### Stap 2: Token Verzenden
De client ontvangt het token en slaat het op (in het geheugen, localStorage, HttpOnly cookie, etc.).

### Stap 3: Token Gebruiken
Bij elke request stuurt de client het token naar de server. Dit kan via:
- Authorization header: `Authorization: Bearer <token>`
- Cookie: Automatisch verzonden door browser
- Request body: In bepaalde gevallen

```python
from fastapi import Depends, Security
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.get("/protected-route")
def protected_route(credentials = Depends(security)):
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {"message": f"Hello user {user_id}"}
```

### Stap 4: Token Valideren
De server decodeert en verifieert het token met behulp van de secret key. Als het token geldig is, wordt het verzoek verwerkt.

---

## JWT vs Sessions in Database: Vergelijking

| Aspect | JWT | Session (Database) |
|--------|-----|------------------|
| **State** | Stateless (server hoeft niets op te slaan) | Stateful (server slaat data op in DB) |
| **Schaalbaarheid** | Zeer schaalbaar (geen centrale opslag nodig) | Minder schaalbaar (meer DB-queries nodig) |
| **Performance** | Sneller (geen DB-lookup nodig) | Langzamer (DB-lookup vereist) |
| **Token Revocation** | Moeilijk (token blijft geldig tot expiratie) | Eenvoudig (verwijder uit DB) |
| **Token Size** | Groter (bevat alle informatie) | Kleiner (bevat alleen session ID) |
| **Logout** | Moeilijk (geen centrale controle) | Eenvoudig (verwijder sessie) |
| **Distributed Systems** | Zeer geschikt | Minder geschikt |
| **Security** | Veilig (als correct gebruikt) | Veilig |

### Wanneer JWT gebruiken?
- Microservices-architectuur
- Mobile apps
- Stateless API's
- Cross-platform integratie

### Wanneer Sessions gebruiken?
- Monolitische applicaties
- Applicaties waar je snel tokens moet kunnen revoken
- Applicaties waar je logout-functionaliteit nodig hebt
- Traditionele web-applicaties

---

## Short-Lived en Long-Lived JWT's

### Short-Lived JWT's (Access Tokens)

**Wat zijn ze?**
Short-lived JWT's zijn access tokens met een korte vervaltijd, meestal van 15 minuten tot 1 uur. Deze tokens worden gebruikt voor het uitvoeren van API requests.

**Voordeel:**
- ✅ Veiliger: als een token wordt gestolen, is het maar beperkt bruikbaar (slechts enkele minuten)
- ✅ Beperkte schade: korte exposure window bij diefstal
- ✅ Snel kunnen invalideren: token verloopt snel natuurlijk

**Nadeel:**
- ❌ Frequent verversen vereist: gebruiker hoeft regelmatig authentiek te zijn
- ❌ Meer requests: meer vernieuwingsverzoeken naar server

```python
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # 15 minuten

token_data = {
    "sub": str(user.id),
    "iat": datetime.utcnow(),
    "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    "token_type": "access"
}

access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
```

### Long-Lived JWT's (Refresh Tokens)

**Wat zijn ze?**
Long-lived JWT's zijn refresh tokens met een lange vervaltijd (dagen tot maanden). Deze tokens worden **niet** gebruikt voor API requests, maar alleen om nieuwe access tokens aan te vragen. Daarnaast kunnen deze tokens worden **gerevoceerd/invalid verklaard** in de database.

**Voordeel:**
- ✅ Betere user experience: gebruiker hoeft niet constant opnieuw in te loggen
- ✅ Langere sessies: kan dagenlang actief blijven
- ✅ Revocatie mogelijk: kan in database worden gemarkeerd als invalid
- ✅ Logout control: door token invalid te verklaren, kunnen geen nieuwe access tokens meer worden aangemaakt

**Nadeel:**
- ❌ Minder veilig als gestolen: langer bruikbaar
- ❌ Database nodig: moet in database worden opgeslagen voor revocatie
- ❌ Complexer: vereist server-side sessie-tracking

```python
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 dagen

refresh_token_data = {
    "sub": str(user.id),
    "iat": datetime.utcnow(),
    "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    "token_type": "refresh",
    "jti": str(uuid.uuid4())  # Unique token ID voor revocatie
}

refresh_token = jwt.encode(refresh_token_data, SECRET_KEY, algorithm=ALGORITHM)

# Sla in database op voor revocatie tracking
token_in_db = TokenRecord(
    user_id=user.id,
    jti=refresh_token_data["jti"],
    token=refresh_token,
    is_valid=True,
    expires_at=datetime.utcnow() + timedelta(days=7)
)
db.add(token_in_db)
db.commit()
```

### Het Twee-Token Systeem

De beste praktijk is **twee JWT's gebruiken**:

1. **Access Token** (korta levensduur, geen revocatie): Gebruikt voor API requests (bijv. 15 minuten)
2. **Refresh Token** (lange levensduur, revocabel): Gebruikt om een nieuw access token aan te vragen (bijv. 7 dagen). Kan in database worden gemarkeerd als invalid.

**Hoe werkt dit?**

```python
@app.post("/login")
def login(username: str, password: str):
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Access token
    access_token = create_access_token(user.id, expires_delta=timedelta(minutes=15))
    
    # Refresh token
    refresh_token = create_refresh_token(user.id, expires_delta=timedelta(days=7))
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/refresh-token")
def refresh_token(refresh_token_str: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(refresh_token_str, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        jti = payload.get("jti")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    # Controleer of token geldig is in database
    token_record = db.query(TokenRecord).filter(
        TokenRecord.jti == jti,
        TokenRecord.user_id == user_id,
        TokenRecord.is_valid == True
    ).first()
    
    if not token_record:
        raise HTTPException(status_code=401, detail="Refresh token is revoked or invalid")
    
    # Maak nieuw access token aan
    new_access_token = create_access_token(user_id, expires_delta=timedelta(minutes=15))
    
    return {"access_token": new_access_token, "token_type": "bearer"}

@app.post("/logout")
def logout(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # Markeer alle refresh tokens van deze gebruiker als invalid
    db.query(TokenRecord).filter(
        TokenRecord.user_id == current_user.id,
        TokenRecord.is_valid == True
    ).update({TokenRecord.is_valid: False})
    db.commit()
    
    return {"message": "Successfully logged out. No new access tokens can be created."}
```

**Voor- en nadelen van dit systeem:**
- ✅ Veilig: access token is kort van duur en kan niet worden gerevoceerd
- ✅ User experience: refresh token zorgt voor langere sessie zonder constant opnieuw inloggen
- ✅ Logout control: door refresh token invalid te verklaren, kunnen geen nieuwe access tokens meer gemaakt worden
- ✅ Flexibel: access token kan worden hernieuwd zonder opnieuw in te loggen
- ❌ Ingewikkelder: twee tokens beheren en database-tracking nodig
- ❌ Database overhead: elke refresh-token-refresh vraagt database op

**Flow diagram:**
```
1. Gebruiker logt in → access token (15m) + refresh token (7d, in DB)
2. Access token gebruikt voor requests
3. Access token verloopt → gebruik refresh token om nieuw access token te krijgen
4. Refresh token in DB is geldig → nieuw access token gekregen
5. Logout → refresh token in DB gemarkeerd als invalid
6. Volgende refresh attempt → access token weigering (token invalid in DB)
```

---

## JWT Aanbiedings Manieren: Authorization Header vs HttpOnly Cookie

### Methode 1: Authorization Header (Bearer Token)

#### Hoe werkt het?
Het JWT wordt verzonden in de `Authorization` header als Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Implementatie (Client-side)

**JavaScript Example:**
```javascript
// Sla token op in geheugen of localStorage
localStorage.setItem('access_token', token);

// Zend token met elke request
const response = await fetch('/api/protected-route', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
});
```

#### Implementatie (Server-side FastAPI)

```python
from fastapi.security import HTTPBearer, HTTPAuthenticationCredentials

security = HTTPBearer()

@app.get("/protected-route")
def protected_route(credentials: HTTPAuthenticationCredentials = Depends(security)):
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {"message": "Success"}
```

#### Voor- en Nadelen

**Voordelen:**
- ✅ Flexibel: token kan op elke plek worden opgeslagen
- ✅ CORS-vriendelijk: werkt goed met CORS
- ✅ Eenvoudig voor mobile apps en SPA's

**Nadelen:**
- ❌ XSS-kwetsbaar: als JavaScript wordt aangevallen, kan het token worden gestolen uit localStorage
- ❌ Handmatig beheer: je moet zelf de header toevoegen bij elke request
- ❌ Geen automatische verzending: moet handmatig worden verzonden met elke request

#### XSS-Bescherming
```javascript
// SLECHTER: Opgeslagen in localStorage (XSS-kwetsbaar)
localStorage.setItem('access_token', token);

// BETER: Opgeslagen in memory (verwijderd bij page reload)
let accessToken = token;
```

---

### Methode 2: HttpOnly Cookie

#### Hoe werkt het?
Het JWT wordt opgeslagen in een HttpOnly cookie. De browser stuurt dit automatisch bij elke request naar de betreffende domain.

#### Implementatie (Server-side FastAPI)

```python
from fastapi import FastAPI, Response
from datetime import datetime, timedelta

@app.post("/login")
def login(response: Response, username: str, password: str):
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Maak JWT aan
    access_token = create_access_token(user.id)
    
    # Zet in HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,        # JavaScript kan dit niet benaderen
        secure=True,          # Alleen via HTTPS verzonden
        samesite="Strict",    # CSRF-bescherming
        max_age=900          # 15 minuten vervaldatum
    )
    
    return {"message": "Logged in successfully"}

@app.get("/protected-route")
def protected_route(request: Request):
    # Cookie wordt automatisch verzonden en kan hier uit worden gelezen
    token = request.cookies.get("access_token")
    
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {"message": "Success"}
```

#### Implementatie (Client-side)

```javascript
// Geen token-handling nodig!
// De browser stuurt de cookie automatisch

const response = await fetch('/api/protected-route', {
    method: 'GET',
    credentials: 'include'  // Zorg dat cookies worden verzonden
});
```

#### Voor- en Nadelen

**Voordelen:**
- ✅ XSS-veilig: HttpOnly cookies kunnen niet door JavaScript worden benaderd
- ✅ Automatisch: browser stuurt cookie automatisch mee
- ✅ CSRF-bescherming: SameSite attribute biedt bescherming
- ✅ Eenvoudiger op client-side: geen handmatig token-beheer

**Nadelen:**
- ❌ CORS-complexer: vereist correct CORS-configuratie
- ❌ Minder flexibel: token moet in cookie zijn opgeslagen
- ❌ Subdomein-problemen: cookies worden niet altijd gedeeld tussen subdomein

---

### Methode 3: Authorization Header zonder Bearer (Custom Format)

Sommige implementaties gebruiken Authorization headers zonder "Bearer":

```javascript
// Client-side
const response = await fetch('/api/protected-route', {
    headers: {
        'Authorization': token  // Zonder "Bearer"
    }
});
```

```python
# Server-side
@app.get("/protected-route")
def protected_route(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")
    
    try:
        payload = jwt.decode(authorization, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {"message": "Success"}
```

**Voordelen:**
- ✅ Eenvoudiger format

**Nadelen:**
- ❌ Minder standaard
- ❌ Moeilijker voor developers om mee te werken
- ❌ Geen duidelijkheid over token-type

---

## Vergelijking: Authorization Header (Bearer) vs HttpOnly Cookie

| Aspect | Authorization Header (Bearer) | HttpOnly Cookie |
|--------|-------------------------------|-----------------|
| **XSS-veiligheid** | ❌ Kwetsbaar (localStorage) | ✅ Veilig (HttpOnly) |
| **CSRF-veiligheid** | ✅ Veilig | ✅ Veilig (SameSite) |
| **Automatische verzending** | ❌ Handmatig | ✅ Automatisch |
| **Browser-ondersteuning** | ✅ Alle browsers | ✅ Alle browsers |
| **Mobile-app support** | ✅ Goed | ⚠️ Afhankelijk |
| **CORS-vriendelijk** | ✅ Ja | ⚠️ Ingewikkelder |
| **Logout** | ❌ Moeilijk | ✅ Eenvoudig (cookie verwijderen) |
| **Multi-device** | ⚠️ Afhankelijk van client | ✅ Eenvoudiger |
| **Token-revocation** | ❌ Moeilijk | ⚠️ Beter met logout |

---

## Best Practices voor JWT Authenticatie

### 1. Altijd HTTPS gebruiken
JWT's worden verzonden over het netwerk. Gebruik HTTPS om man-in-the-middle aanvallen te voorkomen.

### 2. Korte Access Token Levensduur
Zet access tokens op 15-30 minuten. Dit beperkt de schade bij token-diefstal.

### 3. Refresh Tokens Opslaan
Met refresh tokens kunnen gebruikers langere sessies hebben zonder veiligheid in te boeten.

### 4. Gebruik Sterke Secret Keys
```python
SECRET_KEY = "super-secret-key-with-enough-entropy-at-least-32-characters"
```

### 5. Token Revocation Implementeren
Voor logout-functionaliteit:
- Voeg token blacklist toe (database)
- Of sla logouts op en check bij token-validatie

```python
# Blacklist tokens
blacklisted_tokens = set()

@app.post("/logout")
def logout(current_user = Depends(get_current_user)):
    # Voeg token toe aan blacklist
    blacklisted_tokens.add(current_user.token)
    return {"message": "Logged out"}

def verify_token(token: str):
    if token in blacklisted_tokens:
        raise HTTPException(status_code=401, detail="Token revoked")
    # Normaleverifcatie...
```

### 6. CORS Correct Configureren
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://frontend.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 7. Refresh Token Opslaglocatie
- ✅ HttpOnly Cookie: Veilig tegen XSS
- ✅ Secure opslag (mobile apps): Gesloten opslag
- ❌ localStorage: Kwetsbaar voor XSS

### 8. Token Validatie Altijd Controleren
Verifieer:
- Signature (niet gewijzigd)
- Expiration time (niet verlopen)
- Issuer (correct uitgegeven)
- Audience (bestemd voor deze service)

---

## Conclusie

JWT's zijn krachtige tokens voor stateless authenticatie, vooral in gedistribueerde systemen. De keuze tussen Authorization headers en HttpOnly cookies hangt af van je specifieke beveiligingsvereisten:

- **Gebruik Authorization Headers** als je een SPA hebt met strikte CORS-controle en mobiele apps ondersteunt.
- **Gebruik HttpOnly Cookies** als je traditionele web-applicaties hebt met server-side rendering en extra XSS-bescherming nodig hebt.

De beste benadering is vaak een **combinatie**: refresh tokens in HttpOnly cookies en access tokens in Authorization headers, of beide in cookies voor hogere veiligheid.
