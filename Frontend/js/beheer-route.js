
// ==========================================
// AVOND4DAAGSE 2027
// ROUTEBEHEER - LOKALE FRONTENDDEMO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const STORAGE_KEY = "a4d-routebeheer-demo-v1";
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

    let routes = loadRoutes();
    let selectedId = null;
    let editingId = null;

    let map = null;
    let routeLayer = null;


    // ======================================
    // 1. LOKAAL OPSLAAN
    // ======================================

    function loadRoutes() {

        try {
            const saved = localStorage.getItem(
                STORAGE_KEY
            );

            if (!saved) return [];

            const result = JSON.parse(saved);

            if (!Array.isArray(result)) return [];

            return result.filter(route => {
                return (
                    route &&
                    typeof route.id === "string" &&
                    typeof route.name === "string" &&
                    [1, 2, 3, 4].includes(route.evening) &&
                    [5, 10].includes(route.distance)
                );
            }).map(route => {

                const points = Array.isArray(route.points)
                    ? route.points.filter(point =>
                        Array.isArray(point) &&
                        point.length === 2 &&
                        Number.isFinite(point[0]) &&
                        Number.isFinite(point[1]) &&
                        Math.abs(point[0]) <= 90 &&
                        Math.abs(point[1]) <= 180
                    ).slice(0, MAX_POINTS)
                    : [];

                return {
                    id: route.id,
                    name: route.name,
                    evening: route.evening,
                    distance: route.distance,
                    start: typeof route.start === "string"
                        ? route.start
                        : "",
                    points
                };

            });

        } catch (error) {
            console.warn(
                "Lokale routes konden niet worden geladen.",
                error
            );

            return [];
        }
    }


    function saveRoutes() {

        try {
            localStorage.setItem(
                STORAGE_KEY,
               JSON.stringify(
    routes.filter(route => route.source !== "database")
)
            );

            return true;

        } catch (error) {

            console.warn(
                "Routes konden niet lokaal worden opgeslagen.",
                error
            );

            return false;
        }
    }


    // ======================================
    // 2. GPX-BESTAND LEZEN
    // ======================================

    async function readGpx(file) {

        if (file.size > MAX_FILE_SIZE) {
            throw new Error(
                "Het GPX-bestand is groter dan 2 MB."
            );
        }

        if (!file.name.toLowerCase().endsWith(".gpx")) {
            throw new Error(
                "Selecteer een bestand met de extensie .gpx."
            );
        }

        const xml = await file.text();

        const documentXml = new DOMParser()
            .parseFromString(
                xml,
                "application/xml"
            );

        if (
            documentXml.getElementsByTagName(
                "parsererror"
            ).length > 0
        ) {
            throw new Error(
                "Het GPX-bestand bevat ongeldige XML."
            );
        }

        // Eerst zoeken naar tracks.
        // Als die er niet zijn, routepunten gebruiken.
        let nodes = [
            ...documentXml.getElementsByTagNameNS(
                "*",
                "trkpt"
            )
        ];

        if (nodes.length === 0) {
            nodes = [
                ...documentXml.getElementsByTagNameNS(
                    "*",
                    "rtept"
                )
            ];
        }

        if (nodes.length < 2) {
            throw new Error(
                "Dit GPX-bestand bevat onvoldoende " +
                "track- of routepunten."
            );
        }

        if (nodes.length > MAX_POINTS) {
            throw new Error(
                "Dit bestand bevat meer dan 5.000 " +
                "routepunten. Vereenvoudig de GPX " +
                "voordat je deze importeert."
            );
        }

        const points = [];

        nodes.forEach(node => {

            const lat = Number(
                node.getAttribute("lat")
            );

            const lng = Number(
                node.getAttribute("lon")
            );

            if (
                Number.isFinite(lat) &&
                Number.isFinite(lng) &&
                Math.abs(lat) <= 90 &&
                Math.abs(lng) <= 180
            ) {
                points.push([
                    Number(lat.toFixed(6)),
                    Number(lng.toFixed(6))
                ]);
            }
        });

        if (points.length < 2) {
            throw new Error(
                "Er zijn geen bruikbare coördinaten gevonden."
            );
        }

        return points;
    }


    // ======================================
    // 3. AFSTAND BEREKENEN
    // ======================================

    function calculateDistance(points) {

        if (!points || points.length < 2) {
            return 0;
        }

        const earthRadius = 6371;
        const toRadians = value =>
            value * Math.PI / 180;

        let total = 0;

        for (let i = 1; i < points.length; i++) {

            const first = points[i - 1];
            const second = points[i];

            const latDiff = toRadians(
                second[0] - first[0]
            );

            const lngDiff = toRadians(
                second[1] - first[1]
            );

            const a =
                Math.sin(latDiff / 2) ** 2 +
                Math.cos(toRadians(first[0])) *
                Math.cos(toRadians(second[0])) *
                Math.sin(lngDiff / 2) ** 2;

            total += 2 * earthRadius *
                Math.asin(
                    Math.min(1, Math.sqrt(a))
                );
        }

        return total;
    }


    function formatDistance(points) {

        if (!points || points.length < 2) {
            return "Geen GPX";
        }

        const km = calculateDistance(points);

        return km.toLocaleString("nl-NL", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " km";
    }


    // ======================================
    // 4. OPENSTREETMAP
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

    } else {
        mapEmptyText.textContent =
            "De kaart kon niet geladen worden. " +
            "Controleer je internetverbinding. " +
            "Je kunt nog steeds routes beheren.";
    }


    function showMap(points) {

        if (map && routeLayer) {
            map.removeLayer(routeLayer);
            routeLayer = null;
        }

        if (!points || points.length < 2) {
            mapEmpty.hidden = false;

            if (map) {
                map.setView([52.1326, 5.2913], 8);
            }

            return;
        }

        if (!map) {
            mapEmpty.hidden = false;
            mapEmptyText.textContent =
                "De GPX-route is opgeslagen, maar " +
                "de interactieve kaart is niet beschikbaar.";
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

        map.fitBounds(
            polyline.getBounds(),
            {
                padding: [30, 30],
                maxZoom: 16
            }
        );

        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }


    // ======================================
    // 5. FILTEREN
    // ======================================

    function getFilteredRoutes() {

        const query = search.value
            .trim()
            .toLocaleLowerCase("nl-NL");

        const evening = eveningFilter.value;
        const distance = distanceFilter.value;

        return routes.filter(route => {

            const text = (
                route.name + " " + route.start
            ).toLocaleLowerCase("nl-NL");

            const matchesSearch =
                query === "" || text.includes(query);

            const matchesEvening =
                evening === "all" ||
                String(route.evening) === evening;

            const matchesDistance =
                distance === "all" ||
                String(route.distance) === distance;

            return (
                matchesSearch &&
                matchesEvening &&
                matchesDistance
            );
        });
    }


    // ======================================
    // 6. STATISTIEKEN
    // ======================================

    function updateStatistics() {

        const withGpx = routes.filter(
            route => route.points.length >= 2
        ).length;

        $("brTotalRoutes").textContent =
            String(routes.length);

        $("brRoutesWithGpx").textContent =
            String(withGpx);

        $("brRoutesWithoutGpx").textContent =
            String(routes.length - withGpx);
    }


    // ======================================
    // 7. ROUTELIJST
    // ======================================

    function createRouteCard(route) {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "br-route-card";
        button.dataset.id = route.id;

        if (route.id === selectedId) {
            button.classList.add("is-selected");
        }

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

        const evening = document.createElement("span");
        evening.textContent =
            route.evening
    ? "Avond " + route.evening
    : "Wandelavond onbekend";

        const distance = document.createElement("span");
        distance.textContent =
            route.distance + " km";

        const start = document.createElement("span");

        start.textContent = route.start
            ? route.start
            : "Startlocatie onbekend";

        meta.append(evening, distance, start);

        button.append(top, meta);

        button.addEventListener("click", () => {
            selectedId = route.id;
            render();
        });

        return button;
    }


    function renderList() {

        const filtered = getFilteredRoutes();

        if (
            selectedId &&
            !filtered.some(route => route.id === selectedId)
        ) {
            selectedId = null;
        }

        $("brResultCount").textContent =
            filtered.length +
            (filtered.length === 1
                ? " route"
                : " routes");

        list.replaceChildren();

        if (filtered.length === 0) {

            const empty = document.createElement("div");
            empty.className = "br-empty";

            const title = document.createElement("strong");
            const message = document.createElement("p");

            if (routes.length === 0) {
                title.textContent =
                    "Nog geen routes toegevoegd";

                message.textContent =
                    "Klik op Route toevoegen om " +
                    "de eerste route aan te maken.";
            } else {
                title.textContent =
                    "Geen routes gevonden";

                message.textContent =
                    "Pas de zoekopdracht of filters aan.";
            }

            empty.append(title, message);
            list.appendChild(empty);

            return;
        }

        filtered
            .sort((a, b) =>
                a.evening - b.evening ||
                a.distance - b.distance ||
                a.name.localeCompare(
                    b.name,
                    "nl-NL"
                )
            )
            .forEach(route => {
                list.appendChild(
                    createRouteCard(route)
                );
            });
    }


    // ======================================
    // 8. GESELECTEERDE ROUTE
    // ======================================

    function getSelectedRoute() {

        return routes.find(
            route => route.id === selectedId
        ) || null;
    }


    function renderSelectedRoute() {

        const route = getSelectedRoute();

        if (!route) {

            $("brMapTitle").textContent =
                "Interactieve kaart";

            $("brMapBadge").textContent =
                "Geen route geselecteerd";

            selectedDetails.hidden = true;

            mapEmptyText.textContent =
                "Selecteer een route met " +
                "GPX-bestand om deze op de " +
                "kaart te bekijken.";

            showMap([]);

            return;
        }

        $("brMapTitle").textContent = route.name;

        const hasGpx = route.points.length >= 2;

        $("brMapBadge").textContent = hasGpx
            ? "GPX beschikbaar"
            : "GPX ontbreekt";

        $("brDetailEvening").textContent =
            route.evening
    ? "Avond " + route.evening
    : "Wandelavond onbekend";

        $("brDetailDistance").textContent =
            route.distance + " km";

        $("brDetailStart").textContent =
            route.start || "Niet ingevuld";

        $("brDetailGpxDistance").textContent =
            formatDistance(route.points);

        $("brDownloadGpx").disabled = !hasGpx;

        selectedDetails.hidden = false;
        $("brEditRoute").disabled = route.source === "database";
$("brDeleteRoute").disabled = route.source === "database";

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
    // 9. FORMULIER OPENEN
    // ======================================

    function openRouteForm(route = null) {

        form.reset();

        editingId = route ? route.id : null;

        formStatus.textContent = "";

        existingGpx.hidden = true;
        removeGpxWrap.hidden = true;

        if (route) {

            $("brDialogTitle").textContent =
                "Route bewerken";

            nameInput.value = route.name;

            eveningInput.value =
                String(route.evening);

            distanceInput.value =
                String(route.distance);

            startInput.value = route.start;

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
        }

        dialog.showModal();
        nameInput.focus();
    }


    $("brAddRoute").addEventListener("click", () => {
        openRouteForm();
    });


    $("brEditRoute").addEventListener("click", () => {

        const route = getSelectedRoute();

        if (route) {
            openRouteForm(route);
        }
    });


    function closeRouteForm() {
        dialog.close();
        editingId = null;
    }


    $("brCloseDialog").addEventListener(
        "click",
        closeRouteForm
    );

    $("brCancelDialog").addEventListener(
        "click",
        closeRouteForm
    );

    dialog.addEventListener("close", () => {
        editingId = null;
    });


    // ======================================
    // 10. ROUTE OPSLAAN
    // ======================================

    form.addEventListener("submit", async event => {

        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        saveButton.disabled = true;
        formStatus.textContent = "";

        try {

            const existing = editingId
                ? routes.find(
                    route => route.id === editingId
                )
                : null;

            let points = existing
                ? [...existing.points]
                : [];

            if (removeGpxInput.checked) {
                points = [];
            }

            const file = fileInput.files[0];

            if (file) {
                points = await readGpx(file);
            }

            const route = {
                id: existing
                    ? existing.id
                    : createId(),

                name: nameInput.value.trim(),
                evening: Number(eveningInput.value),
                distance: Number(distanceInput.value),
                start: startInput.value.trim(),
                points
            };

            if (!route.name) {
                throw new Error(
                    "Vul een routenaam in."
                );
            }

            if (existing) {

                const index = routes.findIndex(
                    item => item.id === existing.id
                );

                routes[index] = route;

            } else {
                routes.push(route);
            }

            selectedId = route.id;

            const savedLocally = saveRoutes();

            closeRouteForm();

            // Nieuwe of aangepaste route tonen,
            // ook als oude filters niet meer passen.
            filterForm.reset();

            render();

            feedback.textContent = savedLocally
                ? "Route opgeslagen in deze browser. " +
                  "Nog niet gepubliceerd op de website."
                : "Route staat nu in dit scherm, maar " +
                  "kon niet blijvend lokaal worden " +
                  "opgeslagen. Controleer je browseropslag.";

        } catch (error) {

            formStatus.textContent =
                error.message ||
                "Er is iets misgegaan bij het opslaan.";

        } finally {

            saveButton.disabled = false;
        }

    });


    function createId() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {
            return window.crypto.randomUUID();
        }

        return (
            "route-" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2)
        );
    }


    // ======================================
    // 11. ROUTE VERWIJDEREN
    // ======================================

    $("brDeleteRoute").addEventListener(
        "click",
        () => {

            const route = getSelectedRoute();

            if (!route) return;

            const confirmed = window.confirm(
                'Wil je "' + route.name +
                '" verwijderen uit deze browser?\n\n' +
                "Dit verwijdert geen gegevens " +
                "uit de backend."
            );

            if (!confirmed) return;

            routes = routes.filter(
                item => item.id !== route.id
            );

            selectedId = null;

            const savedLocally = saveRoutes();

            render();

            feedback.textContent = savedLocally
                ? "Route lokaal verwijderd."
                : "Route uit dit scherm verwijderd, " +
                  "maar het opslaan is mislukt.";
        }
    );


    // ======================================
    // 12. GPX DOWNLOADEN
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

            const trackPoints = route.points
                .map(point =>
                    '<trkpt lat="' + point[0] +
                    '" lon="' + point[1] + '"></trkpt>'
                )
                .join("\n");

            const xml =
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<gpx version="1.1" ' +
                'creator="Avond4daagse Frontenddemo" ' +
                'xmlns="http://www.topografix.com/GPX/1/1">\n' +
                '<trk>\n' +
                '<name>' + escapeXml(route.name) +
                '</name>\n' +
                '<trkseg>\n' +
                trackPoints + '\n' +
                '</trkseg>\n' +
                '</trk>\n' +
                '</gpx>';

            const blob = new Blob(
                [xml],
                { type: "application/gpx+xml" }
            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            const safeName = route.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            link.href = url;
            link.download =
                (safeName || "avond4daagse-route") +
                ".gpx";

            document.body.appendChild(link);

            link.click();
            link.remove();

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);

            feedback.textContent =
                "GPX gedownload. Dit is een " +
                "nieuw gegenereerd bestand met " +
                "de opgeslagen routepunten.";
        }
    );


    // ======================================
    // 13. FILTEREVENTS
    // ======================================

    search.addEventListener("input", render);

    eveningFilter.addEventListener(
        "change",
        render
    );

    distanceFilter.addEventListener(
        "change",
        render
    );

    filterForm.addEventListener("submit", event => {
        event.preventDefault();
    });

    filterForm.addEventListener("reset", () => {
        setTimeout(render, 0);
    });


        // ======================================
    // 14. START - API INTEGRATIE
    // ======================================

    async function initializeRoutes() {
        try {
            const databaseRoutes = await A4DRouteAPI.getRoutes();

            const mappedRoutes = databaseRoutes.map(route => ({
                id: "db-" + route.routeId,
                routeId: route.routeId,
                name: route.naam,
                evening: null,
                distance: Number(route.afstand),
                start: "",
                starttijd: route.starttijd,
                controlepost: route.controlepost,
                evenementId: route.evenementId,
                points: [],
                source: "database"
            }));

            routes = [...loadRoutes(), ...mappedRoutes];

            render();

            feedback.textContent =
                "Routes opgehaald uit de database.";

        } catch (error) {
            render();

            feedback.textContent =
                "Database routes ophalen mislukt: " +
                error.message;
        }
    }

    initializeRoutes();

});