
// ==========================================
// AVOND4DAAGSE 2027
// AUTHENTICATIE EN ROLGEBASEERDE NAVIGATIE
// ==========================================

const BEHEER_API_URL = "http://localhost:5278";

const ALLE_ROLLEN = [
    "Voorzitter",
    "Secretaris",
    "Penningmeester",
    "Vrijwilliger",
    "Verkeersregelaars"
];

// ==========================================
// 1. PAGINARECHTEN
// ==========================================

const PAGINA_RECHTEN = {

    "dashboard.html": ALLE_ROLLEN,

    "inschrijvingen.html": [
        "Voorzitter"
    ],

    "routebeheer.html": [
        "Voorzitter"
    ],

    "vrijwilligers.html": [
        "Voorzitter"
    ],

    "inzetschema.html": ALLE_ROLLEN,

    "mijn-beschikbaarheid.html": [
        "Vrijwilliger",
        "Verkeersregelaars"
    ],

    "draaiboek.html": ALLE_ROLLEN,

    "mijn-taken.html": ALLE_ROLLEN,

    "draaiboek-maandoverzicht.html": ALLE_ROLLEN,

    "financien.html": [
        "Voorzitter",
        "Penningmeester"
    ],

    "contactvragen.html": [
        "Voorzitter",
        "Secretaris"
    ]
};

document.documentElement.style.visibility =
    "hidden";

// ==========================================
// 2. HULPFUNCTIES
// ==========================================

function paginaNaam(url) {

    return new URL(
        url,
        window.location.href
    ).pathname.split("/").pop();
}

function heeftPaginaToegang(pagina, rollen) {

    const toegestaan = PAGINA_RECHTEN[pagina];

    if (!toegestaan) return false;

    return rollen.some(rol =>
        toegestaan.includes(rol)
    );
}

function startPagina(rollen) {

    if (rollen.includes("Voorzitter")) {

        return "dashboard.html";
    }

    if (rollen.includes("Penningmeester")) {

        return "financien.html";
    }

    if (rollen.includes("Secretaris")) {

        return "contactvragen.html";
    }

    if (
        rollen.includes("Vrijwilliger") ||
        rollen.includes("Verkeersregelaars")
    ) {

        return "mijn-beschikbaarheid.html";
    }

    return "login.html";
}

// ==========================================
// 3. GEBRUIKER LINKSONDER TONEN
// ==========================================

function toonGebruiker(gebruiker, rollen) {

    const account = document.querySelector(
        ".bm-account"
    );

    if (!account) return;

    const avatar = account.querySelector(
        ".bm-account-avatar"
    );

    const naam = account.querySelector(
        "strong"
    );

    const rolTekst = account.querySelector(
        "small"
    );

    const labels = rollen.map(rol =>

        rol === "Verkeersregelaars"
            ? "Verkeersregelaar"
            : rol
    );

    if (avatar) {

        avatar.textContent =
            (labels[0] || "G")
                .charAt(0)
                .toUpperCase();
    }

    if (naam) {

        naam.textContent =
            gebruiker.naam ||
            gebruiker.email ||
            "Gebruiker";

        naam.style.overflowWrap = "anywhere";
    }

    if (rolTekst) {

        rolTekst.textContent =
            "Ingelogd als: " +
            labels.join(" / ");

        rolTekst.style.whiteSpace = "normal";

        rolTekst.style.overflowWrap = "anywhere";

        rolTekst.style.lineHeight = "1.5";
    }

    account.title =
        (gebruiker.email || "") +
        " — " +
        labels.join(", ");
}

// ==========================================
// 4. UITLOGGEN
// ==========================================

