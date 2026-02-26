const website = "https://safe-api.ian-chains.be/";
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";

function get_csrf_token() {
    const match = document.cookie.match(new RegExp('(?:^|; )' + CSRF_COOKIE_NAME + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

async function ensure_csrf_token() {
    if (!get_csrf_token()) {
        try {
            const response = await fetch(website + "csrf-token", { credentials: 'include' });
            if (!response.ok) {
                console.error("Failed to fetch CSRF token:", response.status);
            }
        } catch (error) {
            console.error("Error fetching CSRF token:", error.message);
        }
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    await ensure_csrf_token();
});

async function error_modal(title, content) {
    document.getElementById("error-subtitle").innerHTML = title;
    document.getElementById("error-content").innerHTML = content;
    document.getElementById("error").showModal();
}

async function succes_modal(title, content) {
    document.getElementById("succes-subtitle").innerHTML = title;
    document.getElementById("succes-content").innerHTML = content;
    document.getElementById("succes").showModal();
}

async function test_connection() {
    const url = website

    try {
        const response = await fetch(url);
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

async function reset_database() {
    const url = website + "reset"
    
    try {
        await ensure_csrf_token();
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: { [CSRF_HEADER_NAME]: get_csrf_token() }
        });
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