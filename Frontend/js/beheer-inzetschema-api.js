
// ==========================================
// AVOND4DAAGSE 2027
// INZETSCHEMA MET ROLGEBASEERDE RECHTEN
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const tbody = $("bsTableBody");

    if (!tbody) return;

    const API_URL =
        "http://localhost:5278/api/Inzetschema";

    const dayFilter = $("bsEveningFilter");
    const onlyOpen = $("bsOnlyOpen");
    const volunteerSelect = $("bsVolunteer");
    const addButton = $("bsAddVolunteer");

    let shifts = [];
    let volunteers = [];
    let selectedKey = null;

    let ready = false;
    let busy = false;
    let kanBeheren = false;

    const assignmentCard =
        volunteerSelect.closest(".bv-assignment-card");

    const assignedNames =
        $("bsAssignedNames").closest(".bv-assignment-list");

    if (assignmentCard) {
        assignmentCard.style.display = "none";
    }

    if (assignedNames) {
        assignedNames.style.display = "none";
    }

    // ======================================
    // 1. RECHTEN CONTROLEREN
    // ======================================

    async function controleerRechten() {

        const response = await fetch(
            "http://localhost:5278/api/Auth/me",
            {
                credentials: "include",
                cache: "no-store"
            }
        );

        if (!response.ok) {

            throw new Error(
                "Sessie controleren mislukt."
            );
        }

        const gebruiker = await response.json();

        kanBeheren =
            Array.isArray(gebruiker.rollen) &&
            gebruiker.rollen.includes("Voorzitter");

        if (assignmentCard) {

            assignmentCard.style.display =
                kanBeheren ? "" : "none";
        }

        if (assignedNames) {

            assignedNames.style.display =
                kanBeheren ? "" : "none";
        }

        const heading = document.querySelector(
            ".bv-heading div > p:last-child"
        );

        if (heading) {

            heading.textContent = kanBeheren

                ? "Bekijk de bezetting per dienst en " +
                  "plan vrijwilligers centraal in."

                : "Bekijk het dienstenrooster en " +
                  "de actuele bezetting. Je hebt leesrechten.";
        }

        if (!kanBeheren) {

            document.querySelectorAll(
                'a[href="vrijwilligers.html"]'
            ).forEach(link => {

                if (!link.closest("#bmSidebar")) {

                    link.style.display = "none";
                }
            });
        }
    }

    // ======================================
    // 2. API
    // ======================================

    async function request(
        path = "",
        method = "GET",
        data
    ) {

        let response;

        try {

            response = await fetch(
                API_URL + path,
                {
                    method,
                    credentials: "include",
                    cache: "no-store",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: data === undefined
                        ? undefined
                        : JSON.stringify(data)
                }
            );

        } catch {

            throw new Error(
                "Geen verbinding met de backend."
            );
        }

        if (response.status === 401) {

            throw new Error(
                "Log opnieuw in."
            );
        }

        if (response.status === 403) {

            throw new Error(
                "Je hebt geen rechten voor deze actie."
            );
        }

        if (!response.ok) {

            const errorText = await response.text();

            console.error(
                response.status,
                errorText
            );

            throw new Error(
                response.status === 409
                    ? errorText
                    : "API-fout: HTTP " + response.status
            );
        }

        if (response.status === 204) {

            return null;
        }

        return await response.json();
    }

    // ======================================
    // 3. HULPFUNCTIES
    // ======================================

    function element(tag, className = "", text) {

        const node = document.createElement(tag);

        if (className) {
            node.className = className;
        }

        if (text !== undefined) {
            node.textContent = String(text);
        }

        return node;
    }

    function message(text) {

        $("bsMessage").textContent = text;
    }

    function selectedShift() {

        return shifts.find(
            shift => shift.key === selectedKey
        );
    }

    function showTableMessage(text) {

        tbody.replaceChildren();

        const row = element("tr");

        const cell = element("td", "", text);

        cell.colSpan = 5;

        row.appendChild(cell);

        tbody.appendChild(row);
    }

    // ======================================
    // 4. STATISTIEKEN
    // ======================================

    function renderStatistics() {

        $("bsTotalShifts").textContent =
            shifts.length;

        $("bsOpenPlaces").textContent =
            shifts.reduce(
                (total, shift) =>
                    total + shift.open,
                0
            );

        $("bsFullShifts").textContent =
            shifts.filter(
                shift => shift.open === 0
            ).length;
    }

    // ======================================
    // 5. DIENSTENROOSTER
    // ======================================

    function renderSchedule() {

        if (!ready) return;

        tbody.replaceChildren();

        const evenings = dayFilter.value === "all"

            ? [1, 2, 3, 4]

            : [Number(dayFilter.value)];

        document.querySelectorAll(
            "#bsTable thead [data-evening]"
        ).forEach(header => {

            header.hidden = !evenings.includes(
                Number(header.dataset.evening)
            );
        });

        const times = [
            ...new Set(
                shifts.map(shift => shift.tijd)
            )
        ];

        times.forEach(time => {

            const row = element("tr");

            row.appendChild(
                element("td", "", time)
            );

            evenings.forEach(evening => {

                const cell = element("td");

                const shift = shifts.find(item =>
                    item.avond === evening &&
                    item.tijd === time
                );

                if (!shift) {

                    cell.textContent = "—";

                } else if (
                    onlyOpen.checked &&
                    shift.open === 0
                ) {

                    cell.textContent = "Volledig bezet";

                } else {

                    const button = element(
                        "button",
                        "bv-shift-button"
                    );

                    button.type = "button";

                    button.classList.add(
                        shift.open === 0
                            ? "is-full"
                            : "is-open"
                    );

                    button.classList.toggle(
                        "is-selected",
                        selectedKey === shift.key
                    );

                    Object.assign(button.style, {

                        display: "flex",

                        flexDirection: "column",

                        gap: "6px",

                        width: "100%",

                        backgroundColor:
                            shift.open > 0
                                ? "#e5f1e8"
                                : "#eceeec"
                    });

                    if (selectedKey === shift.key) {

                        button.style.outline =
                            "2px solid #287651";
                    }

                    button.append(

                        element(
                            "strong", "", shift.naam
                        ),

                        element(
                            "span", "",
                            shift.bezet + " / " +
                            shift.capaciteit + " bezet"
                        ),

                        element(
                            "small", "",
                            shift.open + " open plaatsen"
                        )
                    );

                    button.addEventListener(
                        "click",
                        () => {

                            selectedKey = shift.key;

                            renderSchedule();

                            renderDetails();

                            message("");
                        }
                    );

                    cell.appendChild(button);
                }

                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        renderStatistics();
    }

    // ======================================
    // 6. VRIJWILLIGERSSELECTIE
    // ======================================

    function renderVolunteerOptions(shift) {

        if (!kanBeheren) {

            volunteerSelect.disabled = true;

            addButton.disabled = true;

            return;
        }

        const previous = volunteerSelect.value;

        volunteerSelect.replaceChildren(
            new Option(
                "Selecteer vrijwilliger",
                ""
            )
        );

        const assigned = new Set(
            (shift.vrijwilligers || [])
                .map(item =>
                    item.vrijwilligersId
                )
        );

        volunteers
            .filter(person =>
                !assigned.has(
                    person.vrijwilligersId
                )
            )
            .forEach(person => {

                let label = person.naam;

                if (person.rol) {

                    label += " — " + person.rol;
                }

                if (!person.gekoppeldAccount) {

                    label += " (geen account)";
                }

                volunteerSelect.add(
                    new Option(
                        label,
                        person.vrijwilligersId
                    )
                );
            });

        volunteerSelect.value = previous;

        if (volunteerSelect.selectedIndex === -1) {

            volunteerSelect.value = "";
        }

        volunteerSelect.disabled =
            busy || shift.open === 0;

        addButton.disabled =
            busy ||
            shift.open === 0 ||
            !volunteerSelect.value;
    }

    // ======================================
    // 7. DIENSTDETAILS
    // ======================================

    function renderDetails() {

        const shift = selectedShift();

        const list = $("bsAssignedNames");

        list.replaceChildren();

        if (!shift) {

            $("bsDetailTitle").textContent =
                "Selecteer een dienst";

            $("bsDetailCount").textContent =
                "Klik hierboven op een dienst.";

            $("bsDetailStatus").textContent =
                "Geen selectie";

            volunteerSelect.disabled = true;

            addButton.disabled = true;

            return;
        }

        $("bsDetailTitle").textContent =
            shift.naam + " · Avond " + shift.avond;

        $("bsDetailCount").textContent =
            shift.tijd + " · " +
            shift.bezet + " van " +
            shift.capaciteit + " plaatsen bezet";

        $("bsDetailStatus").textContent =

            shift.open === 0
                ? "Volledig bezet"
                : shift.open + " open plaatsen";

        $("bsBaseInfo").textContent = kanBeheren

            ? "Alle onderstaande toewijzingen " +
              "komen uit de database."

            : "Deze dienst heeft " +
              shift.bezet + " ingeplande vrijwilligers. " +
              "Alleen de voorzitter kan de bezetting aanpassen.";

        if (!kanBeheren) {

            volunteerSelect.disabled = true;

            addButton.disabled = true;

            return;
        }

        const assigned = shift.vrijwilligers || [];

        if (!assigned.length) {

            list.appendChild(
                element(
                    "li", "",
                    "Nog niemand ingepland."
                )
            );
        }

        assigned.forEach(person => {

            const item = element("li");

            Object.assign(item.style, {

                display: "flex",

                alignItems: "center",

                justifyContent: "space-between",

                gap: "10px"
            });

            const name = element(
                "span", "", person.naam
            );

            const remove = element(
                "button",
                "bv-button bv-button-light",
                "Verwijderen"
            );

            remove.type = "button";

            remove.disabled = busy;

            remove.addEventListener(
                "click",
                () => removeAssignment(
                    shift,
                    person
                )
            );

            item.append(name, remove);

            list.appendChild(item);
        });

        renderVolunteerOptions(shift);
    }

    // ======================================
    // 8. GEGEVENS OPHALEN
    // ======================================

    async function loadSchedule() {

        ready = false;

        addButton.disabled = true;

        volunteerSelect.disabled = true;

        showTableMessage(
            "Inzetschema wordt geladen..."
        );

        await controleerRechten();

        const [scheduleData, volunteerData] =
            await Promise.all([

                request(),

                kanBeheren
                    ? request("/vrijwilligers")
                    : Promise.resolve([])
            ]);

        if (
            !Array.isArray(scheduleData) ||
            !Array.isArray(volunteerData)
        ) {

            throw new Error(
                "Onverwacht antwoord van de backend."
            );
        }

        shifts = scheduleData;

        volunteers = volunteerData;

        ready = true;

        renderSchedule();

        renderDetails();

        noticeTitle.textContent = kanBeheren

            ? "Inzetschema verbonden met de database"

            : "Inzetschema · Alleen bekijken";

        noticeText.textContent = kanBeheren

            ? "De bezetting bestaat uit echte opgeslagen " +
              "toewijzingen. Diensttijden, capaciteiten " +
              "en evenementdatums zijn voorlopig."

            : "Je kunt het rooster en de bezetting bekijken. " +
              "Alleen de voorzitter kan vrijwilligers inplannen.";
    }

    // ======================================
    // 9. TOEWIJZING TOEVOEGEN
    // ======================================

    addButton.addEventListener(
        "click",
        async () => {

            if (!kanBeheren || !ready || busy) return;

            const shift = selectedShift();

            const volunteerId =
                Number(volunteerSelect.value);

            if (!shift || !volunteerId) return;

            busy = true;

            renderDetails();

            try {

                await request(
                    "/" + encodeURIComponent(shift.key),
                    "POST",
                    {
                        vrijwilligersId: volunteerId
                    }
                );

                volunteerSelect.value = "";

                await loadSchedule();

                message(
                    "Vrijwilliger toegewezen aan de dienst."
                );

            } catch (error) {

                message(error.message);

            } finally {

                busy = false;

                if (ready) {

                    renderDetails();
                }
            }
        }
    );

    // ======================================
    // 10. TOEWIJZING VERWIJDEREN
    // ======================================

    async function removeAssignment(
        shift,
        person
    ) {

        if (!kanBeheren || !ready || busy) return;

        const confirmed = window.confirm(
            person.naam +
            " verwijderen uit deze dienst?"
        );

        if (!confirmed) return;

        busy = true;

        renderDetails();

        try {

            await request(
                "/" +
                encodeURIComponent(shift.key) +
                "/" +
                person.vrijwilligersId,
                "DELETE"
            );

            await loadSchedule();

            message(
                "Toewijzing verwijderd."
            );

        } catch (error) {

            message(error.message);

        } finally {

            busy = false;

            if (ready) {

                renderDetails();
            }
        }
    }

    // ======================================
    // 11. FILTERS
    // ======================================

    dayFilter.addEventListener(
        "change",
        renderSchedule
    );

    onlyOpen.addEventListener(
        "change",
        renderSchedule
    );

    volunteerSelect.addEventListener(
        "change",
        () => {

            const shift = selectedShift();

            addButton.disabled =
                !kanBeheren ||
                !ready ||
                busy ||
                !shift ||
                shift.open === 0 ||
                !volunteerSelect.value;
        }
    );

    // ======================================
    // 12. INTERFACE
    // ======================================

    const notice = document.querySelector(
        ".bm-notice"
    );

    const noticeTitle =
        notice.querySelector("strong");

    const noticeText =
        notice.querySelector("p");

    noticeTitle.textContent =
        "Inzetschema laden";

    noticeText.textContent =
        "De databasegegevens worden opgehaald.";

    $("bsTotalShifts").textContent = "—";
    $("bsOpenPlaces").textContent = "—";
    $("bsFullShifts").textContent = "—";

    const totalLabel = $("bsTotalShifts")
        .parentElement.querySelector("small");

    if (totalLabel) {

        totalLabel.textContent =
            "Voorlopig dienstenrooster";
    }

    const assignedLabel = document.querySelector(
        ".bv-assignment-list > strong"
    );

    if (assignedLabel) {

        assignedLabel.textContent =
            "Ingeplande vrijwilligers";
    }

    const selectLabel = document.querySelector(
        'label[for="bsVolunteer"]'
    );

    if (selectLabel) {

        selectLabel.textContent =
            "Kies een vrijwilliger";
    }

    const help = document.querySelector(
        ".bv-form-help"
    );

    if (help) {

        help.textContent =
            "De backend controleert capaciteit, " +
            "dubbele toewijzingen, overlappende " +
            "diensten en onbeschikbaarheid.";
    }

    const footer = document.querySelector(
        ".bm-content-footer"
    );

    if (footer) {

        footer.textContent =
            "Avond4daagse 2027 · Inzetschema";
    }

    const resetButton = $("bsReset");

    resetButton.textContent =
        "Overzicht vernieuwen";

    resetButton.addEventListener(
        "click",
        async () => {

            if (busy) return;

            try {

                await loadSchedule();

                message(
                    "Overzicht bijgewerkt."
                );

            } catch (error) {

                message(error.message);
            }
        }
    );

    volunteerSelect.replaceChildren(
        new Option("Vrijwilligers laden...", "")
    );

    // ======================================
    // 13. START
    // ======================================

    loadSchedule().catch(error => {

        noticeTitle.textContent =
            "Inzetschema ophalen mislukt";

        noticeText.textContent =
            error.message;

        showTableMessage(error.message);

        message(error.message);
    });

});
