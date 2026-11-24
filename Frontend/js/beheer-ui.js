
// ==========================================
// AVOND4DAAGSE 2027
// BEHEEROMGEVING - LOGINCONTROLE EN NAVIGATIE
// ==========================================

// ==========================================
// 1. TOEGANG CONTROLEREN
// ==========================================

const BEHEER_API_URL = "http://localhost:5278";

const TOEGESTANE_ROLLEN = [
    "Voorzitter",
    "Beheerder",
    "Secretaris",
    "Penningmeester",
    "Vrijwilliger",
    "Verkeersregelaars"
];

// Verberg de beheerpagina totdat de login is gecontroleerd.
document.documentElement.style.visibility = "hidden";

async function controleerBeheerToegang() {

    try {

        const response = await fetch(
            `${BEHEER_API_URL}/api/Auth/me`,
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );

        // Niet ingelogd of verlopen sessie.
        if (!response.ok) {
            window.location.replace("login.html");
            return;
        }

        const gebruiker = await response.json();

        const rollen = Array.isArray(gebruiker.rollen)
            ? gebruiker.rollen
            : [];

        // Wel ingelogd, maar geen organisatierol.
        const heeftToegang = rollen.some(rol =>
            TOEGESTANE_ROLLEN.includes(rol)
        );

        if (!heeftToegang) {
            window.location.replace("login.html");
            return;
        }

        // Login en rol zijn gecontroleerd.
        document.documentElement.style.visibility = "visible";

    } catch (error) {

        console.error(
            "Beheersessie controleren mislukt:",
            error
        );

        // Bij een verbindingsfout geen beheerpagina tonen.
        window.location.replace("login.html");
    }
}

// Controleer bij iedere geopende beheerpagina opnieuw.
controleerBeheerToegang();


// ==========================================
// 2. MOBIELE NAVIGATIE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const menuButton = document.getElementById(
        "bmMenuButton"
    );

    const sidebar = document.getElementById(
        "bmSidebar"
    );

    const backdrop = document.getElementById(
        "bmBackdrop"
    );

    if (!menuButton || !sidebar || !backdrop) {
        return;
    }

    const mobileScreen = window.matchMedia(
        "(max-width: 920px)"
    );


    // ======================================
    // MENU OPENEN
    // ======================================

    function openMenu() {

        document.body.classList.add(
            "bm-nav-open"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        menuButton.setAttribute(
            "aria-label",
            "Sluit beheermenu"
        );

        sidebar.inert = false;

        backdrop.hidden = false;

        const firstLink = sidebar.querySelector(
            ".bm-navigation a"
        );

        firstLink?.focus();
    }


    // ======================================
    // MENU SLUITEN
    // ======================================

    function closeMenu(restoreFocus = false) {

        document.body.classList.remove(
            "bm-nav-open"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Open beheermenu"
        );

        backdrop.hidden = true;

        if (restoreFocus) {
            menuButton.focus();
        }

        sidebar.inert = mobileScreen.matches;
    }


    // ======================================
    // MENUKNOP
    // ======================================

    menuButton.addEventListener("click", () => {

        const isOpen = document.body.classList.contains(
            "bm-nav-open"
        );

        if (isOpen) {
            closeMenu(true);
        } else {
            openMenu();
        }

    });


    // ======================================
    // KLIKKEN BUITEN HET MENU
    // ======================================

    backdrop.addEventListener("click", () => {
        closeMenu(true);
    });


    // ======================================
    // ESCAPE-TOETS
    // ======================================

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            document.body.classList.contains(
                "bm-nav-open"
            )
        ) {
            closeMenu(true);
        }

    });


    // ======================================
    // SCHERMGROOTTE VERANDERT
    // ======================================

    mobileScreen.addEventListener("change", () => {
        closeMenu();
    });


    // ======================================
    // STARTINSTELLING
    // ======================================

    sidebar.inert = mobileScreen.matches;
    backdrop.hidden = true;

});
