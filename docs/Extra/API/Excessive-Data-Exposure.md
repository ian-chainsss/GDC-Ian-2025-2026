# Aangeven welke data er verwacht wordt als input en output
## Doel
Het aangeven bij elke API endpoint welke data er verwacht wordt als input en wat de output zou kunnen zijn.
## Reden
### Documentatie
Het is altijd goed voor documententatie doeleiden als je met meerdere personen aan een project werkt, dat je aangeeft wat elke API endpoint van input data verwacht en wat de output data zal zijn. Dit maakt het makkelijker voor andere ontwikkelaars om te begrijpen hoe ze de API moeten gebruiken en wat ze kunnen verwachten als resultaat.  
### Duidelijkheid
Dit voorkomt ook misverstanden en fouten bij het gebruik van de API, omdat iedereen duidelijk weet wat er verwacht wordt.
### Beveiliging
Dit voorkomt ook dat er bij de output te veel data wordt teruggegeven, wat gevaarlijk kan zijn voor de beveiliging van de data **Excessive Data Exposure**. Je wilt immers geen gevoelige informatie zoals hashed wachtwoorden teruggeven als output.
## Omgeving
De uitleg in deze documentatie is speicifiek voor API systemen die gebouw zijn in Python met FastAPI, maar de principes kunnen ook worden toegepast in andere programmeertalen en frameworks. Er wordt hierbij vooral gebruik gemaakt van Pydantic modellen om de input en output data te definiëren.
## Stappen
### Input Data Definiëren
1. Maak een Pydantic model aan dat de structuur van de input data definieert. Dit model bevat de velden die verwacht worden als input, samen met hun types en eventuele validatie regels.
```python
from pydantic import BaseModel
class UserInput(BaseModel):
    username: str
    email: str
    password: str
```
2. Je kan extra aangeven wat voor soort datatype er verwacht wordt of als het optioneel is, door gebruik te maken van `Optional` en `Field` van Pydantic.
```python
from typing import Optional
from pydantic import BaseModel, EmailStr,

class UserInput(BaseModel):
    username: str
    email: EmailStr
    password: str
    age: Optional[int]
```
3. Gebruik dit model in je API endpoint om aan te geven dat deze data verwacht wordt als input.
```python
from fastapi import FastAPI
app = FastAPI()
@app.post("/users/")
def create_user(user: UserInput): # Hier geef je aan dat er een `UserInput` model verwacht wordt als input
    # Hier kan je de logica toevoegen om de gebruiker aan te maken
    return {"message": "User created successfully"}
```

### Output Data Definiëren
1. Maak een Pydantic model aan dat de structuur van de output data definieert. Dit model bevat de velden die verwacht worden als output, samen met hun types.
```python
from pydantic import BaseModel
class UserOutput(BaseModel):
    id: int
    username: str
    email: str
```
2. Vermeld eventueel dat je een ORM gebruikt, zodat je automatisch de output data kan genereren op basis van je database modellen.  
Vroeger noemde dit `orm_mode` en tegenwoordig is dit `from_attributes`, maar het principe blijft hetzelfde.
```python
from pydantic import BaseModel
class UserOutput(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True
```
3. Gebruik dit model in je API endpoint om aan te geven dat deze data zal worden teruggegeven als output.
```python
from fastapi import FastAPI
app = FastAPI()
@app.get("/users/{user_id}", response_model=UserOutput) # response_model geeft aan dat `UserOutput` model de output data definieert
def get_user(user_id: int):
    # Hier kan je de logica toevoegen om de gebruiker op te halen
    user = get_user_from_database(user_id) # Stel dat deze functie een ORM model teruggeeft
    return user # Omdat we `from_attributes` hebben ingesteld, zal FastAPI automatisch de output data genereren op basis van het `UserOutput` model
```
