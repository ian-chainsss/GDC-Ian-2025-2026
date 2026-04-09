/**
 * Basisconfiguratie voor alle request-bestanden in de onveilige frontend.
 * Deze variant gebruikt geen CSRF-header en dient als demonstratie van minder veilige patronen.
 */
const website = "https://unsafe-api.ian-chains.be/";

/**
 * Toont een foutmelding in het error-modalvenster.
 *
 * Wanneer gebruikt:
 * - door alle request-functies bij HTTP-fouten of validatiefouten
 */
async function error_modal(title, content) {
    // Vul de titel en inhoud dynamisch zodat alle request-functies dezelfde modal kunnen hergebruiken.
    document.getElementById("error-subtitle").innerHTML = title;
    document.getElementById("error-content").innerHTML = content;

    // Open daarna de dialoog in de browser.
    document.getElementById("error").showModal();
}

/**
 * Toont een succesmelding in het succes-modalvenster.
 *
 * Wanneer gebruikt:
 * - door alle request-functies nadat een API-call is gelukt
 */
async function succes_modal(title, content) {
    // Zelfde patroon als error_modal, maar dan voor positieve feedback aan de gebruiker.
    document.getElementById("succes-subtitle").innerHTML = title;
    document.getElementById("succes-content").innerHTML = content;

    // Open het succesvenster zodra de tekst is ingevuld.
    document.getElementById("succes").showModal();
}

/**
 * Test of de API bereikbaar is en correct antwoordt.
 *
 * Wanneer gebruikt:
 * - handmatige testactie vanuit de interface
 *
 * Hoe werkt het:
 * - stuurt een GET naar de basis-URL
 * - toont response detail in fout- of succesmodal
 */
async function test_connection() {
    // Stap 1: gebruik de basis-URL als health-check endpoint.
    const url = website

    try {
        // Stap 2: voer de request uit.
        const response = await fetch(url);

        // Stap 3: parse de JSON-body voor detailboodschappen van de API.
        const result = await response.json();
        
        // Stap 4: niet-2xx => foutmodal tonen en stoppen.
        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail}`);
            return;
        }

        // Stap 5: 2xx => succesmodal tonen met serverdetail.
        succes_modal(`${response.status}`, `${result.detail}`);
        return;

    } catch (error) {
        console.error(error.message);
    }
}

/**
 * Herstelt de database via de API naar de standaardtoestand.
 *
 * Wanneer gebruikt:
 * - expliciete resetactie vanuit de interface
 *
 * Hoe werkt het:
 * - verstuurt een POST naar /reset met sessie-credentials
 * - let op: in deze unsafe variant wordt geen CSRF-header toegevoegd
 */
async function reset_database() {
    // Stap 1: endpoint bouwen.
    const url = website + "reset"
    
    try {
        // Stap 2: reset-request verzenden met sessiecookie.
        // Let op: hier ontbreekt bewust een CSRF-header (unsafe demonstratie).
        const response = await fetch(url, { method: "POST", credentials: "include" });

        // Stap 3: response verwerken en feedback tonen.
        const result = await response.json();

        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail}`);
            return;
        }
        succes_modal(`${response.status}`, `${result.detail}`);
    } catch (error) {
        console.error(error.message);
    }
}