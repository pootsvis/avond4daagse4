
// ==========================================
// AVOND4DAAGSE 2027
// CONTACTVRAGEN - BACKENDKOPPELING
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:5278/api/ContactVraag";

    const $ = (id) => document.getElementById(id);

    const STATUSES = [
        "Nieuw",
        "Open",
        "In behandeling",
        "Beantwoord"
    ];

    let berichten = [];
    let geselecteerdId = null;
    let getoondId = null;


    // ======================================
    // 1. API VERBINDING
    // ======================================

    async function apiRequest(path = "", options = {}) {

        const response = await fetch(
            API_URL + path,
            {
                credentials: "include",
                cache: "no-store",
                ...options
            }
        );

        if (response.status === 401) {
            window.location.replace("login.html");
            throw new Error("Je moet opnieuw inloggen.");
        }

        if (response.status === 403) {
            throw new Error(
                "Je account heeft geen toegang tot contactvragen. " +
                "Hiervoor is de rol Secretaris nodig."
            );
        }

        if (!response.ok) {
            throw new Error(
                "De API gaf foutcode " + response.status + "."
            );
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    }


    // ======================================
    // 2. GEGEVENS OMZETTEN
    // ======================================

    function normaliseerBericht(data) {

        return {
            id: Number(data.contactvraagId),
            voornaam: data.voornaam || "",
            achternaam: data.achternaam || "",
            naam: [
                data.voornaam,
                data.achternaam
            ].filter(Boolean).join(" "),
            email: data.email || "",
            onderwerp: data.onderwerp || "",
            bericht: data.bericht || "",
            datum: data.datum || "",
            status: data.status || "Nieuw",
            conceptreactie: data.conceptreactie || "",
            gebruikerId: data.gebruikerId ?? null
        };
    }


    // ======================================
    // 3. HULPFUNCTIES
    // ======================================

    function notify(tekst) {
        $("cvFeedback").textContent = tekst;
    }

    function maakElement(tag, className, tekst) {

        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (tekst !== undefined) {
            element.textContent = String(tekst);
        }

        return element;
    }

    function huidigBericht() {

        return berichten.find(
            bericht => bericht.id === geselecteerdId
        ) || null;
    }

    function datumTonen(datum) {

        if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
            return "Datum onbekend";
        }

        return new Date(
            datum + "T12:00:00"
        ).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function statusClass(status) {

        if (status === "Beantwoord") {
            return "cv-badge is-answered";
        }

        if (status === "In behandeling") {
            return "cv-badge is-progress";
        }

        return "cv-badge";
    }


    // ======================================
    // 4. DEMOTEKSTEN AANPASSEN
    // ======================================

    function updatePaginaTeksten() {

        $("cvAdd").textContent = "+ Contactvraag toevoegen";

        $("cvDialogTitle").textContent =
            "Contactvraag toevoegen";

        $("cvDelete").textContent =
            "Contactvraag verwijderen";

        $("cvNewName").placeholder =
            "Voornaam Achternaam";

        const verzendKnop = document.querySelector(
            "#cvNewForm button[type='submit']"
        );

        if (verzendKnop) {
            verzendKnop.textContent = "Contactvraag opslaan";
        }

        const melding = document.querySelector(
            ".bm-content > .bm-notice"
        );

        if (melding) {

            const titel = melding.querySelector("strong");
            const beschrijving = melding.querySelector("p");

            if (titel) {
                titel.textContent =
                    "Verbonden met de database";
            }

            if (beschrijving) {
                beschrijving.textContent =
                    "Contactvragen worden opgehaald uit " +
                    "de Avond4daagse database. " +
                    "Statuswijzigingen en conceptantwoorden " +
                    "worden opgeslagen via de backend. " +
                    "E-mails worden niet automatisch verstuurd.";
            }
        }

        const statistiekTeksten =
            document.querySelectorAll(".cv-stat small");

        if (statistiekTeksten[0]) {
            statistiekTeksten[0].textContent =
                "In de database";
        }

        if (statistiekTeksten[2]) {
            statistiekTeksten[2].textContent =
                "Gemarkeerd als beantwoord";
        }

        const statusUitleg = document.querySelector(
            ".cv-status-area p"
        );

        if (statusUitleg) {
            statusUitleg.textContent =
                "Een statuswijziging wordt direct " +
                "opgeslagen in de database.";
        }

        const footer = document.querySelector(
            ".bm-content-footer"
        );

        if (footer) {
            footer.textContent =
                "Avond4daagse 2027 · Contactvragen · Database";
        }

        const accountLabel = document.querySelector(
            ".bm-account small"
        );

        if (accountLabel) {
            accountLabel.textContent =
                "Beheeromgeving";
        }

        // De backend gebruikt ook de status "Nieuw".
        // Deze toevoegen aan de bestaande selectievakken.
        for (const id of [
            "cvStatusFilter",
            "cvDetailStatus"
        ]) {

            const select = $(id);

            if (
                !select.querySelector(
                    'option[value="Nieuw"]'
                )
            ) {

                const option = document.createElement("option");

                option.value = "Nieuw";
                option.textContent = "Nieuw";

                if (id === "cvStatusFilter") {
                    select.insertBefore(
                        option,
                        select.options[1]
                    );
                } else {
                    select.prepend(option);
                }
            }
        }
    }


    // ======================================
    // 5. FILTEREN EN SORTEREN
    // ======================================

    function gefilterdeBerichten() {

        const zoekterm = $("cvSearch")
            .value.trim()
            .toLocaleLowerCase("nl-NL");

        const statusFilter =
            $("cvStatusFilter").value;

        return berichten
            .filter(bericht => {

                const zoekbareTekst = [
                    bericht.naam,
                    bericht.email,
                    bericht.onderwerp,
                    bericht.bericht
                ]
                    .join(" ")
                    .toLocaleLowerCase("nl-NL");

                const kloptZoekterm =
                    !zoekterm ||
                    zoekbareTekst.includes(zoekterm);

                const kloptStatus =
                    statusFilter === "all" ||
                    bericht.status === statusFilter;

                return kloptZoekterm && kloptStatus;
            })
            .sort((a, b) => {

                return (
                    b.datum.localeCompare(a.datum) ||
                    b.id - a.id
                );
            });
    }


    // ======================================
    // 6. STATISTIEKEN
    // ======================================

    function renderStatistieken() {

        $("cvTotal").textContent =
            String(berichten.length);

        $("cvOpen").textContent = String(
            berichten.filter(
                bericht => bericht.status !== "Beantwoord"
            ).length
        );

        $("cvAnswered").textContent = String(
            berichten.filter(
                bericht => bericht.status === "Beantwoord"
            ).length
        );
    }


    // ======================================
    // 7. INBOX WEERGEVEN
    // ======================================

    function renderInbox() {

        const lijst = $("cvMessageList");

        const zichtbaar = gefilterdeBerichten();

        lijst.replaceChildren();

        $("cvResultCount").textContent =
            zichtbaar.length +
            (zichtbaar.length === 1
                ? " bericht"
                : " berichten");

        if (
            !zichtbaar.some(
                bericht => bericht.id === geselecteerdId
            )
        ) {
            geselecteerdId = zichtbaar[0]?.id ?? null;
        }

        if (zichtbaar.length === 0) {

            lijst.appendChild(
                maakElement(
                    "p",
                    "cv-empty",
                    "Geen contactvragen gevonden."
                )
            );

            return;
        }

        zichtbaar.forEach(bericht => {

            const knop = maakElement(
                "button",
                "cv-message-item"
            );

            knop.type = "button";
            knop.dataset.id = String(bericht.id);

            const actief =
                bericht.id === geselecteerdId;

            knop.classList.toggle(
                "is-selected",
                actief
            );

            knop.setAttribute(
                "aria-pressed",
                String(actief)
            );

            const bovenkant = maakElement(
                "div",
                "cv-message-top"
            );

            bovenkant.appendChild(
                maakElement(
                    "span",
                    statusClass(bericht.status),
                    bericht.status
                )
            );

            bovenkant.appendChild(
                maakElement(
                    "span",
                    "cv-message-date",
                    datumTonen(bericht.datum)
                )
            );

            knop.appendChild(bovenkant);

            knop.appendChild(
                maakElement(
                    "strong",
                    "cv-message-subject",
                    bericht.onderwerp
                )
            );

            knop.appendChild(
                maakElement(
                    "span",
                    "cv-message-name",
                    bericht.naam
                )
            );

            knop.appendChild(
                maakElement(
                    "p",
                    "cv-message-preview",
                    bericht.bericht
                )
            );

            lijst.appendChild(knop);
        });
    }


    // ======================================
    // 8. BERICHTDETAILS
    // ======================================

    function renderDetails(verversConcept = false) {

        const bericht = huidigBericht();

        $("cvNoSelection").hidden = Boolean(bericht);

        $("cvSelectedMessage").hidden = !bericht;

        if (!bericht) {
            getoondId = null;
            return;
        }

        $("cvDetailTitle").textContent =
            bericht.onderwerp;

        $("cvDetailName").textContent =
            bericht.naam;

        $("cvDetailEmail").textContent =
            bericht.email;

        $("cvDetailDate").textContent =
            datumTonen(bericht.datum);

        $("cvDetailMessage").textContent =
            bericht.bericht;

        $("cvAvatar").textContent =
            bericht.naam.charAt(0).toUpperCase() || "?";

        const badge = $("cvDetailBadge");

        badge.className = statusClass(bericht.status);
        badge.textContent = bericht.status;

        $("cvDetailStatus").value = bericht.status;

        if (
            getoondId !== bericht.id ||
            verversConcept
        ) {

            $("cvReply").value =
                bericht.conceptreactie;

            $("cvDraftStatus").textContent =
                bericht.conceptreactie
                    ? "Concept opgeslagen in database"
                    : "Nog geen concept";
        }

        $("cvMessageSource").textContent =
            "Opgeslagen in de database";

        $("cvDelete").hidden = false;

        getoondId = bericht.id;
    }


    function render(verversConcept = false) {

        renderStatistieken();
        renderInbox();
        renderDetails(verversConcept);
    }


    // ======================================
    // 9. BERICHTEN UIT DATABASE OPHALEN
    // ======================================

    async function laadContactvragen() {

        try {

            notify("Contactvragen ophalen...");

            const data = await apiRequest();

            if (!Array.isArray(data)) {
                throw new Error(
                    "De API gaf geen geldige berichtenlijst terug."
                );
            }

            berichten = data.map(normaliseerBericht);

            render(true);

            notify(
                berichten.length === 0
                    ? "Er zijn nog geen contactvragen in de database."
                    : berichten.length +
                      " contactvragen geladen uit de database."
            );

        } catch (error) {

            console.error(error);

            berichten = [];
            render(true);

            notify(error.message);
        }
    }


    // ======================================
    // 10. CONTACTVRAAG BIJWERKEN
    // ======================================

    async function wijzigContactvraag(bericht, wijzigingen) {

        const body = {
            status: wijzigingen.status ?? bericht.status,

            conceptreactie:
                wijzigingen.conceptreactie !== undefined
                    ? wijzigingen.conceptreactie
                    : bericht.conceptreactie,

            gebruikerId: bericht.gebruikerId
        };

        const data = await apiRequest(
            "/" + bericht.id,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(body)
            }
        );

        const bijgewerkt = normaliseerBericht(data);

        const index = berichten.findIndex(
            item => item.id === bericht.id
        );

        if (index !== -1) {
            berichten[index] = bijgewerkt;
        }

        return bijgewerkt;
    }


    // ======================================
    // 11. BERICHT SELECTEREN
    // ======================================

    $("cvMessageList").addEventListener(
        "click",
        event => {

            const knop = event.target.closest(
                "button[data-id]"
            );

            if (!knop) {
                return;
            }

            const volgendId =
                Number(knop.dataset.id);

            if (volgendId === geselecteerdId) {
                return;
            }

            const huidig = huidigBericht();

            if (
                huidig &&
                $("cvReply").value !== huidig.conceptreactie
            ) {

                const doorgaan = window.confirm(
                    "Je hebt een niet-opgeslagen concept. " +
                    "Wil je zonder opslaan verdergaan?"
                );

                if (!doorgaan) {
                    return;
                }
            }

            geselecteerdId = volgendId;
            getoondId = null;

            render();

            notify("");
        }
    );


    // ======================================
    // 12. FILTERS
    // ======================================

    $("cvSearch").addEventListener(
        "input",
        () => render()
    );

    $("cvStatusFilter").addEventListener(
        "change",
        () => render()
    );

    $("cvFilters").addEventListener(
        "submit",
        event => event.preventDefault()
    );

    $("cvFilters").addEventListener(
        "reset",
        () => {
            setTimeout(() => render(), 0);
        }
    );


    // ======================================
    // 13. STATUS OPSLAAN IN DATABASE
    // ======================================

    $("cvDetailStatus").addEventListener(
        "change",
        async event => {

            const bericht = huidigBericht();

            if (!bericht) {
                return;
            }

            const nieuweStatus = event.target.value;

            if (!STATUSES.includes(nieuweStatus)) {
                return;
            }

            const concept = $("cvReply").value;

            try {

                notify("Status opslaan...");

                await wijzigContactvraag(
                    bericht,
                    {
                        status: nieuweStatus,
                        conceptreactie: concept
                    }
                );

                render(true);

                notify(
                    "Status en eventueel concept opgeslagen " +
                    "in de database."
                );

            } catch (error) {

                render(true);
                notify(error.message);
            }
        }
    );


    // ======================================
    // 14. CONCEPT OPSLAAN
    // ======================================

    $("cvReply").addEventListener(
        "input",
        () => {

            $("cvDraftStatus").textContent =
                "Niet-opgeslagen wijzigingen";
        }
    );

    $("cvSaveDraft").addEventListener(
        "click",
        async () => {

            const bericht = huidigBericht();

            if (!bericht) {
                return;
            }

            const knop = $("cvSaveDraft");

            knop.disabled = true;

            try {

                await wijzigContactvraag(
                    bericht,
                    {
                        conceptreactie: $("cvReply").value
                    }
                );

                render(true);

                notify(
                    "Concept opgeslagen in de database. " +
                    "Er is geen e-mail verstuurd."
                );

            } catch (error) {

                notify(error.message);

            } finally {

                knop.disabled = false;
            }
        }
    );


    // ======================================
    // 15. ANTWOORD KOPIËREN
    // ======================================

    $("cvCopyReply").addEventListener(
        "click",
        async () => {

            const tekst = $("cvReply").value.trim();

            if (!tekst) {
                notify("Schrijf eerst een antwoord.");
                return;
            }

            try {

                await navigator.clipboard.writeText(
                    tekst
                );

                notify(
                    "Antwoord gekopieerd. " +
                    "Sla je concept apart op als je " +
                    "het wilt bewaren in de database."
                );

            } catch (error) {

                notify(
                    "Automatisch kopiëren mislukt. " +
                    "Gebruik Command + C."
                );
            }
        }
    );


    // ======================================
    // 16. E-MAILAPP OPENEN
    // ======================================

    $("cvEmailReply").addEventListener(
        "click",
        () => {

            const bericht = huidigBericht();

            if (!bericht) {
                return;
            }

            const antwoord =
                $("cvReply").value.trim();

            if (!antwoord) {
                notify("Schrijf eerst een antwoord.");
                return;
            }

            const onderwerp =
                "Re: " + bericht.onderwerp;

            const url =
                "mailto:" + bericht.email +
                "?subject=" +
                encodeURIComponent(onderwerp) +
                "&body=" +
                encodeURIComponent(antwoord);

            notify(
                "De e-mailapp wordt geopend. " +
                "Het bericht is nog niet verzonden."
            );

            window.location.href = url;
        }
    );


    // ======================================
    // 17. CONTACTVRAAG TOEVOEGEN
    // ======================================

    const dialog = $("cvDialog");
    const nieuwFormulier = $("cvNewForm");

    $("cvAdd").addEventListener(
        "click",
        () => {

            nieuwFormulier.reset();
            dialog.showModal();
            $("cvNewName").focus();
        }
    );

    $("cvCloseDialog").addEventListener(
        "click",
        () => dialog.close()
    );

    $("cvCancelDialog").addEventListener(
        "click",
        () => dialog.close()
    );

    nieuwFormulier.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!nieuwFormulier.reportValidity()) {
                return;
            }

            const volledigeNaam =
                $("cvNewName").value.trim();

            const naamdelen =
                volledigeNaam.split(/\s+/);

            const voornaam =
                naamdelen.shift() || "";

            const achternaam =
                naamdelen.join(" ");

            if (!voornaam || !achternaam) {

                notify(
                    "Vul een voornaam én achternaam in."
                );

                return;
            }

            const email =
                $("cvNewEmail").value.trim();

            const onderwerp =
                $("cvNewSubject").value.trim();

            const bericht =
                $("cvNewMessage").value.trim();

            if (
                voornaam.length > 50 ||
                achternaam.length > 50
            ) {

                notify(
                    "Voornaam en achternaam mogen " +
                    "elk maximaal 50 tekens bevatten."
                );

                return;
            }

            if (bericht.length > 2000) {

                notify(
                    "Het bericht mag maximaal " +
                    "2000 tekens bevatten."
                );

                return;
            }

            const verzendKnop =
                nieuwFormulier.querySelector(
                    'button[type="submit"]'
                );

            verzendKnop.disabled = true;

            try {

                const data = await apiRequest(
                    "",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            voornaam,
                            achternaam,
                            email,
                            onderwerp,
                            bericht
                        })
                    }
                );

                const nieuwBericht =
                    normaliseerBericht(data);

                berichten.unshift(nieuwBericht);

                geselecteerdId = nieuwBericht.id;
                getoondId = null;

                $("cvSearch").value = "";
                $("cvStatusFilter").value = "all";

                dialog.close();

                render(true);

                notify(
                    "Contactvraag opgeslagen in de database."
                );

            } catch (error) {

                notify(error.message);

            } finally {

                verzendKnop.disabled = false;
            }
        }
    );


    // ======================================
    // 18. CONTACTVRAAG VERWIJDEREN
    // ======================================

    $("cvDelete").addEventListener(
        "click",
        async () => {

            const bericht = huidigBericht();

            if (!bericht) {
                return;
            }

            const akkoord = window.confirm(
                'Weet je zeker dat je "' +
                bericht.onderwerp +
                '" definitief wilt verwijderen ' +
                "uit de database?"
            );

            if (!akkoord) {
                return;
            }

            try {

                await apiRequest(
                    "/" + bericht.id,
                    {
                        method: "DELETE"
                    }
                );

                berichten = berichten.filter(
                    item => item.id !== bericht.id
                );

                geselecteerdId = null;
                getoondId = null;

                render(true);

                notify(
                    "Contactvraag verwijderd uit de database."
                );

            } catch (error) {

                notify(error.message);
            }
        }
    );


    // ======================================
    // 19. PAGINA STARTEN
    // ======================================

    updatePaginaTeksten();
    laadContactvragen();

});
