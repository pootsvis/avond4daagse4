
// ============================================
// AVOND4DAAGSE 2027
// HOMEPAGE - WANDELPROGRAMMA
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    const homepage = document.querySelector(
        "body.pub-home"
    );

    if (!homepage) {
        return;
    }


    // ========================================
    // 1. WANDELAVONDEN
    // ========================================
    //
    // Datumformaat: "2027-06-03"
    // Tijdformaat: "18:30"
    //
    // Zet een datum pas op bevestigd wanneer
    // de organisatie die officieel heeft
    // vastgesteld.
    //
    // Voorlopig zijn er nog geen bevestigde
    // datums of starttijden beschikbaar.
    //
    // Later kunnen deze gegevens uit de
    // backend worden opgehaald.
    // ========================================

    const avonden = [

        {
            nummer: 1,
            datum: null,
            starttijd: null,
            bevestigd: false,
            routeGepubliceerd: false
        },

        {
            nummer: 2,
            datum: null,
            starttijd: null,
            bevestigd: false,
            routeGepubliceerd: false
        },

        {
            nummer: 3,
            datum: null,
            starttijd: null,
            bevestigd: false,
            routeGepubliceerd: false
        },

        {
            nummer: 4,
            datum: null,
            starttijd: null,
            bevestigd: false,
            routeGepubliceerd: false
        }

    ];


    // ========================================
    // 2. ELEMENTEN OP DE HOMEPAGE
    // ========================================

    const nextBadge = document.getElementById(
        "hpNextBadge"
    );

    const nextTitle = document.getElementById(
        "hpNextTitle"
    );

    const nextIntro = document.getElementById(
        "hpNextIntro"
    );

    const nextDate = document.getElementById(
        "hpNextDate"
    );

    const nextTime = document.getElementById(
        "hpNextTime"
    );

    const nextRoute = document.getElementById(
        "hpNextRoute"
    );


    // ========================================
    // 3. DATUMFUNCTIES
    // ========================================

    function isValidDate(value) {

        if (
            typeof value !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
            return false;
        }

        const parsed = new Date(
            value + "T12:00:00Z"
        );

        return (
            !Number.isNaN(parsed.getTime()) &&
            parsed.toISOString().slice(0, 10) === value
        );
    }


    function formatDate(value) {

        if (!isValidDate(value)) {
            return "Wordt bekendgemaakt";
        }

        const [year, month, day] = value
            .split("-")
            .map(Number);

        const date = new Date(
            Date.UTC(year, month - 1, day, 12)
        );

        return new Intl.DateTimeFormat(
            "nl-NL",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC"
            }
        ).format(date);
    }


    function getTodayInNetherlands() {

        const formatter = new Intl.DateTimeFormat(
            "en-GB",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                timeZone: "Europe/Amsterdam"
            }
        );

        const parts = formatter.formatToParts(
            new Date()
        );

        const values = {};

        parts.forEach(part => {
            if (part.type !== "literal") {
                values[part.type] = part.value;
            }
        });

        return (
            values.year + "-" +
            values.month + "-" +
            values.day
        );
    }


    function isConfirmed(avond) {

        return (
            avond.bevestigd === true &&
            isValidDate(avond.datum)
        );
    }


    // ========================================
    // 4. KOMENDE WANDELAVOND BEPALEN
    // ========================================

    const today = getTodayInNetherlands();

    // Automatische selectie gebruiken we pas
    // wanneer alle vier de datums bevestigd zijn.
    // Zo doen we geen aannames over de planning.

    const completePlanning = avonden.every(
        isConfirmed
    );

    const sortedAvonden = [...avonden].sort(
        (a, b) => {
            return a.nummer - b.nummer;
        }
    );

    let upcoming = null;
    let allFinished = false;

    if (completePlanning) {

        // Datums moeten op volgorde liggen.
        const chronological = sortedAvonden.every(
            (avond, index) => {

                if (index === 0) {
                    return true;
                }

                return (
                    avond.datum >
                    sortedAvonden[index - 1].datum
                );
            }
        );

        if (chronological) {

            upcoming = sortedAvonden.find(
                avond => avond.datum >= today
            ) || null;

            allFinished = upcoming === null;

        }

    }

    const activeEvening = upcoming || avonden[0];


    // ========================================
    // 5. UITGELICHTE AVOND BIJWERKEN
    // ========================================

    function updateFeaturedEvening() {

        if (allFinished) {

            nextBadge.textContent =
                "EDITIE AFGELOPEN";

            nextTitle.textContent =
                "Vier avonden voltooid";

            nextIntro.textContent =
                "De vier wandelavonden zijn voorbij. " +
                "Bedankt aan alle deelnemers, " +
                "vrijwilligers en betrokkenen.";

            nextDate.textContent =
                "Evenement afgelopen";

            nextTime.textContent =
                "Niet van toepassing";

            nextRoute.textContent =
                "Bekijk het routeoverzicht";

            return;
        }


        if (!upcoming) {

            nextBadge.textContent =
                "PLANNING VOLGT";

            nextTitle.textContent =
                "Avond 1 van 4";

            nextIntro.textContent =
                "De officiële planning wordt " +
                "nog bekendgemaakt. Zodra de " +
                "datums en starttijden zijn " +
                "bevestigd, verschijnen ze " +
                "hier op de homepage.";

            nextDate.textContent =
                "Wordt bekendgemaakt";

            nextTime.textContent =
                "Wordt bekendgemaakt";

            nextRoute.textContent =
                "Nog niet gepubliceerd";

            return;
        }


        // Een bevestigde volgende avond
        const isToday = activeEvening.datum === today;

        nextBadge.textContent = isToday
            ? "VANDAAG WANDELEN"
            : "VOLGENDE WANDELAVOND";

        nextTitle.textContent =
            "Avond " + activeEvening.nummer + " van 4";

        nextIntro.textContent = isToday
            ? "Vandaag staat de volgende " +
              "wandelavond op het programma. " +
              "Controleer voor vertrek de " +
              "route- en startinformatie."
            : "Dit is de eerstvolgende " +
              "wandelavond. Bekijk de datum " +
              "en controleer de route-informatie " +
              "voordat je vertrekt.";

        nextDate.textContent = formatDate(
            activeEvening.datum
        );

        nextTime.textContent =
            activeEvening.starttijd
                ? activeEvening.starttijd + " uur"
                : "Wordt bekendgemaakt";

        nextRoute.textContent =
            activeEvening.routeGepubliceerd
                ? "Route beschikbaar"
                : "Nog niet gepubliceerd";
    }


    updateFeaturedEvening();


    // ========================================
    // 6. DE VIER AVONDEN BIJWERKEN
    // ========================================

    const eveningCards = document.querySelectorAll(
        ".hp-evening[data-evening]"
    );

    eveningCards.forEach(card => {

        const number = Number(
            card.dataset.evening
        );

        const avond = avonden.find(
            item => item.nummer === number
        );

        if (!avond) {
            return;
        }

        const dateElement = card.querySelector(
            ".hp-evening-date"
        );

        const stateElement = card.querySelector(
            ".hp-evening-state"
        );


        // Datum alleen tonen als deze bevestigd is.
        dateElement.textContent = isConfirmed(avond)
            ? formatDate(avond.datum)
            : "Datum volgt";


        // Zonder complete planning:
        if (!completePlanning || !upcoming && !allFinished) {

            stateElement.textContent =
                "Nog te plannen";

            return;
        }


        // Volledige editie afgelopen:
        if (allFinished) {

            card.classList.add("is-done");

            stateElement.textContent =
                "Afgelopen";

            return;
        }


        // Deze avond is de eerstvolgende:
        if (avond.nummer === upcoming.nummer) {

            card.classList.add("is-next");

            stateElement.textContent =
                avond.datum === today
                    ? "Vandaag"
                    : "Volgende avond";

            return;
        }


        // Avonden vóór de komende avond:
        if (avond.datum < upcoming.datum) {

            card.classList.add("is-done");

            stateElement.textContent =
                "Afgelopen";

            return;
        }


        // Avonden na de komende avond:
        stateElement.textContent = "Gepland";

    });


    // ========================================
    // 7. SCROLL-ANIMATIES
    // ========================================

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const animatedElements = document.querySelectorAll(
        ".hp-reveal"
    );

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add(
                    "hp-visible"
                );

                observer.unobserve(
                    entry.target
                );

            });

        },
        {
            threshold: 0.04,
            rootMargin: "0px 0px -15px 0px"
        }
    );


    animatedElements.forEach(element => {

        element.classList.add(
            "hp-reveal-ready"
        );

        observer.observe(element);

    });

});
