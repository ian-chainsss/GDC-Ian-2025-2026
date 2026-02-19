async function logout() {
    const url = website + "logout"

    try {
        const response = await fetch(url, {
            method: "POST",
        });
        
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

async function register_user(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

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
        const response = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();
        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail || result.message || JSON.stringify(result)}`);
            return;
        }

        succes_modal(`${response.status}`, `${"ID: " + result.id + "<br>Username: " + result.username + "<br>Email: " + result.email}`);
        return;

    } catch (error) {
        console.error(error);
        error_modal('Network error', error.message || String(error));
    }
}