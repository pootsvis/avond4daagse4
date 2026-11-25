
// ==========================================
// AVOND4DAAGSE 2027
// CERTIFICATEN - BACKEND INTEGRATIE
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const API_URL = "http://localhost:5278";

    const main = document.querySelector(".bm-content");

    if (!main) return;

    const personalPage =
        Boolean(document.getElementById("baForm"));

    let busy = false;

    // ======================================
    // 1. API
    // ======================================

    async function request(
        path,
        method = "GET",
        data
    ) {

        const options = {
            method,
            credentials: "include",
            cache: "no-store"
        };

        if (data instanceof FormData) {

            options.body = data;

        } else if (data !== undefined) {

            options.headers = {
                "Content-Type": "application/json"
            };

            options.body = JSON.stringify(data);
        }

        const response = await fetch(
            API_URL + path,
            options
        );

        if (response.status === 401) {

            throw new Error(
                "Log opnieuw in."
            );
        }

        if (response.status === 403) {

            throw new Error(
                "Je hebt geen toegang tot deze functie."
            );
        }

        if (!response.ok) {

            const detail = await response.text();

            console.error(
                response.status,
                detail
            );

            throw new Error(
                detail.length > 0 && detail.length < 250
                    ? detail
                    : "API-fout: HTTP " + response.status
            );
        }

        if (response.status === 204) {

            return null;
        }

        return await response.json();
    }

    // ======================================
    // 2. HULPFUNCTIES
    // ======================================

    function element(tag, text, className) {

        const node = document.createElement(tag);

        if (text !== undefined) {

            node.textContent = text;
        }

        if (className) {

            node.className = className;
        }

        return node;
    }

    function button(text, handler, primary = false) {

        const node = element(
            "button",
            text,
            primary
                ? "bv-button bv-button-primary"
                : "bv-button bv-button-light"
        );

        node.type = "button";

        node.style.padding = "10px 16px";
        node.style.borderRadius = "8px";
        node.style.cursor = "pointer";
        node.style.border = "1px solid #c9d8cd";

        node.style.backgroundColor =
            primary ? "#24694b" : "#f4f7f4";

        node.style.color =
            primary ? "#ffffff" : "#173b2b";

        node.addEventListener("click", handler);

        return node;
    }

    function statusLabel(status) {

        const label = element(
            "span",
            status || "Ontbreekt"
        );

        Object.assign(label.style, {
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600"
        });

        if (status === "Goedgekeurd") {

            label.style.backgroundColor = "#e2f2e7";
            label.style.color = "#24694b";

        } else if (status === "Afgekeurd") {

            label.style.backgroundColor = "#fde8e8";
            label.style.color = "#a42c2c";

        } else {

            label.style.backgroundColor = "#fff1d9";
            label.style.color = "#79501c";
        }

        return label;
    }

    function dateLabel(value) {

        return value
            ? new Date(value).toLocaleDateString("nl-NL")
            : "—";
    }

    // ======================================
    // 3. PANEEL MAKEN
    // ======================================

    function createPanel() {

        const panel = element(
            "section",
            undefined,
            personalPage ? "ba-panel" : "bv-panel"
        );

        panel.id = "certificatePanel";

        Object.assign(panel.style, {
            background: "#ffffff",
            border: "1px solid #dce5dd",
            borderRadius: "16px",
            padding: "24px",
            marginTop: "24px",
            marginBottom: "24px"
        });

        const footer = main.querySelector(
            ".bm-content-footer"
        );

        if (footer) {

            main.insertBefore(panel, footer);

        } else {

            main.appendChild(panel);
        }

        return panel;
    }

    function setHeader(panel, title, description) {

        panel.replaceChildren();

        const eyebrow = element(
            "p",
            "CERTIFICATEN",
            "bm-eyebrow"
        );

        const heading = element("h2", title);

        heading.style.marginBottom = "10px";

        const paragraph = element(
            "p",
            description
        );

        paragraph.style.marginBottom = "20px";

        panel.append(
            eyebrow,
            heading,
            paragraph
        );
    }

    function showFeedback(message, error = false) {

        const feedback = document.getElementById(
            "certificateFeedback"
        );

        if (feedback) {

            feedback.textContent = message;

            feedback.style.color =
                error ? "#a42c2c" : "#24694b";
        }
    }

    function addFeedback(panel) {

        const feedback = element("p");

        feedback.id = "certificateFeedback";

        feedback.setAttribute("role", "status");

        feedback.setAttribute("aria-live", "polite");

        feedback.style.marginTop = "16px";

        panel.appendChild(feedback);
    }

    // ======================================
    // 4. EIGEN CERTIFICAAT
    // ======================================

    async function renderPersonal(panel) {

        setHeader(
            panel,
            "Mijn verkeersregelaarscertificaat",
            "Upload je certificaat als PDF. " +
            "De voorzitter beoordeelt het bestand."
        );

        try {

            const data = await request(
                "/api/Certificaat/me"
            );

            panel.appendChild(
                statusLabel(data.status)
            );

            const details = element("div");

            details.style.margin = "18px 0";

            details.append(
                element(
                    "p",
                    "Bestand: " +
                    (data.bestandsnaam || "Geen bestand")
                ),
                element(
                    "p",
                    "Geüpload: " +
                    dateLabel(data.uploadDatum)
                )
            );

            panel.appendChild(details);

            const form = element("form");

            const label = element(
                "label",
                "Selecteer PDF-bestand (maximaal 5 MB)"
            );

            label.htmlFor = "certificateFile";

            const input = element("input");

            input.type = "file";
            input.id = "certificateFile";
            input.accept = ".pdf,application/pdf";
            input.required = true;

            Object.assign(input.style, {
                display: "block",
                margin: "12px 0 16px",
                width: "100%"
            });

            const upload = button(
                data.aanwezig
                    ? "Certificaat vervangen"
                    : "Certificaat uploaden",
                () => {},
                true
            );

            upload.type = "submit";

            form.append(
                label,
                input,
                upload
            );

            form.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    if (busy) return;

                    const file = input.files[0];

                    if (!file) return;

                    if (
                        !file.name.toLowerCase().endsWith(".pdf") ||
                        file.size > 5 * 1024 * 1024
                    ) {

                        showFeedback(
                            "Kies een PDF van maximaal 5 MB.",
                            true
                        );

                        return;
                    }

                    if (
                        data.aanwezig &&
                        !window.confirm(
                            "Bestaand certificaat vervangen? " +
                            "De beoordeling wordt opnieuw gestart."
                        )
                    ) {

                        return;
                    }

                    busy = true;
                    upload.disabled = true;

                    const formData = new FormData();

                    formData.append("bestand", file);

                    try {

                        await request(
                            "/api/Certificaat/me",
                            "POST",
                            formData
                        );

                        await renderPersonal(panel);

                        showFeedback(
                            "Certificaat succesvol geüpload."
                        );

                    } catch (error) {

                        showFeedback(
                            error.message,
                            true
                        );

                    } finally {

                        busy = false;
                        upload.disabled = false;
                    }
                }
            );

            panel.appendChild(form);

            if (data.aanwezig) {

                const actions = element("div");

                Object.assign(actions.style, {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "12px"
                });

                const download = button(
                    "Certificaat downloaden",
                    () => {

                        window.location.href =
                            API_URL +
                            "/api/Certificaat/me/download";
                    }
                );

                const remove = button(
                    "Certificaat verwijderen",
                    async () => {

                        if (busy) return;

                        if (!window.confirm(
                            "Wil je je certificaat verwijderen?"
                        )) return;

                        busy = true;
                        remove.disabled = true;

                        try {

                            await request(
                                "/api/Certificaat/me",
                                "DELETE"
                            );

                            await renderPersonal(panel);

                            showFeedback(
                                "Certificaat verwijderd."
                            );

                        } catch (error) {

                            showFeedback(
                                error.message,
                                true
                            );

                        } finally {

                            busy = false;
                            remove.disabled = false;
                        }
                    }
                );

                actions.append(download, remove);

                panel.appendChild(actions);
            }

            addFeedback(panel);

        } catch (error) {

            addFeedback(panel);

            showFeedback(
                error.message,
                true
            );
        }
    }

    // ======================================
    // 5. CERTIFICATENOVERZICHT
    // ======================================

    async function renderAdmin(panel) {

        setHeader(
            panel,
            "Verkeersregelaarscertificaten",
            "Bekijk en beoordeel de geüploade " +
            "certificaten van verkeersregelaars."
        );

        try {

            const data = await request(
                "/api/Certificaat"
            );

            const stats = element(
                "p",
                "Totaal: " + data.length +
                " · In beoordeling: " +
                data.filter(item =>
                    item.status === "In beoordeling"
                ).length +
                " · Goedgekeurd: " +
                data.filter(item =>
                    item.status === "Goedgekeurd"
                ).length
            );

            stats.style.marginBottom = "20px";

            panel.appendChild(stats);

            if (!data.length) {

                panel.appendChild(
                    element(
                        "p",
                        "Nog geen verkeersregelaars " +
                        "of certificaten geregistreerd."
                    )
                );
            }

            data.forEach(item => {

                const row = element("div");

                Object.assign(row.style, {
                    padding: "18px",
                    border: "1px solid #dce5dd",
                    borderRadius: "10px",
                    marginBottom: "12px"
                });

                const name = element(
                    "h3",
                    item.naam
                );

                name.style.marginBottom = "8px";

                row.append(
                    name,
                    statusLabel(item.status),
                    element(
                        "p",
                        "Bestand: " +
                        (item.bestandsnaam || "Ontbreekt")
                    ),
                    element(
                        "p",
                        "Geüpload: " +
                        dateLabel(item.uploadDatum)
                    )
                );

                if (item.aanwezig) {

                    const actions = element("div");

                    Object.assign(actions.style, {
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginTop: "12px"
                    });

                    const download = button(
                        "Download PDF",
                        () => {

                            window.location.href =
                                API_URL +
                                "/api/Certificaat/" +
                                item.vrijwilligersId +
                                "/download";
                        }
                    );

                    const approve = button(
                        "Goedkeuren",
                        () => review(
                            panel,
                            item,
                            "Goedgekeurd"
                        ),
                        true
                    );

                    const reject = button(
                        "Afkeuren",
                        () => review(
                            panel,
                            item,
                            "Afgekeurd"
                        )
                    );

                    actions.append(
                        download,
                        approve,
                        reject
                    );

                    row.appendChild(actions);
                }

                panel.appendChild(row);
            });

            const refresh = button(
                "Overzicht vernieuwen",
                async () => {

                    if (!busy) {

                        await renderAdmin(panel);
                    }
                }
            );

            panel.appendChild(refresh);

            addFeedback(panel);

        } catch (error) {

            addFeedback(panel);

            showFeedback(
                error.message,
                true
            );
        }
    }

    // ======================================
    // 6. BEOORDELEN
    // ======================================

    async function review(panel, item, status) {

        if (busy) return;

        if (!window.confirm(
            "Certificaat van " + item.naam +
            " markeren als " + status.toLowerCase() +
            "?"
        )) return;

        busy = true;

        try {

            await request(
                "/api/Certificaat/" +
                item.vrijwilligersId +
                "/status",
                "PUT",
                { status }
            );

            await renderAdmin(panel);

            showFeedback(
                "Certificaatstatus bijgewerkt."
            );

        } catch (error) {

            showFeedback(
                error.message,
                true
            );

        } finally {

            busy = false;
        }
    }

    // ======================================
    // 7. AUTHENTICATIE EN START
    // ======================================

    try {

        const user = await request(
            "/api/Auth/me"
        );

        const roles = user.rollen || [];

        if (
            personalPage &&
            roles.includes("Verkeersregelaars")
        ) {

            await renderPersonal(
                createPanel()
            );

        } else if (
            !personalPage &&
            roles.includes("Voorzitter")
        ) {

            await renderAdmin(
                createPanel()
            );
        }

    } catch (error) {

        console.error(
            "Certificaten konden niet worden geladen:",
            error
        );
    }

});
