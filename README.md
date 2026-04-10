# GDC-2025-2026
Onderzoek naar welke beveiligingsproblemen er kunnen voorkomen bij REST-API's en hun authenticatiesystemen, hoe deze problemen voorkomen kunnen worden en wat de gevaren zijn. Dit wordt onderzocht aan de hand van Python met FastAPI &amp; PostgreSQL.

## Onderzoeksvraag
Welke beveiligingsproblemen komen voor bij web- en REST-API’s en hun authenticatiesystemen, en hoe kunnen deze problemen worden voorkomen?

## Hypothese
Bij web- en REST-API’s komen beveiligingsproblemen zoals **Cross-Site Scripting (XSS)**, **Cross-Site Request Forgery (CSRF)** en **Improper Input Validation** voor. Hoe deze problemen voorkomen kunnen worden zal duidelijk worden na verder onderzoek.

## Welke Security Problemen zullen onderzocht worden
### Officieel voor GDC
> [!NOTE]
> De hieronder vermelde security problemen worden onderzocht en besproken voor de GDC.  
> Documentatie is te vinden bij `/docs/Official/`

- XSS - Cross-Site Scripting
    - Stored XSS
    - Reflected XSS
    - Escaping User Input
    - Stripping User Input
- CSRF - Cross-Site Request Forgery
    - SOP & CORS - Same Origin Policy & Cross-Origin Resource Sharing
    - CSRF Tokens for protection
    - Misconfigured CORS - Cross-Origin Resource Sharing

---
### Extra Onderzoek

> [!NOTE] 
> Extra onderzoek zal uitgevoerd worden naar andere, hieronder vermelde, security problemen voor eigen doeleinden en het vak Informaticawetenschappen.  
> Deze onderwerpen komen niet aan bod in de GDC (paper of presentatie).  
> Documentatie is te vinden onder `/docs/Extra/`
- Lack of Rate Limiting
- CSP - Content Security Policy
- Insufficient Logging & Monitoring (malicious activities go unnoticed)
- Excessive Data Exposure
- BOLA - Broken Object Level Authorization
- IDOR - Insecure Direct Object Reference

## Toegang tot webapp & API
Neem zeker eens een kijkje op de webapp en API's die ik heb opgezet voor het testen van de verschillende beveiligingsproblemen.  
Maak gerust een account aan en test gerust bepaalde zaken uit en probeer de beveiligingsproblemen te vinden.

**Let op:** Als je wisselt van de ene webapp naar de andere, vergeet dan niet eerst uit te loggen voordat je inlogt op de andere webapp, anders kunnen er problemen ontstaan met de cookies en sessies.  
Je moet gewoon opnieuw inloggen op de andere webapp, de login gegevens zijn wel hetzelfde en gesynchroniseerd tussen de twee apps.  
De reden hiervoor is dat de Safe App en Unsafe App dezelfde access_token cookie gebruiken, maar de signuture van deze cookie is verschillend tussen de twee apps.  

### Webapp & frontend
- Safe App: https://safe-app.ian-chains.be/ - **Active**
- Unsafe App: https://unsafe-app.ian-chains.be/ - **Active**

---
### Webapp Attacker - CSRF Attacks
- Using Safe API: https://attacker-safe.yourwebmaster.be/ - **Active**
- Using Unsafe API: https://attacker-unsafe.yourwebmaster.be/ - **Active**

---
### API
- Safe API: https://safe-api.ian-chains.be/ - **Active**
    - OpenAPI DOCS: https://safe-api.ian-chains.be/docs
- Unsafe API: https://unsafe-api.ian-chains.be/ - **Active**
    - OpenAPI DOCS: https://unsafe-api.ian-chains.be/docs

## Docker Container Setup
Alle informatie voor het opzetten van de FastAPI Docker containers is te vinden in het bestand `src/API/README.md`.

## Gebruikte Software
### Linux Software & Services
- [Docker](https://www.docker.com/) - Containerization Software
- [Portainer](https://www.portainer.io/) - Docker Management Software
- [WireGuard](https://www.wireguard.com/) - VPN Software
- [PostreSQL](https://www.postgresql.org/) - SQL Database
- [Nginx Proxy Manager](https://nginxproxymanager.com/) - Reverse Proxy Software
- [Cloudflare](https://www.cloudflare.com/) - DNS Provider & CDN Software

### Development Libraries API
- [Python](https://www.python.org/) - Programming Language
- [Uvicorn](https://www.uvicorn.org/) - ASGI Server
- [FastAPI](https://fastapi.tiangolo.com/) - Python API Framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python SQL Toolkit & Object Relational Mapper
- [Pydantic](https://pydantic.dev/) - Data Validation Library
- [Argon2](https://argon2-cffi.readthedocs.io/en/stable/) - Password Hashing Library
- [PyJWT](https://pyjwt.readthedocs.io/en/stable/) - JSON Web Token Library
- [Asyncpg](https://magicstack.github.io/asyncpg/current/) - Async PostgreSQL Client Library

### Development Libraries Frontend
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [DaisyUI](https://daisyui.com/) - Tailwind Component Library
- [HyperUI](https://hyperui.dev/) - Tailwind Component Library

### Software Tools
- [Visual Studio Code](https://code.visualstudio.com/) - Code Editor
- [HeidSQL](https://heidisql.com/) - SQL Client Software
- [Postman](https://www.postman.com/) - API Testing & Collaboration Software
- [HTTP Toolkit](https://httptoolkit.com/) - API Intercept Software
- [Github Copilot](https://github.com/features/copilot) - AI Code Assistant
