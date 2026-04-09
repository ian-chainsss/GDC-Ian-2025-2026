/**
 * Logt een gebruiker in met gebruikersnaam/e-mail en wachtwoord.
 *
 * Wanneer gebruikt:
 * - bij submit van het loginformulier
 *
 * Hoe werkt het:
 * - leest formulierwaarden
 * - vraagt eerst een CSRF-token op
 * - verstuurt JSON naar POST /login
 * - toont teruggekregen gebruikersinfo in een modal
 */
async function login_user(event) {
    // Stap 1: voorkom standaard formuliergedrag zodat we de flow volledig via JS afhandelen.
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    // Stap 2: haal formulier en velden op uit de DOM.
    const form = document.getElementById('user-login-form');
    if (!form) return;

    const username_or_email_input = form.querySelector('input[type="text"]');
    const password_input = form.querySelector('input[type="password"]');

    const username_or_email = username_or_email_input ? username_or_email_input.value.trim() : '';
    const password = password_input ? password_input.value : '';

    const url = website + "login";

    try {
        // Stap 3: zorg dat CSRF-cookie/token beschikbaar is.
        await ensure_csrf_token();

        // Stap 4: verstuur credentials als JSON met sessiecookie.
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: get_csrf_token()
            },
            body: JSON.stringify({ username_or_email, password }),
            credentials: 'include'
        });

        // Stap 5: verwerk de response en toon resultaat.
        const result = await response.json();
        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail || result.message || JSON.stringify(result)}`);
            return;
        }

        succes_modal(`${response.status}`, `${"User ID: " + result.id + "<br>Username: " + result.username + "<br>Email: " + result.email}`);
        return;
    } catch (error) {
        console.error(error);
        error_modal('Network error', error.message || String(error));
    }
    
}


/**
 * Logt de huidige sessie uit.
 *
 * Wanneer gebruikt:
 * - bij klik op logout in de interface
 *
 * Hoe werkt het:
 * - zorgt dat een CSRF-token beschikbaar is
 * - verstuurt POST /logout met credentials
 */
async function logout() {
    // Stap 1: endpoint bouwen.
    const url = website + "logout"

    try {
        // Stap 2: token verzekeren en beveiligde logout uitvoeren.
        await ensure_csrf_token();
        const response = await fetch(url, {
            method: "POST",
            credentials: 'include',
            headers: { [CSRF_HEADER_NAME]: get_csrf_token() }
        });
        
        // Stap 3: feedback verwerken.
        const result = await response.json();
        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail}`);
            return;
        }

        succes_modal(`${response.status}`, `${result.detail}`);
        return;

    } catch (error) {
        console.error(error.message);
    }
}

/**
 * Registreert een nieuwe gebruiker.
 *
 * Wanneer gebruikt:
 * - bij submit van het registratieformulier
 *
 * Hoe werkt het:
 * - leest username, email en password uit het formulier
 * - haalt CSRF-token op indien nodig
 * - verstuurt JSON naar POST /users
 */
async function register_user(event) {
    // Stap 1: voorkom standaard formuliergedrag.
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    // Stap 2: lees registratievelden uit het formulier.
    const form = document.getElementById('user-registration-form');
    if (!form) return;

    const usernameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    const url = website + "users";

    try {
        // Stap 3: token klaarzetten voor deze muterende request.
        await ensure_csrf_token();

        // Stap 4: verstuur nieuwe gebruiker als JSON.
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: get_csrf_token()
            },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include'
        });

        // Stap 5: response interpreteren en status tonen.
        const result = await response.json();
        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail || result.message || JSON.stringify(result)}`);
            return;
        }

        succes_modal(`${response.status}`, `${"User ID: " + result.id + "<br>Username: " + result.username + "<br>Email: " + result.email}`);
        return;

    } catch (error) {
        console.error(error);
        error_modal('Network error', error.message || String(error));
    }
}

/**
 * Haalt de gegevens van een specifieke gebruiker op via user-id.
 *
 * Wanneer gebruikt:
 * - bij submit van het user-data formulier
 *
 * Hoe werkt het:
 * - leest de user-id uit het formulier
 * - voert GET /users/{id} uit
 * - toont uitgebreide metadata in het succesmodal
 */
async function get_user_data(event) {
    // Stap 1: voorkom standaard submit-flow.
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    // Stap 2: lees user-id uit de form-input.
    const form = document.getElementById('user-data-form');
    if (!form) return;

    const userIdInput = form.querySelector('input[type="text"]');
    const userId = userIdInput ? userIdInput.value.trim() : '';

    const url = website + "users/" + userId;

    try {
        // Stap 3: haal user-data op via GET.
        const response = await fetch(url, {
            method: "GET",
        });

        // Stap 4: parse resultaat en toon detailinformatie.
        const result = await response.json();
        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail || result.message || JSON.stringify(result)}`);
            return;
        }

        succes_modal(`${response.status}`, `${
            "User ID: " + result.id
            + "<br>User Role: " + result.role
            + "<br>Username: " + result.username
            + "<br>Email: " + result.email
            + "<br>Updated At: " + new Date(result.updated_at).toLocaleString()
            + "<br>Created At: " + new Date(result.created_at).toLocaleString()
            + "<br>Password Hash: " + result.password_hash}`);
        return;
    } catch (error) {
        console.error(error);
        error_modal('Network error', error.message || String(error));
    }
}
