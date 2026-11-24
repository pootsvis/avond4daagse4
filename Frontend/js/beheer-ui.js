
// =============================================
// AVOND4DAAGSE 2027
// BEHEEROMGEVING - GEDEELDE INTERACTIES
// =============================================

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


    // =========================================
    // MENU OPENEN
    // =========================================

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


    // =========================================
    // MENU SLUITEN
    // =========================================

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


    // =========================================
    // MENU KNOP
    // =========================================

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


    // =========================================
    // KLIKKEN BUITEN HET MENU
    // =========================================

    backdrop.addEventListener("click", () => {
        closeMenu(true);
    });


    // =========================================
    // ESCAPE-TOETS
    // =========================================

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


    // =========================================
    // SCHERMGROOTTE VERANDERT
    // =========================================

    mobileScreen.addEventListener("change", () => {
        closeMenu();
    });


    // =========================================
    // STARTINSTELLING
    // =========================================

    sidebar.inert = mobileScreen.matches;
    backdrop.hidden = true;

});
