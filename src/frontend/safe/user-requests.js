async function login_user(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    const form = document.getElementById('user-login-form');
    if (!form) return;

    const username_or_email_input = form.querySelector('input[type="text"]');
    const password_input = form.querySelector('input[type="password"]');

    const username_or_email = username_or_email_input ? username_or_email_input.value.trim() : '';
    const password = password_input ? password_input.value : '';

    const url = website + "login";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username_or_email, password }),
            credentials: 'include'
        });

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


async function logout() {
    const url = website + "logout"

    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: 'include'
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

        succes_modal(`${response.status}`, `${"User ID: " + result.id + "<br>Username: " + result.username + "<br>Email: " + result.email}`);
        return;

    } catch (error) {
        console.error(error);
        error_modal('Network error', error.message || String(error));
    }
}

async function get_user_data(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    const form = document.getElementById('user-data-form');
    if (!form) return;

    const userIdInput = form.querySelector('input[type="text"]');
    const userId = userIdInput ? userIdInput.value.trim() : '';

    const url = website + "users/" + userId;

    try {
        const response = await fetch(url, {
            method: "GET",
        });

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
