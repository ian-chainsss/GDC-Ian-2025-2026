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
- CSRF - Cross-Site Request Forgery
- Improper Input Validation
    - Injection Attacks (SQL Injection)
    - IDOR - Insecure Direct Object Reference

---
### Extra Onderzoek

> [!NOTE] 
> Extra onderzoek zal uitgevoerd worden naar andere, hieronder vermelde, security problemen voor eigen doeleinden en het vak Informaticawetenschappen.  
> Deze onderwerpen komen niet aan bod in de GDC (paper of presentatie).  
> Documentatie is te vinden onder `/docs/Extra/`
- Lack of Rate Limiting
- Misconfigured CORS - Cross-Origin Resource Sharing
- Insufficient Logging & Monitoring (malicious activities go unnoticed)
- Excessive Data Exposure
- BOLA - Broken Object Level Authorization

## Toegang tot webapp & API
### Webapp & frontend
- Safe App: https://safe-app.ian-chains.be/ - **inactive**
- Unsafe App: https://unsafe-app.ian-chains.be/ - **In Development**

---
### API
- Safe API: https://safe-api.ian-chains.be/ - **active, changes following**
    - OPEN API DOCS: https://safe-api.ian-chains.be/docs
- Unsafe API: https://unsafe-api.ian-chains.be/ - **In Development**
    - OPEN API DOCS: https://unsafe-api.ian-chains.be/docs

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
- [FastAPI](https://fastapi.tiangolo.com/) - Python API Framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python SQL Toolkit & Object Relational Mapper
- [Pydantic](https://pydantic.dev/) - Data Validation Library
- [Argon2](https://argon2-cffi.readthedocs.io/en/stable/) - Password Hashing Library
- [PyJWT](https://pyjwt.readthedocs.io/en/stable/) - JSON Web Token Library
- [Asyncpg](https://magicstack.github.io/asyncpg/current/) - Async PostgreSQL Client Library

### Development Libraries Frontend
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [DaisyUI](https://daisyui.com/) - Tailwind Component Library

### Software Tools
- [Visual Studio Code](https://code.visualstudio.com/) - Code Editor
- [HeidSQL](https://heidisql.com/) - SQL Client Software
- [Postman](https://www.postman.com/) - API Testing & Collaboration Software
- [HTTP Toolkit](https://httptoolkit.com/) - API Intercept Software
- [Github Copilot](https://github.com/features/copilot) - AI Code Assistant