function configureerUitloggen() {

    const logout = document.querySelector(
        ".bm-sidebar-exit"
    );

    if (!logout) return;

    logout.textContent = "Uitloggen ↗";

    logout.addEventListener(
        "click",
        async event => {

            event.preventDefault();

            try {

                const response = await fetch(

                    BEHEER_API_URL + "/api/Auth/logout",

                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

                if (!response.ok) {

                    throw new Error(
                        "Uitloggen mislukt."
                    );
                }

                window.location.replace(
                    "login.html"
                );

            } catch (error) {

                console.error(error);

                window.alert(
                    "Uitloggen is mislukt. " +
                    "Probeer het opnieuw."
                );
            }
        }
    );
}

// ==========================================
// 5. SIDEBAR AANPASSEN
// ==========================================

function pasNavigatieAan(rollen) {

    const sidebar = document.getElementById(
        "bmSidebar"
    );

    if (!sidebar) return;

    sidebar.querySelectorAll("a[href]")
        .forEach(link => {

            const href = link.getAttribute("href");

            const pagina = paginaNaam(href);

            if (
                href.startsWith("../") ||
                pagina === "login.html"
            ) {

                return;
            }

            if (
                !heeftPaginaToegang(
                    pagina,
                    rollen
                )
            ) {

                link.style.display = "none";

                link.setAttribute(
                    "aria-hidden",
                    "true"
                );

                link.tabIndex = -1;
            }
        });

    // Overige rollen krijgen een alleen-lezen
    // inzetschema in plaats van vrijwilligersbeheer.

    if (!rollen.includes("Voorzitter")) {

        const volunteerLink = sidebar.querySelector(
            'a[href="vrijwilligers.html"]'
        );

        if (volunteerLink) {

            volunteerLink.href =
                "inzetschema.html";

            volunteerLink.style.removeProperty(
                "display"
            );

            volunteerLink.removeAttribute(
                "aria-hidden"
            );

            volunteerLink.removeAttribute(
                "tabindex"
            );

            volunteerLink.textContent =
                "Inzetschema";

            const isActive =
                paginaNaam(window.location.href) ===
                "inzetschema.html";

            volunteerLink.classList.toggle(
                "active",
                isActive
            );

            if (isActive) {

                volunteerLink.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                volunteerLink.removeAttribute(
                    "aria-current"
                );
            }
        }
    }

    const brand = sidebar.querySelector(
        ".bm-brand"
    );

    if (brand) {

        brand.href = startPagina(rollen);

        brand.style.removeProperty("display");

        brand.removeAttribute("aria-hidden");

        brand.removeAttribute("tabindex");
    }
}

// ==========================================
// 6. LOGIN EN PAGINATOEGANG CONTROLEREN
// ==========================================

async function controleerBeheerToegang() {

    try {

        const response = await fetch(

            BEHEER_API_URL + "/api/Auth/me",

            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );

        if (!response.ok) {

            window.location.replace("login.html");

            return;
        }

        const gebruiker = await response.json();

        const rollen =
            Array.isArray(gebruiker.rollen)
                ? gebruiker.rollen
                : [];

        const heeftOrganisatieRol = rollen.some(
            rol => ALLE_ROLLEN.includes(rol)
        );

        if (!heeftOrganisatieRol) {

            window.location.replace("login.html");

            return;
        }

        const huidigePagina = paginaNaam(
            window.location.href
        );

        if (
            !heeftPaginaToegang(
                huidigePagina,
                rollen
            )
        ) {

            window.location.replace(
                startPagina(rollen)
            );

            return;
        }

        window.beheerGebruiker = gebruiker;

        window.beheerRollen = rollen;

        toonGebruiker(
            gebruiker,
            rollen
        );

        configureerUitloggen();

        pasNavigatieAan(rollen);

        document.documentElement.style.visibility =
            "visible";

    } catch (error) {

        console.error(
            "Beheersessie controleren mislukt:",
            error
        );

        window.location.replace("login.html");
    }
}

// ==========================================
// 7. MOBIELE NAVIGATIE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        controleerBeheerToegang();

        const menuButton = document.getElementById(
            "bmMenuButton"
        );

        const sidebar = document.getElementById(
            "bmSidebar"
        );

        const backdrop = document.getElementById(
            "bmBackdrop"
        );

        if (
            !menuButton ||
            !sidebar ||
            !backdrop
        ) {

            return;
        }

        const mobileScreen = window.matchMedia(
            "(max-width: 920px)"
        );

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

            const firstLink = [
                ...sidebar.querySelectorAll(
                    ".bm-navigation a"
                )
            ].find(link =>
                link.style.display !== "none"
            );

            firstLink?.focus();
        }

        function closeMenu(
            restoreFocus = false
        ) {

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

        menuButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    document.body.classList.contains(
                        "bm-nav-open"
                    );

                if (isOpen) {

                    closeMenu(true);

                } else {

                    openMenu();
                }
            }
        );

        backdrop.addEventListener(
            "click",
            () => closeMenu(true)
        );

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    document.body.classList.contains(
                        "bm-nav-open"
                    )
                ) {

                    closeMenu(true);
                }
            }
        );

        mobileScreen.addEventListener(
            "change",
            () => closeMenu()
        );

        sidebar.inert = mobileScreen.matches;

        backdrop.hidden = true;
    }
);
