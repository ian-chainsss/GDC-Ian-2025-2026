# Prevent SQL injection by using ORMs
## Doel
Het doel van deze documentatie is om uit te leggen hoe je SQL-injectie kunt voorkomen door gebruik te maken van ORMs (Object-Relational Mappers) in je API systemen. SQL-injectie is een veelvoorkomende beveiligingskwetsbaarheid waarbij een aanvaller kwaadaardige SQL-code kan injecteren in een query, wat kan leiden tot ongeautoriseerde toegang tot de database of zelfs het verwijderen van gegevens. Door gebruik te maken van ORMs, die automatisch parameter binding toepassen, kun je deze kwetsbaarheid effectief voorkomen en de veiligheid van je applicatie verbeteren.

## Reden
De beveiligheid van je API is van groot belang, vooral als het gaat om het omgaan met gevoelige gegevens in een database. SQL-injectie kan ernstige gevolgen hebben, zoals datalekken, gegevensverlies of zelfs volledige controle over de database door een aanvaller. Door ORMs te gebruiken, kun je ervoor zorgen dat gebruikersinvoer niet direct in SQL-query's wordt geïnjecteerd, waardoor de kans op SQL-injectie aanzienlijk wordt verminderd. Het is een best practice om altijd ORMs te gebruiken of, als je toch SQL-query's schrijft, altijd parameter binding toe te passen om de veiligheid van je applicatie te waarborgen.

## Omgeving
Deze uitleg is specifiek voor API systemen die gebouwd zijn in Python met FastAPI en SQLAlchemy als ORM, maar de principes kunnen ook worden toegepast in andere programmeertalen en frameworks. Het gebruik van ORMs (Object-Relational Mappers) is een veelgebruikte aanpak om SQL-injectie te voorkomen, omdat ORMs automatisch parameter binding toepassen en voorkomen dat gebruikersinvoer direct in SQL-query's wordt geïnjecteerd.

Als database wordt er in dit voorbeeld gebruik gemaakt van PostgreSQL, maar de principes zijn ook toepasbaar op andere databases zoals MySQL, SQLite, etc. Enkel kunnen de initele configuratie en setup voor het verbinden met de database verschillen afhankelijk van welke database je gebruikt.

Je kan er ook voorkiezen om wel gewoon SQL queries te schrijven, maar dan is het belangrijk om altijd gebruik te maken van parameter binding in plaats van string concatenatie.
```python
from fastapi import FastAPI
import sqlite3

app = FastAPI()

@app.get("/users/{user_id}")
def get_user(user_id: int):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    # Gebruik parameter binding in plaats van string concatenatie
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user
```

## Stappen
### Declarative Base maken
1. Maak een declarative base aan met SQLAlchemy, wat de basis zal zijn voor het definiëren van je database modellen.
```python
from sqlalchemy.orm import declarative_base
Base = declarative_base()
```

### Models Definiëren
1. Definieer je database modellen met behulp van SQLAlchemy. Deze modellen vertegenwoordigen de tabellen in je database en bevatten de velden die je wilt opslaan.
```python
from sqlalchemy import Column, Integer, String

class User(Base): #de declarative base die we eerder hebben gemaakt gebruiken we hier als basis voor ons model
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
```


### Database Verbinding Maken
1. Maak een verbinding met je database en configureer de SQLAlchemy engine en sessionmaker.  
Dit is voor een asynchrone setup, maar je kan ook een synchrone setup maken afhankelijk van je behoeften.
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"
engine = create_async_engine(
    DATABASE_URL, # Hier geef je de URL van je database op, inclusief het type database, gebruikersnaam, wachtwoord, host en databasenaam
    echo=True, # Optioneel: zet echo op True om SQL-query's te loggen voor debugging doeleinden
    pool_size=10, # Optioneel: stel de grootte van de connection pool in
    max_overflow=20, # Optioneel: stel het maximale aantal verbindingen in dat kan worden gemaakt bovenop de pool_size
    pool_pre_ping=True # Optioneel: stel pool_pre_ping in op True om te controleren of verbindingen nog steeds geldig zijn voordat ze worden gebruikt
)

async_session = async_sessionmaker(
    engine,  # Hier geef je de engine op die we eerder hebben gemaakt om verbinding te maken met de database
    expire_on_commit=False, # Optioneel: stel expire_on_commit in op False om te voorkomen dat objecten worden vervallen na een commit, zodat ze nog steeds toegankelijk zijn zonder opnieuw te hoeven laden vanuit de database
    class_=AsyncSession, # Hier geef je aan dat je een asynchrone session wilt gebruiken
    autoflush=False, # Optioneel: stel autoflush in op False om te voorkomen dat wijzigingen automatisch worden geflusht naar de database voordat een commit wordt uitgevoerd
    autocommit=False # Optioneel: stel autocommit in op False om expliciet committen van transacties te vereisen
)
```

### CRUD Operaties Uitvoeren met ORM
1. Gebruik de SQLAlchemy ORM om CRUD (Create, Read, Update, Delete) operaties uit te voeren op je database modellen.
```python
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI()

async def get_db():
    async with async_session() as session: # Hier maken we een nieuwe database sessie aan met behulp van de async_session die we eerder hebben geconfigureerd
        yield session

@app.post("/users/")
async def create_user(user: User, db: AsyncSession = Depends(get_db)): # Hier gebruiken we de get_db dependency om een database sessie te verkrijgen
    db.add(user) # Voeg het nieuwe user object toe aan de database sessie
    await db.commit() # Commit de transactie om de wijzigingen op te slaan in de database
    await db.refresh(user) # Ververs het user object om de gegenereerde id en andere velden bij te werken na het committen
    return user
```