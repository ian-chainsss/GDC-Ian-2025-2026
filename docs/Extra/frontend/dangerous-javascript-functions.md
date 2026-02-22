# Vermijd gebruik van gevaarlijke JavaScript functies in de frontend
JavaScript heeft enkele functies die beter helemaal niet gebruikt worden als ze afhankelijk zijn van gebruikersinput uit voorzorg voor de veiligheid, deze functies zijn gevaarlijk want ze kunnen XSS aanvallen mogelijk maken doordat ze beïnvloed kunnen worden door een gebruiker met kwade bedoelingen. Daarom is het belangrijk om deze functies met alle voorzichtigheid te gebruiken of zelfs helemaal niet te gebruiken in de JavaScript code van de frontend.  
De volgende functies kunnen beter vermeden worden voor de veiligheid:
```JS
- eval()
- new Function() constructor 
- setTimeout() met een string als argument
- setInterval() met een string als argument
- document.write() 
- document.writeln()
- element.innerHTML()
- element.outerHTML()
- element.insertAdjacentHTML()
- element.insertHTML()
- ifrmame.srcdoc
- element.setAttribute('src', 'javascript:...')
- element.onevent (zoals onclick, onload, etc.)
```

Gebruik in plaats van deze functies veilige alternatieven, zoals:
```JS
- JSON.parse() in plaats van eval() voor het verwerken van JSON data
- textContent() of innerText() in plaats van innerHTML() of outerHTML() voor het toevoegen van tekst aan een element
- Directe DOM manipulatie in plaats van innerHTML() of outerHTML()
- Event listeners toevoegen via addEventListener() in plaats van inline event handlers
- Gebruik van veilige templating engines die automatisch ontsnappen van gebruikersinput ondersteunen
```