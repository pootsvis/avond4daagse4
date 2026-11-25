
// ==========================================
// AVOND4DAAGSE 2027
// ROUTEBEHEER - BACKEND API
// ==========================================

const A4DRouteAPI = (() => {

    const API_URL = "http://localhost:5278";

    // ======================================
    // 1. ALGEMENE API-AANVRAAG
    // ======================================

    async function request(path, options = {}) {

        let response;

        try {
            response = await fetch(
                API_URL + path,
                {
                    ...options,
                    credentials: "include",
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json",
                        ...options.headers
                    }
                }
            );
        } catch (error) {
            throw new Error(
                "Kan geen verbinding maken met de backend. " +
                "Controleer of deze draait op localhost:5278."
            );
        }

        if (!response.ok) {

            if (response.status === 401) {
                throw new Error(
                    "Je bent niet ingelogd. Log opnieuw in."
                );
            }

            if (response.status === 403) {
                throw new Error(
                    "Je hebt geen toestemming. " +
                    "Voor routebeheer is de rol Voorzitter nodig."
                );
            }

            const errorText = await response.text();

            console.error(
                "Route API fout:",
                response.status,
                errorText
            );

            throw new Error(
                "API-aanvraag mislukt (HTTP " +
                response.status + ")."
            );
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    }

    // ======================================
    // 2. ALLE ROUTES OPHALEN
    // ======================================

    async function getRoutes() {
        return await request("/api/Route");
    }

    // ======================================
    // 3. ÉÉN ROUTE OPHALEN
    // ======================================

    async function getRoute(id) {
        return await request("/api/Route/" + id);
    }

    // ======================================
    // 4. ROUTE TOEVOEGEN
    // ======================================

    async function createRoute(route) {

        return await request(
            "/api/Route",
            {
                method: "POST",
                body: JSON.stringify(route)
            }
        );
    }

    // ======================================
    // 5. ROUTE BEWERKEN
    // ======================================

    async function updateRoute(id, route) {

        return await request(
            "/api/Route/" + id,
            {
                method: "PUT",
                body: JSON.stringify(route)
            }
        );
    }

    // ======================================
    // 6. ROUTE VERWIJDEREN
    // ======================================

    async function deleteRoute(id) {

        return await request(
            "/api/Route/" + id,
            {
                method: "DELETE"
            }
        );
    }

    // ======================================
    // 7. EVENEMENTEN OPHALEN
    // ======================================

    async function getEvenementen() {
        return await request("/api/Evenement");
    }

    // ======================================
    // 8. FUNCTIES BESCHIKBAAR MAKEN
    // ======================================

    return {
        getRoutes,
        getRoute,
        createRoute,
        updateRoute,
        deleteRoute,
        getEvenementen
    };

})();
