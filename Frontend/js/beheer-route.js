// ==========================================
// AVOND4DAAGSE 2027
// ROUTEBEHEER - BACKEND INTEGRATIE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const STORAGE_KEY = "a4d-routebeheer-demo-v1";
    const METADATA_KEY = "a4d-route-metadata-v1";
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const MAX_POINTS = 5000;

    const list = $("brRouteList");
    const search = $("brSearch");
    const eveningFilter = $("brEveningFilter");
    const distanceFilter = $("brDistanceFilter");
    const filterForm = $("brFilters");

    const dialog = $("brDialog");
    const form = $("brRouteForm");

    const nameInput = $("brRouteName");
    const eveningInput = $("brRouteEvening");
    const distanceInput = $("brRouteDistance");
    const startInput = $("brRouteStart");
    const eventInput = $("brRouteEvent");
    const timeInput = $("brRouteTime");
    const checkpointInput = $("brRouteCheckpoint");

    const fileInput = $("brGpxFile");
    const removeGpxInput = $("brRemoveGpx");
    const removeGpxWrap = $("brRemoveGpxWrap");
    const existingGpx = $("brExistingGpx");
    const formStatus = $("brFormStatus");
    const saveButton = $("brSaveRoute");

    const selectedDetails = $("brSelectedDetails");
    const mapEmpty = $("brMapEmpty");
    const mapEmptyText = $("brMapEmptyText");
    const feedback = $("brFeedback");

    let routes = [];
    let evenementen = [];

    let selectedId = null;
    let editingId = null;

    let map = null;
    let routeLayer = null;

    let busy = false;
    let apiReady = false;

    // ======================================
    // 1. LOKALE OPSLAG
    // ======================================

    function validPoints(points) {

        if (!Array.isArray(points)) return [];

        return points.filter(point =>
            Array.isArray(point) &&
            point.length === 2 &&
            Number.isFinite(point[0]) &&
            Number.isFinite(point[1]) &&
            Math.abs(point[0]) <= 90 &&
            Math.abs(point[1]) <= 180
        ).slice(0, MAX_POINTS);
    }

    function loadRoutes() {

        try {

            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            if (!Array.isArray(saved)) return [];

            return saved.filter(route =>
                route &&
                typeof route.id === "string" &&
                typeof route.name === "string" &&
                [1, 2, 3, 4].includes(route.evening) &&
                [5, 10].includes(route.distance)
            ).map(route => ({
                ...route,
                source: "local",
                points: validPoints(route.points)
            }));

        } catch (error) {

            console.error(error);
            return [];
        }
    }

    function saveRoutes() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    routes.filter(route =>
                        route.source === "local"
                    )
                )
            );

            return true;

        } catch (error) {

            console.error(error);
            return false;
        }
    }

    function loadMetadata() {

        try {

            return JSON.parse(
                localStorage.getItem(METADATA_KEY) || "{}"
            ) || {};

        } catch {

            return {};
        }
    }

    function saveRouteMetadata(routeId, route) {

        try {

            const metadata = loadMetadata();

            metadata[routeId] = {
                evening: route.evening,
                start: route.start,
                points: route.points
            };

            localStorage.setItem(
                METADATA_KEY,
                JSON.stringify(metadata)
            );

            return true;

        } catch (error) {

            console.error(error);
            return false;
        }
    }

    function deleteRouteMetadata(routeId) {

        try {

            const metadata = loadMetadata();

            delete metadata[routeId];

            localStorage.setItem(
                METADATA_KEY,
                JSON.stringify(metadata)
            );

            return true;

        } catch (error) {

            console.error(error);
            return false;
        }
    }

    // ======================================
    // 2. API GEGEVENS OPHALEN
    // ======================================

   function mapDatabaseRoute(route) {

    return {
        id: "db-" + route.routeId,
        routeId: route.routeId,
        name: route.naam,
        distance: Number(route.afstand),
        evening: route.wandelavond ?? null,
        start: route.startlocatie ?? "",
        starttijd: route.starttijd,
        controlepost: route.controlepost,
        evenementId: route.evenementId,
        evenementNaam: route.evenementNaam,
        points: validPoints(route.gpxPunten),
        source: "database"
    };
}

    async function loadEvenementen() {

        evenementen = await A4DRouteAPI.getEvenementen();

        eventInput.replaceChildren(
            new Option("Selecteer een evenement", "")
        );

        evenementen.forEach(evenement => {

            eventInput.add(
                new Option(
                    evenement.naam,
                    evenement.evenementId
                )
            );
        });
    }

    async function initializeRoutes() {

        apiReady = false;

        $("brAddRoute").disabled = true;

        routes = loadRoutes();

        render();

        const errors = [];

        try {

            const databaseRoutes =
                await A4DRouteAPI.getRoutes();

            routes = [
                ...routes,
                ...databaseRoutes.map(mapDatabaseRoute)
            ];

        } catch (error) {

            errors.push(error.message);
        }

        try {

            await loadEvenementen();

        } catch (error) {

            errors.push(
                "Evenementen ophalen mislukt: " +
                error.message
            );
        }

        apiReady = errors.length === 0;

        $("brAddRoute").disabled = !apiReady;

        render();

        feedback.textContent = apiReady
            ? "Routes opgehaald uit de database."
            : errors.join(" ");
    }

    // ======================================
    // 3. GPX IMPORTEREN
    // ======================================

    async function readGpx(file) {

        if (file.size > MAX_FILE_SIZE) {

            throw new Error(
                "Het GPX-bestand is groter dan 2 MB."
            );
        }

        if (!file.name.toLowerCase().endsWith(".gpx")) {

            throw new Error(
                "Selecteer een geldig GPX-bestand."
            );
        }

        const xml = await file.text();

        const documentXml = new DOMParser()
            .parseFromString(xml, "application/xml");

        if (
            documentXml.getElementsByTagName(
                "parsererror"
            ).length
        ) {

            throw new Error(
                "Het GPX-bestand bevat ongeldige XML."
            );
        }

        let nodes = [
            ...documentXml.getElementsByTagNameNS(
                "*", "trkpt"
            )
        ];

        if (!nodes.length) {

            nodes = [
                ...documentXml.getElementsByTagNameNS(
                    "*", "rtept"
                )
            ];
        }

        if (nodes.length < 2) {

            throw new Error(
                "Het GPX-bestand bevat onvoldoende routepunten."
            );
        }

        if (nodes.length > MAX_POINTS) {

            throw new Error(
                "Maximaal 5.000 routepunten toegestaan."
            );
        }

        const points = validPoints(
            nodes.filter(node =>
                node.hasAttribute("lat") &&
                node.hasAttribute("lon") &&
                node.getAttribute("lat").trim() !== "" &&
                node.getAttribute("lon").trim() !== ""
            ).map(node => [
                Number(
                    Number(node.getAttribute("lat"))
                        .toFixed(6)
                ),
                Number(
                    Number(node.getAttribute("lon"))
                        .toFixed(6)
                )
            ])
        );

        if (points.length < 2) {

            throw new Error(
                "Geen bruikbare routepunten gevonden."
            );
        }

        return points;
    }

    // ======================================
    // 4. GPX AFSTAND BEREKENEN
    // ======================================

    function calculateDistance(points) {

        let total = 0;

        const radians = value =>
            value * Math.PI / 180;

        for (let i = 1; i < points.length; i++) {

            const first = points[i - 1];
            const second = points[i];

            const lat = radians(
                second[0] - first[0]
            );

            const lng = radians(
                second[1] - first[1]
            );

            const a =
                Math.sin(lat / 2) ** 2 +
                Math.cos(radians(first[0])) *
                Math.cos(radians(second[0])) *
                Math.sin(lng / 2) ** 2;

            total += 6371 * 2 *
                Math.asin(
                    Math.min(1, Math.sqrt(a))
                );
        }

        return total;
    }

    function formatDistance(points) {

        if (points.length < 2) return "Geen GPX";

        return calculateDistance(points)
            .toLocaleString("nl-NL", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + " km";
    }

    // ======================================
    // 5. INTERACTIEVE KAART
    // ======================================

    if (typeof window.L !== "undefined") {

        map = L.map("brMap", {
            scrollWheelZoom: false
        }).setView([52.1326, 5.2913], 8);

        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        ).addTo(map);
    }

    function showMap(points) {

        if (map && routeLayer) {

            map.removeLayer(routeLayer);
            routeLayer = null;
        }

        if (!map) {

            mapEmpty.hidden = false;

            mapEmptyText.textContent =
                "De kaart is momenteel niet beschikbaar.";

            return;
        }

        if (points.length < 2) {

            mapEmpty.hidden = false;

            map.setView([52.1326, 5.2913], 8);

            return;
        }

        mapEmpty.hidden = true;

        routeLayer = L.featureGroup();

        const polyline = L.polyline(points, {
            color: "#248351",
            weight: 5,
            opacity: 0.9
        });

        routeLayer.addLayer(polyline);

        L.circleMarker(points[0], {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#1c7847",
            fillOpacity: 1
        })
            .bindPopup("Start van de GPX-route")
            .addTo(routeLayer);

        L.circleMarker(points[points.length - 1], {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#c46c29",
            fillOpacity: 1
        })
            .bindPopup("Einde van de GPX-route")
            .addTo(routeLayer);

        routeLayer.addTo(map);

        map.fitBounds(polyline.getBounds(), {
            padding: [30, 30],
            maxZoom: 16
        });

        setTimeout(() => map.invalidateSize(), 100);
    }

    // ======================================
    // 6. FILTERS
    // ======================================

    function eveningLabel(route) {

        return route.evening
            ? "Avond " + route.evening
            : "Wandelavond onbekend";
    }

    function getFilteredRoutes() {

        const query = search.value
            .trim()
            .toLocaleLowerCase("nl-NL");

        return routes.filter(route => {

            const text = [
                route.name,
                route.start,
                route.controlepost
            ].join(" ").toLocaleLowerCase("nl-NL");

            return (
                text.includes(query) &&
                (
                    eveningFilter.value === "all" ||
                    String(route.evening) === eveningFilter.value
                ) &&
                (
                    distanceFilter.value === "all" ||
                    String(route.distance) === distanceFilter.value
                )
            );
        });
    }

    // ======================================
    // 7. STATISTIEKEN
    // ======================================

    function updateStatistics() {

        const withGpx = routes.filter(
            route => route.points.length >= 2
        ).length;

        $("brTotalRoutes").textContent =
            routes.length;

        $("brRoutesWithGpx").textContent =
            withGpx;

        $("brRoutesWithoutGpx").textContent =
            routes.length - withGpx;
    }

    // ======================================
    // 8. ROUTEKAARTEN
    // ======================================

    function createRouteCard(route) {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "br-route-card";
        button.dataset.id = route.id;

        button.classList.toggle(
            "is-selected",
            route.id === selectedId
        );

        button.setAttribute(
            "aria-pressed",
            String(route.id === selectedId)
        );

        const top = document.createElement("div");
        top.className = "br-card-top";

        const heading = document.createElement("h3");
        heading.textContent = route.name;

        const badge = document.createElement("span");

        const hasGpx = route.points.length >= 2;

        badge.className = hasGpx
            ? "br-card-badge"
            : "br-card-badge is-missing";

        badge.textContent = hasGpx
            ? "GPX aanwezig"
            : "GPX ontbreekt";

        top.append(heading, badge);

        const meta = document.createElement("div");
        meta.className = "br-card-meta";

        [
            eveningLabel(route),
            route.distance + " km",
            route.start || "Startlocatie onbekend",
            route.source === "local"
                ? "Lokaal concept"
                : "Database"
        ].forEach(value => {

            const span = document.createElement("span");

            span.textContent = value;

            meta.appendChild(span);
        });

        button.append(top, meta);

        button.addEventListener("click", () => {

            selectedId = route.id;
            render();
        });

        return button;
    }

    function renderList() {

        const filtered = getFilteredRoutes();

        if (!filtered.some(
            route => route.id === selectedId
        )) {

            selectedId = null;
        }

        $("brResultCount").textContent =
            filtered.length +
            (filtered.length === 1 ? " route" : " routes");

        list.replaceChildren();

        if (!filtered.length) {

            const empty = document.createElement("div");
            empty.className = "br-empty";

            const title = document.createElement("strong");
            const message = document.createElement("p");

            title.textContent = routes.length
                ? "Geen routes gevonden"
                : "Nog geen routes beschikbaar";

            message.textContent = routes.length
                ? "Pas de zoekopdracht of filters aan."
                : "Voeg een route toe of controleer de verbinding.";

            empty.append(title, message);

            list.appendChild(empty);

            return;
        }

        filtered.sort((a, b) =>
            (a.evening ?? 5) - (b.evening ?? 5) ||
            a.distance - b.distance ||
            a.name.localeCompare(b.name, "nl-NL")
        ).forEach(route => {

            list.appendChild(
                createRouteCard(route)
            );
        });
    }

    // ======================================
    // 9. ROUTEDETAILS
    // ======================================

    function getSelectedRoute() {

        return routes.find(
            route => route.id === selectedId
        ) || null;
    }

    function addDetail(id, label) {

        if ($(id)) return;

        const details = selectedDetails
            .querySelector(".br-details");

        const row = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");

        dt.textContent = label;
        dd.id = id;
        dd.textContent = "—";

        row.append(dt, dd);

        details.appendChild(row);
    }

    addDetail("brDetailTime", "Starttijd");
    addDetail("brDetailCheckpoint", "Controlepost");
    addDetail("brDetailEvent", "Evenement");
    addDetail("brDetailStorage", "Opslag");

    function renderSelectedRoute() {

        const route = getSelectedRoute();

        if (!route) {

            $("brMapTitle").textContent =
                "Interactieve kaart";

            $("brMapBadge").textContent =
                "Geen route geselecteerd";

            selectedDetails.hidden = true;

            mapEmptyText.textContent =
                "Selecteer een route met GPX-bestand.";

            showMap([]);

            return;
        }

        const hasGpx = route.points.length >= 2;

        $("brMapTitle").textContent =
            route.name;

        $("brMapBadge").textContent = hasGpx
            ? "GPX beschikbaar"
            : "GPX ontbreekt";

        $("brDetailEvening").textContent =
            eveningLabel(route);

        $("brDetailDistance").textContent =
            route.distance + " km";

        $("brDetailStart").textContent =
            route.start || "Niet ingevuld";

        $("brDetailGpxDistance").textContent =
            formatDistance(route.points);

        $("brDetailTime").textContent =
            route.starttijd
                ? route.starttijd.slice(0, 5)
                : "Niet ingevuld";

        $("brDetailCheckpoint").textContent =
            route.controlepost || "Niet ingevuld";

        const evenement = evenementen.find(item =>
            Number(item.evenementId) ===
            Number(route.evenementId)
        );

        $("brDetailEvent").textContent =
            evenement?.naam ||
            route.evenementNaam ||
            (route.evenementId
                ? "Evenement " + route.evenementId
                : "Niet gekoppeld");

        $("brDetailStorage").textContent =
            route.source === "database"
                ? "PostgreSQL-database"
                : "Lokaal concept";

        $("brDownloadGpx").disabled = !hasGpx;

        $("brEditRoute").disabled =
            busy || (
                route.source === "database" &&
                !apiReady
            );

        $("brDeleteRoute").disabled =
            busy || (
                route.source === "database" &&
                !apiReady
            );

        selectedDetails.hidden = false;

        if (!hasGpx) {

            mapEmptyText.textContent =
                "Deze route heeft nog geen GPX-bestand. " +
                "Klik op Bewerken om er een toe te voegen.";
        }

        showMap(route.points);
    }

    function render() {

        updateStatistics();
        renderList();
        renderSelectedRoute();
    }

    // ======================================
    // 10. FORMULIER
    // ======================================

    eveningInput.prepend(
        new Option("Wandelavond onbekend", "")
    );

    eveningInput.required = false;

    function openRouteForm(route = null) {

        if (busy) return;

        if (
            (!route || route.source === "database") &&
            !apiReady
        ) return;

        form.reset();

        editingId = route ? route.id : null;

        formStatus.textContent = "";
        existingGpx.hidden = true;
        removeGpxWrap.hidden = true;

        const databaseForm =
            !route || route.source === "database";

        [
            eventInput,
            timeInput,
            checkpointInput
        ].forEach(input => {

            input.disabled = !databaseForm;
            input.required = databaseForm;
            if (input === eventInput &&
    route?.source === "database") {

    input.disabled = true;
}

            input.closest("label").hidden =
                !databaseForm;
        });

        if (route) {

            $("brDialogTitle").textContent =
                "Route bewerken";

            nameInput.value = route.name;

            eveningInput.value =
                route.evening ?? "";

            distanceInput.value =
                String(route.distance);

            startInput.value = route.start || "";

            eventInput.value =
                route.evenementId ?? "";

            timeInput.value =
                route.starttijd
                    ? route.starttijd.slice(0, 5)
                    : "";

            checkpointInput.value =
                route.controlepost ?? "";

            if (route.points.length >= 2) {

                existingGpx.hidden = false;

                existingGpx.textContent =
                    "Bestaande GPX-route: " +
                    route.points.length +
                    " punten (" +
                    formatDistance(route.points) +
                    ")";

                removeGpxWrap.hidden = false;
            }

        } else {

            $("brDialogTitle").textContent =
                "Route toevoegen";

            eveningInput.value = "1";
        }

        dialog.showModal();
        nameInput.focus();
    }

    $("brAddRoute").addEventListener(
        "click",
        () => openRouteForm()
    );

    $("brEditRoute").addEventListener(
        "click",
        () => {

            const route = getSelectedRoute();

            if (route) openRouteForm(route);
        }
    );

    function closeRouteForm() {

        if (busy) return;

        dialog.close();
        editingId = null;
    }

    $("brCloseDialog").addEventListener(
        "click", closeRouteForm
    );

    $("brCancelDialog").addEventListener(
        "click", closeRouteForm
    );

    dialog.addEventListener("cancel", event => {

        if (busy) event.preventDefault();
    });

    dialog.addEventListener("close", () => {

        editingId = null;
    });

    // ======================================
    // 11. POST EN PUT
    // ======================================

    form.addEventListener("submit", async event => {

        event.preventDefault();

        if (busy || !form.reportValidity()) return;

        busy = true;
        saveButton.disabled = true;
        formStatus.textContent = "";

        try {

            const existing = routes.find(
                route => route.id === editingId
            );

            const localOnly =
                existing?.source === "local";

            let points = existing
                ? [...existing.points]
                : [];

            if (removeGpxInput.checked) {

                points = [];
            }

            if (fileInput.files[0]) {

                points = await readGpx(
                    fileInput.files[0]
                );
            }

            const route = {
                ...existing,
                name: nameInput.value.trim(),
                evening: eveningInput.value
                    ? Number(eveningInput.value)
                    : null,
                distance: Number(distanceInput.value),
                start: startInput.value.trim(),
                points
            };

            if (!route.name) {

                throw new Error(
                    "Vul een routenaam in."
                );
            }

            if (
                localOnly &&
                ![1, 2, 3, 4].includes(route.evening)
            ) {

                throw new Error(
                    "Selecteer een wandelavond voor het lokale concept."
                );
            }

            let message;

            if (localOnly) {

                const updated = routes.map(item =>
                    item.id === existing.id
                        ? route
                        : item
                );

                const previous = routes;

                routes = updated;

                if (!saveRoutes()) {

                    routes = previous;

                    throw new Error(
                        "Het lokale concept kon niet worden opgeslagen."
                    );
                }

                message = "Lokaal concept bijgewerkt.";

            } else {

                if (!apiReady) {

                    throw new Error(
                        "De backend is niet beschikbaar."
                    );
                }

                const payload = {
    naam: route.name,
    afstand: route.distance,
    starttijd: timeInput.value + ":00",
    controlepost: checkpointInput.value.trim(),
    evenementId: Number(eventInput.value),

    wandelavond: route.evening,
    startlocatie: route.start,
    gpxPunten: route.points
};

                if (
                    !payload.evenementId ||
                    !payload.controlepost ||
                    !timeInput.value
                ) {

                    throw new Error(
                        "Vul alle verplichte routegegevens in."
                    );
                }

                let routeId;

                if (existing) {

                    // PUT: BESTAANDE ROUTE

                    routeId = existing.routeId;

                    await A4DRouteAPI.updateRoute(
                        routeId,
                        payload
                    );

                    message = "Route bijgewerkt in de database.";

                } else {

                    // POST: NIEUWE ROUTE

                    const confirmed = window.confirm(
                        "Deze route wordt opgeslagen in de database " +
                        "en kan zichtbaar worden op de publieke website.\n\n" +
                        "Wil je doorgaan?"
                    );

                    if (!confirmed) return;

                    const created =
                        await A4DRouteAPI.createRoute(payload);

                    routeId = created?.routeId;

                    if (!routeId) {

                        dialog.close();

                        await initializeRoutes();

                        feedback.textContent =
                            "POST is uitgevoerd, maar het route-ID " +
                            "ontbreekt in het antwoord. Controleer " +
                            "het overzicht voordat je opnieuw opslaat.";

                        return;
                    }

                    message = "Route toegevoegd aan de database.";
                }

                route.id = "db-" + routeId;
                route.routeId = routeId;
                route.source = "database";
                route.starttijd = payload.starttijd;
                route.controlepost = payload.controlepost;
                route.evenementId = payload.evenementId;

                route.evenementNaam =
                    evenementen.find(item =>
                        Number(item.evenementId) ===
                        payload.evenementId
                    )?.naam || "";

                
                if (existing) {

                    routes = routes.map(item =>
                        item.id === existing.id
                            ? route
                            : item
                    );

                } else {

                    routes.push(route);
                }
            }

            selectedId = route.id;

            dialog.close();

            filterForm.reset();

            render();

            feedback.textContent = message;

        } catch (error) {

            formStatus.textContent =
                error.message ||
                "Opslaan mislukt.";

        } finally {

            busy = false;
            saveButton.disabled = false;

            render();
        }
    });

    // ======================================
    // 12. DELETE
    // ======================================

    $("brDeleteRoute").addEventListener(
        "click",
        async () => {

            const route = getSelectedRoute();

            if (!route || busy) return;

            const databaseRoute =
                route.source === "database";

            if (databaseRoute && !apiReady) return;

            const confirmed = window.confirm(
                'Wil je "' + route.name +
                '" definitief verwijderen?\n\n' +
                (
                    databaseRoute
                        ? "De route wordt verwijderd uit de database."
                        : "Alleen het lokale concept wordt verwijderd."
                )
            );

            if (!confirmed) return;

            busy = true;

            renderSelectedRoute();

            try {

                let message;

                if (databaseRoute) {

                    await A4DRouteAPI.deleteRoute(
                        route.routeId
                    );

                    const metadataDeleted =
                        deleteRouteMetadata(route.routeId);

                    routes = routes.filter(
                        item => item.id !== route.id
                    );

                    message = "Route verwijderd uit de database.";

                    if (!metadataDeleted) {

                        message +=
                            " Lokale aanvullende gegevens " +
                            "konden niet worden verwijderd.";
                    }

                } else {

                    const previous = routes;

                    routes = routes.filter(
                        item => item.id !== route.id
                    );

                    if (!saveRoutes()) {

                        routes = previous;

                        throw new Error(
                            "Het lokale concept kon niet worden verwijderd."
                        );
                    }

                    message = "Lokaal concept verwijderd.";
                }

                selectedId = null;

                feedback.textContent = message;

            } catch (error) {

                feedback.textContent =
                    "Verwijderen mislukt: " +
                    error.message;

            } finally {

                busy = false;

                render();
            }
        }
    );

    // ======================================
    // 13. GPX DOWNLOADEN
    // ======================================

    function escapeXml(text) {

        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    $("brDownloadGpx").addEventListener(
        "click",
        () => {

            const route = getSelectedRoute();

            if (!route || route.points.length < 2) {

                return;
            }

            const trackPoints = route.points.map(point =>
                '<trkpt lat="' + point[0] +
                '" lon="' + point[1] +
                '"></trkpt>'
            ).join("\n");

            const xml =
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<gpx version="1.1" ' +
                'creator="Avond4daagse 2027" ' +
                'xmlns="http://www.topografix.com/GPX/1/1">\n' +
                '<trk>\n' +
                '<name>' + escapeXml(route.name) + '</name>\n' +
                '<trkseg>\n' +
                trackPoints +
                '\n</trkseg>\n</trk>\n</gpx>';

            const blob = new Blob(
                [xml],
                {
                    type: "application/gpx+xml"
                }
            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            const filename = route.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            link.href = url;

            link.download =
                (filename || "avond4daagse-route") + ".gpx";

            document.body.appendChild(link);

            link.click();
            link.remove();

            setTimeout(
                () => URL.revokeObjectURL(url),
                1000
            );

            feedback.textContent =
                "GPX-bestand gedownload.";
        }
    );

    // ======================================
    // 14. FILTEREVENTS
    // ======================================

    search.addEventListener("input", render);

    eveningFilter.addEventListener(
        "change", render
    );

    distanceFilter.addEventListener(
        "change", render
    );

    filterForm.addEventListener(
        "submit",
        event => event.preventDefault()
    );

    filterForm.addEventListener(
        "reset",
        () => setTimeout(render, 0)
    );

    // ======================================
    // 15. INTERFACE TEKSTEN
    // ======================================

    const notice = document.querySelector(
        ".bm-notice"
    );

    if (notice) {

    notice.querySelector("strong").textContent =
        "Routebeheer — database gekoppeld";

    notice.querySelector("p").textContent =
        "Nieuwe routes, wandelavonden, startlocaties " +
        "en GPX-routepunten worden centraal opgeslagen " +
        "in PostgreSQL. Bestaande lokale concepten " +
        "blijven behouden. Oude aanvullende browsergegevens " +
        "worden niet automatisch overgezet.";
}

    const totalLabel = $("brTotalRoutes")
        .parentElement.querySelector("small");

    if (totalLabel) {

        totalLabel.textContent =
            "Database en lokale concepten";
    }

    const footer = document.querySelector(
        ".bm-content-footer"
    );

    if (footer) {

        footer.textContent =
            "Avond4daagse 2027 · Routebeheer";
    }

    // ======================================
    // 16. START
    // ======================================

    initializeRoutes();

});