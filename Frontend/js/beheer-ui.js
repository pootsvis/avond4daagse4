
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

    "routebeheer.html": ALLE_ROLLEN,

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

    "draaiboek-maand.html": ALLE_ROLLEN,

    "financien.html": [
        "Penningmeester"
    ],

    "contactvragen.html": [
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

    return Boolean(
        toegestaan &&
        rollen.some(rol =>
            toegestaan.includes(rol)
        )
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

    const naam = account.querySelector("strong");

    const rolTekst = account.querySelector("small");

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
                    "Uitloggen mislukt. Probeer opnieuw."
                );
            }
        }
    );
}

// ==========================================
// 5. NAVIGATIE AANPASSEN
// ==========================================

function pasNavigatieAan(rollen) {

    const isVoorzitter =
        rollen.includes("Voorzitter");

    const sidebar = document.getElementById(
        "bmSidebar"
    );

    if (sidebar) {

        sidebar.querySelectorAll("a[href]")
            .forEach(link => {

                const href = link.getAttribute("href");

                if (
                    href.startsWith("../") ||
                    paginaNaam(href) === "login.html"
                ) {

                    return;
                }

                if (
                    !isVoorzitter &&
                    paginaNaam(href) === "vrijwilligers.html"
                ) {

                    link.href = "inzetschema.html";

                    link.replaceChildren();

                    const icon = document.createElement(
                        "span"
                    );

                    icon.className = "bm-nav-icon";
                    icon.textContent = "♧";

                    link.append(
                        icon,
                        document.createTextNode(
                            " Inzetschema"
                        )
                    );
                }

                if (
                    !heeftPaginaToegang(
                        paginaNaam(link.href),
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

        const brand = sidebar.querySelector(
            ".bm-brand"
        );

        if (brand) {

            brand.href = startPagina(rollen);

            brand.style.removeProperty("display");

            brand.removeAttribute("aria-hidden");

            brand.removeAttribute("tabindex");
        }

        const huidigePagina = paginaNaam(
            window.location.href
        );

        sidebar.querySelectorAll(
            ".bm-navigation a"
        ).forEach(link => {

            const bestemming = paginaNaam(link.href);

            const actief =
                bestemming === huidigePagina ||

                (
                    bestemming === "draaiboek.html" &&
                    [
                        "mijn-taken.html",
                        "draaiboek-maand.html"
                    ].includes(huidigePagina)
                ) ||

                (
                    bestemming === "vrijwilligers.html" &&
                    huidigePagina === "inzetschema.html"
                );

            link.classList.toggle(
                "bm-nav-active",
                actief
            );

            if (actief) {

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                link.removeAttribute(
                    "aria-current"
                );
            }
        });
    }

    // Dashboardlinks ook aanpassen.

    document.querySelectorAll(
        ".bm-shortcut, .bm-workflow"
    ).forEach(link => {

        const bestemming = paginaNaam(
            link.href
        );

        if (
            !isVoorzitter &&
            bestemming === "vrijwilligers.html"
        ) {

            link.href = "inzetschema.html";

            const title = link.querySelector("h3");

            const description = link.querySelector("p");

            if (title) {

                title.textContent = "Inzetschema";
            }

            if (description) {

                description.textContent =
                    "Bekijk de diensten en bezetting.";
            }
        }

        if (
            !isVoorzitter &&
            bestemming === "routebeheer.html"
        ) {

            const title = link.querySelector("h3");

            if (title) {

                title.textContent = "Routes bekijken";
            }
        }

        if (
            !heeftPaginaToegang(
                paginaNaam(link.href),
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
}

// ==========================================
// 6. ROUTEBEHEER ALLEEN-LEZEN
// ==========================================

function pasRouteRechtenAan(rollen) {

    if (
        paginaNaam(window.location.href) !==
        "routebeheer.html"
    ) return;

    if (rollen.includes("Voorzitter")) return;

    const ids = [
        "brAddRoute",
        "brEditRoute",
        "brDeleteRoute",
        "brSaveRoute"
    ];

    ids.forEach(id => {

        const control =
            document.getElementById(id);

        if (!control) return;

        control.style.setProperty(
            "display",
            "none",
            "important"
        );

        control.disabled = true;
    });

    // Blokkeer bewerkacties ook als een bestaand
    // routescript de knop opnieuw activeert.

    document.addEventListener(

        "click",

        event => {

            if (
                event.target.closest(
                    "#brAddRoute, #brEditRoute, " +
                    "#brDeleteRoute, #brSaveRoute"
                )
            ) {

                event.preventDefault();

                event.stopImmediatePropagation();
            }
        },

        true
    );

    document.addEventListener(

        "submit",

        event => {

            if (event.target.id === "brRouteForm") {

                event.preventDefault();

                event.stopImmediatePropagation();
            }
        },

        true
    );

    const dialog =
        document.getElementById("brDialog");

    if (dialog) {

        dialog.inert = true;
    }

    const notice = document.createElement("div");

    notice.className = "bm-notice";

    const text = document.createElement("div");

    const title = document.createElement("strong");

    title.textContent = "Routebeheer · Alleen bekijken";

    const description = document.createElement("p");

    description.textContent =
        "Je kunt routes, afstanden en GPX-kaarten bekijken. " +
        "Alleen de voorzitter kan routes aanpassen.";

    text.append(title, description);

    notice.appendChild(text);

    document.querySelector(".bm-content")
        ?.prepend(notice);
}

// ==========================================
// 7. LOGIN EN PAGINATOEGANG
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

        if (
            !rollen.some(rol =>
                ALLE_ROLLEN.includes(rol)
            )
        ) {

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

        toonGebruiker(gebruiker, rollen);

        configureerUitloggen();

        pasNavigatieAan(rollen);

        pasRouteRechtenAan(rollen);

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
// 8. MOBIELE NAVIGATIE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        controleerBeheerToegang();

        const menuButton =
            document.getElementById("bmMenuButton");

        const sidebar =
            document.getElementById("bmSidebar");

        const backdrop =
            document.getElementById("bmBackdrop");

        if (
            !menuButton ||
            !sidebar ||
            !backdrop
        ) return;

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

            sidebar.inert = mobileScreen.matches;

            if (restoreFocus) {

                menuButton.focus();
            }
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


// ==========================================
// GEBRUIKERSBEHEER NAVIGATIE
// ==========================================

PAGINA_RECHTEN["gebruikersbeheer.html"] = [
    "Voorzitter"
];

const oorspronkelijkeNavigatie = pasNavigatieAan;

pasNavigatieAan = function (rollen) {

    if (rollen.includes("Voorzitter")) {

        const nav = document.querySelector(
            "#bmSidebar .bm-navigation"
        );

        if (
            nav &&
            !nav.querySelector(
                'a[href="gebruikersbeheer.html"]'
            )
        ) {

            const link = document.createElement("a");

            link.href = "gebruikersbeheer.html";

            const icon = document.createElement("span");

            icon.className = "bm-nav-icon";

            icon.textContent = "♙";

            link.append(

                icon,

                document.createTextNode(
                    " Gebruikersbeheer"
                )
            );

            nav.appendChild(link);
        }
    }

    oorspronkelijkeNavigatie(rollen);
};


// ==========================================
// MIJN ACCOUNT NAVIGATIE
// ==========================================

PAGINA_RECHTEN["mijn-account.html"] = ALLE_ROLLEN;

const navigatieVoorAccount = pasNavigatieAan;

pasNavigatieAan = function (rollen) {

    navigatieVoorAccount(rollen);

    const footer = document.querySelector(
        ".bm-sidebar-footer"
    );

    const logout = footer?.querySelector(
        ".bm-sidebar-exit"
    );

    if (!footer || !logout) return;

    if (
        footer.querySelector(
            'a[href="mijn-account.html"]'
        )
    ) return;

    const accountLink = document.createElement("a");

    accountLink.href = "mijn-account.html";

    accountLink.textContent = "Mijn account ⚙";

    accountLink.style.cssText = `
        display: block;
        color: inherit;
        text-decoration: none;
        padding: 12px 0;
        font-size: 14px;
    `;

    if (
        paginaNaam(window.location.href) ===
        "mijn-account.html"
    ) {

        accountLink.setAttribute(
            "aria-current",
            "page"
        );

        accountLink.style.fontWeight = "bold";
    }

    footer.insertBefore(accountLink, logout);
};
