
document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // AVOND4DAAGSE 2027
  // PUBLIEKE PAGINA'S + INSCHRIJVING
  // ==========================================

  const API_URL = "http://localhost:5278";
  const REGISTRATION_KEY = "a4d_registration_pending";
  const PRICE_PER_PERSON = 8.50;


  // ==========================================
  // 1. SCROLL-ANIMATIES
  // ==========================================

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    !reducedMotion &&
    "IntersectionObserver" in window
  ) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pp-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -16px 0px"
      }
    );

    document.querySelectorAll(".pp-reveal")
      .forEach(element => {
        element.classList.add("pp-reveal-ready");
        observer.observe(element);
      });
  }


  // ==========================================
  // 2. ROUTEKAART
  // ==========================================

  const mapElement = document.getElementById("ppMap");

  if (mapElement) {

    const status = document.getElementById(
      "ppMapStatus"
    );

    if (typeof window.L !== "undefined") {

      const startView = [52.1326, 5.2913];

      const map = window.L.map("ppMap", {
        scrollWheelZoom: false
      }).setView(startView, 8);

      window.L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      ).addTo(map);

      const resetButton = document.getElementById(
        "ppMapReset"
      );

      resetButton?.addEventListener("click", () => {
        map.setView(startView, 8);

        if (status) {
          status.textContent =
            "Nederland in beeld. Er is nog geen officiële GPX-route beschikbaar.";
        }
      });

      const locateButton = document.getElementById(
        "ppLocate"
      );

      let myLocationMarker = null;

      locateButton?.addEventListener("click", () => {

        if (!navigator.geolocation) {
          if (status) {
            status.textContent =
              "Je browser ondersteunt geen locatiebepaling.";
          }
          return;
        }

        if (status) {
          status.textContent =
            "Je locatie wordt opgezocht...";
        }

        navigator.geolocation.getCurrentPosition(
          position => {

            const coordinates = [
              position.coords.latitude,
              position.coords.longitude
            ];

            if (myLocationMarker) {
              map.removeLayer(myLocationMarker);
            }

            myLocationMarker = window.L.marker(
              coordinates
            ).addTo(map);

            myLocationMarker
              .bindPopup("Jouw huidige locatie")
              .openPopup();

            map.setView(coordinates, 13);

            if (status) {
              status.textContent =
                "Je locatie staat op de kaart. Dit is geen officieel startpunt.";
            }
          },
          () => {
            if (status) {
              status.textContent =
                "Locatietoegang is geweigerd of niet beschikbaar.";
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 10000
          }
        );
      });

      setTimeout(() => map.invalidateSize(), 150);

    } else if (status) {
      status.textContent =
        "De kaartbibliotheek kon niet laden.";
    }

    // Filters voor wandelroutes.

    const distanceFilter = document.getElementById(
      "ppDistanceFilter"
    );

    const dayFilter = document.getElementById(
      "ppDayFilter"
    );

    const routeCards = [
      ...document.querySelectorAll(
        ".pp-route-card[data-distance]"
      )
    ];

    const routeCount = document.getElementById(
      "ppRouteCount"
    );

    const updateRouteFilter = () => {

      const distance =
        distanceFilter?.value || "all";

      let visible = 0;

      routeCards.forEach(card => {

        const matches =
          distance === "all" ||
          card.dataset.distance === distance;

        card.hidden = !matches;

        if (matches) {
          visible++;
        }
      });

      if (routeCount) {

        const dateText =
          dayFilter?.selectedOptions[0]
            ?.textContent || "de gekozen avond";

        routeCount.textContent =
          `${visible} conceptafstand(en) voor ${dateText}. ` +
          "Definitieve wandelroutes volgen na vaststelling.";
      }
    };

    distanceFilter?.addEventListener(
      "change",
      updateRouteFilter
    );

    dayFilter?.addEventListener(
      "change",
      updateRouteFilter
    );

    updateRouteFilter();
  }


  // ==========================================
  // 3. PUBLIEK INSCHRIJFFORMULIER
  // ==========================================

  const registrationForm = document.getElementById(
    "ppRegistrationForm"
  );

  if (registrationForm) {

    const participants = document.getElementById(
      "ppParticipants"
    );

    const addButton = document.getElementById(
      "ppAddParticipant"
    );

    const countElement = document.getElementById(
      "ppParticipantCount"
    );

    const priceElement = document.getElementById(
      "ppTotalPrice"
    );

    const distanceSelect = document.getElementById(
      "ppDistanceSelect"
    );

    const maxParticipants = 8;


    // ========================================
    // 4. FORMULIERTEKSTEN
    // ========================================

    const notice = registrationForm.querySelector(
      ".pp-notice"
    );

    if (notice) {

      const title = notice.querySelector("strong");
      const description = notice.querySelector("p");

      if (title) {
        title.textContent =
          "Inschrijving voorbereiden";
      }

      if (description) {
        description.textContent =
          "Controleer alle gegevens op de volgende pagina. " +
          "De inschrijving wordt pas na bevestiging " +
          "opgeslagen in de lokale testdatabase. " +
          "Er wordt nog niet betaald.";
      }
    }

    const agreement = registrationForm.querySelector(
      ".pp-checkbox span"
    );

    if (agreement) {
      agreement.textContent =
        "Ik begrijp dat mijn testinschrijving " +
        "na de laatste bevestiging in de database " +
        "wordt opgeslagen, zonder betaling.";
    }


    // ========================================
    // 5. DEELNEMERS EN PRIJS
    // ========================================

    const getCount = () => {
      return participants.querySelectorAll(
        ".pp-participant"
      ).length;
    };

    const updateSummary = () => {

      const count = getCount();
      const total = count * PRICE_PER_PERSON;

      if (countElement) {
        countElement.textContent =
          `${count} deelnemer${count === 1 ? "" : "s"}`;
      }

      if (priceElement) {
        priceElement.textContent =
          total.toLocaleString("nl-NL", {
            style: "currency",
            currency: "EUR"
          });
      }

      if (addButton) {
        addButton.disabled =
          count >= maxParticipants;
      }
    };


    // ========================================
    // 6. NIEUWE DEELNEMER MAKEN
    // INCLUSIEF BEGELEIDERSVRAAG
    // ========================================

    const createParticipant = number => {

      const fieldset = document.createElement(
        "fieldset"
      );

      fieldset.className = "pp-participant";

      fieldset.innerHTML = `
        <legend>Deelnemer ${number}</legend>

        <div class="pp-field-grid">

          <label>
            Voornaam
            <input
              name="voornaam[]"
              type="text"
              maxlength="80"
              required>
          </label>

          <label>
            Achternaam
            <input
              name="achternaam[]"
              type="text"
              maxlength="80"
              required>
          </label>

        </div>

        <div class="pp-field-grid">

          <label>
            School of groep
            <input
              name="school[]"
              type="text"
              maxlength="100"
              placeholder="Bijv. De Regenboog">
          </label>

          <label>
            Geboortedatum
            <input
              name="geboortedatum[]"
              type="date"
              required>
          </label>

        </div>

        <label>
          Hoeveelste deelname?
          <input
            name="keer[]"
            type="number"
            min="1"
            max="50"
            value="1"
            required>
        </label>

        <div style="
          padding-top:20px;
          margin-top:12px;
          border-top:1px solid #e1e9e2;">

          <label>
            Loopt deze deelnemer
            met een begeleider mee?

            <select
              name="begeleider[]"
              required>

              <option
                value=""
                selected
                disabled>
                Maak een keuze
              </option>

              <option value="nee">
                Nee, zonder begeleider
              </option>

              <option value="ja">
                Ja, met begeleider
              </option>

            </select>
          </label>

          <p
            class="pp-muted"
            style="font-size:13px;margin-top:10px;">

            Een begeleider loopt mee tijdens
            de wandeltocht. De contactpersoon
            hoeft niet dezelfde persoon te zijn.

          </p>

        </div>

        <button
          type="button"
          class="pp-btn pp-btn--light pp-remove-person">

          Verwijder deze deelnemer

        </button>
      `;

      return fieldset;
    };


    // ========================================
    // 7. DEELNEMER TOEVOEGEN
    // ========================================

    addButton?.addEventListener("click", () => {

      if (getCount() >= maxParticipants) {
        return;
      }

      participants.appendChild(
        createParticipant(getCount() + 1)
      );

      updateSummary();
    });


    // ========================================
    // 8. DEELNEMER VERWIJDEREN
    // ========================================

    participants?.addEventListener(
      "click",
      event => {

        const button = event.target.closest(
          ".pp-remove-person"
        );

        if (!button) {
          return;
        }

        button.closest(
          ".pp-participant"
        )?.remove();

        participants.querySelectorAll(
          ".pp-participant"
        ).forEach((person, index) => {

          person.querySelector(
            "legend"
          ).textContent = `Deelnemer ${index + 1}`;
        });

        updateSummary();
      }
    );

    updateSummary();


    // ========================================
    // 9. INSCHRIJFFORMULIER VERWERKEN
    // ========================================

    registrationForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        if (!registrationForm.reportValidity()) {
          return;
        }

        const fieldsets = [
          ...participants.querySelectorAll(
            ".pp-participant"
          )
        ];

        // Alle gegevens PER deelnemer ophalen.
        const deelnemers = fieldsets.map(fieldset => {

          const voornaam = fieldset.querySelector(
            '[name="voornaam[]"]'
          ).value.trim();

          const achternaam = fieldset.querySelector(
            '[name="achternaam[]"]'
          ).value.trim();

          const schoolOfGroep = fieldset.querySelector(
            '[name="school[]"]'
          ).value.trim();

          const geboortedatum = fieldset.querySelector(
            '[name="geboortedatum[]"]'
          ).value;

          const hoeveelheidKeer = Number(
            fieldset.querySelector(
              '[name="keer[]"]'
            ).value
          );

          // NIEUW: begeleiderskeuze ophalen.
          const begeleiderKeuze = fieldset.querySelector(
            '[name="begeleider[]"]'
          ).value;

          return {
            voornaam,
            achternaam,
            schoolOfGroep,
            geboortedatum,
            hoeveelheidKeer,

            // Ja wordt true, Nee wordt false.
            neemtBegeleiderMee:
              begeleiderKeuze === "ja",

            // Alleen voor controle van de invoer.
            begeleiderKeuze
          };
        });


        // ====================================
        // 10. GEGEVENS CONTROLEREN
        // ====================================

        const distance = Number(
          distanceSelect.value
        );

        if (![5, 10].includes(distance)) {

          window.alert(
            "Kies 5 of 10 kilometer."
          );

          return;
        }

        if (
          deelnemers.length < 1 ||
          deelnemers.length > maxParticipants
        ) {

          window.alert(
            "Voeg minimaal één en maximaal acht deelnemers toe."
          );

          return;
        }

        const invalidParticipant = deelnemers.some(
          deelnemer => {

            return (
              !deelnemer.voornaam ||
              !deelnemer.achternaam ||
              !deelnemer.geboortedatum ||
              deelnemer.voornaam.length > 80 ||
              deelnemer.achternaam.length > 80 ||
              !Number.isInteger(
                deelnemer.hoeveelheidKeer
              ) ||
              deelnemer.hoeveelheidKeer < 1 ||
              deelnemer.hoeveelheidKeer > 50 ||
              !["ja", "nee"].includes(
                deelnemer.begeleiderKeuze
              )
            );
          }
        );

        if (invalidParticipant) {

          window.alert(
            "Controleer alle deelnemergegevens " +
            "en kies per deelnemer Ja of Nee " +
            "bij de begeleidersvraag."
          );

          return;
        }

        const now = new Date();

        const today =
          now.getFullYear() + "-" +
          String(now.getMonth() + 1).padStart(2, "0") + "-" +
          String(now.getDate()).padStart(2, "0");

        if (
          deelnemers.some(
            deelnemer =>
              deelnemer.geboortedatum > today
          )
        ) {

          window.alert(
            "Een geboortedatum mag niet in de toekomst liggen."
          );

          return;
        }

        const email = registrationForm.querySelector(
          '[name="email"]'
        ).value.trim();

        const telefoonnummer = registrationForm.querySelector(
          '[name="telefoon"]'
        ).value.trim();


        // ====================================
        // 11. GEGEVENS TIJDELIJK OPSLAAN
        // ====================================

        // De begeleiderKeuze is alleen nodig
        // tijdens het controleren van het formulier.
        // De backend ontvangt de boolean.
        const deelnemersVoorBackend = deelnemers.map(
          ({ begeleiderKeuze, ...gegevens }) => gegevens
        );

        const draft = {

          afstandKm: distance,

          aantalDeelnemers:
            deelnemersVoorBackend.length,

          contactpersoon: {
            email,
            telefoonnummer
          },

          deelnemers: deelnemersVoorBackend
        };

        try {

          sessionStorage.setItem(
            REGISTRATION_KEY,
            JSON.stringify(draft)
          );

        } catch (error) {

          console.error(error);

          window.alert(
            "Je gegevens konden niet tijdelijk " +
            "worden opgeslagen."
          );

          return;
        }

        // Nog niet naar de database sturen.
        // Eerst de controlepagina openen.
        window.location.assign(
          "betalen.html"
        );
      }
    );
  }


  // ==========================================
  // 12. CONTACTFORMULIER
  // ==========================================

  const contactForm = document.getElementById(
    "ppContactForm"
  );

  if (contactForm) {

    const subject = document.getElementById(
      "ppSubject"
    );

    const message = document.getElementById(
      "ppMessage"
    );

    const counter = document.getElementById(
      "ppMessageCount"
    );

    const status = document.getElementById(
      "ppContactStatus"
    );

    const params = new URLSearchParams(
      window.location.search
    );

    if (params.get("onderwerp") === "sponsoring") {
      subject.value = "Sponsoring";
    }

    const updateCounter = () => {

      if (counter) {
        counter.textContent =
          `${message.value.length} / 2000 tekens`;
      }
    };

    message?.addEventListener(
      "input",
      updateCounter
    );

    updateCounter();

    contactForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        if (!contactForm.reportValidity()) {
          return;
        }

        if (status) {
          status.textContent =
            "Demo: je formulier is gecontroleerd, " +
            "maar het bericht is nog niet verzonden. " +
            "De backendkoppeling volgt later.";
        }
      }
    );
  }


  // ==========================================
  // 13. CONTROLEPAGINA
  // ==========================================

  const paymentButton = document.getElementById(
    "ppPaymentDemo"
  );

  if (paymentButton) {

    const paymentStatus = document.getElementById(
      "ppPaymentStatus"
    );

    let draft = null;

    try {

      const saved = sessionStorage.getItem(
        REGISTRATION_KEY
      );

      if (saved) {
        draft = JSON.parse(saved);
      }

    } catch (error) {

      console.warn(
        "Inschrijfgegevens lezen mislukt.",
        error
      );
    }

    const countElement = document.getElementById(
      "ppPaymentCount"
    );

    const distanceElement = document.getElementById(
      "ppPaymentDistance"
    );

    const totalElement = document.getElementById(
      "ppPaymentTotal"
    );


    // ========================================
    // 14. OVERZICHT INVULLEN
    // ========================================

    if (
      draft &&
      Array.isArray(draft.deelnemers)
    ) {

      if (countElement) {
        countElement.textContent = String(
          draft.aantalDeelnemers
        );
      }

      if (distanceElement) {
        distanceElement.textContent =
          draft.afstandKm + " km";
      }

      if (totalElement) {

        totalElement.textContent = (
          draft.aantalDeelnemers *
          PRICE_PER_PERSON
        ).toLocaleString("nl-NL", {
          style: "currency",
          currency: "EUR"
        });
      }

      // Deelnemers met begeleiderskeuze tonen.
      const overviewCard = countElement?.closest(
        ".pp-card"
      );

      if (overviewCard) {

        const review = document.createElement(
          "div"
        );

        review.style.marginTop = "22px";

        const heading = document.createElement(
          "strong"
        );

        heading.textContent =
          "Controleer je deelnemers";

        review.appendChild(heading);

        const list = document.createElement(
          "ul"
        );

        list.style.marginTop = "10px";

        draft.deelnemers.forEach(
          (deelnemer, index) => {

            const item = document.createElement(
              "li"
            );

            item.style.marginBottom = "10px";

            const begeleider = deelnemer
              .neemtBegeleiderMee
              ? "Ja"
              : "Nee";

            item.textContent =
              "Deelnemer " + (index + 1) + ": " +
              deelnemer.voornaam + " " +
              deelnemer.achternaam +
              " · Geboren: " +
              deelnemer.geboortedatum +
              " · Begeleider: " +
              begeleider;

            list.appendChild(item);
          }
        );

        review.appendChild(list);

        const contact = document.createElement(
          "p"
        );

        contact.className = "pp-muted";

        contact.textContent =
          "Contact: " +
          draft.contactpersoon.email;

        review.appendChild(contact);

        overviewCard.appendChild(review);
      }
    }


    // ========================================
    // 15. CONTROLEPAGINA AANPASSEN
    // ========================================

    const panel = paymentButton.closest(
      ".pp-card"
    );

    const notice = panel?.querySelector(
      ".pp-notice"
    );

    const panelTitle = panel?.querySelector(
      "h2"
    );

    const noteTitle = notice?.querySelector(
      "strong"
    );

    const noteBody = notice?.querySelector(
      "p"
    );

    if (panelTitle) {
      panelTitle.textContent =
        "Inschrijving bevestigen";
    }

    if (noteTitle) {
      noteTitle.textContent =
        "Geen online betaling";
    }

    if (noteBody) {
      noteBody.textContent =
        "Na bevestiging slaan we deze " +
        "testinschrijving op in PostgreSQL. " +
        "Er wordt geen geld afgeschreven.";
    }

    paymentButton.textContent =
      "Inschrijving bevestigen";

    if (
      !draft ||
      !Array.isArray(draft.deelnemers) ||
      draft.deelnemers.length === 0
    ) {

      paymentButton.disabled = true;

      if (paymentStatus) {

        paymentStatus.textContent =
          "Geen inschrijfgegevens gevonden. " +
          "Ga eerst naar de inschrijfpagina.";
      }
    }


    // ========================================
    // 16. INSCHRIJVING OPSLAAN
    // ========================================

    paymentButton.addEventListener(
      "click",
      async () => {

        if (
          !draft ||
          paymentButton.disabled
        ) {
          return;
        }

        paymentButton.disabled = true;

        if (paymentStatus) {
          paymentStatus.textContent =
            "Inschrijving controleren...";
        }

        try {

          // Open evenement ophalen.
          const eventResponse = await fetch(
            API_URL + "/api/Evenement",
            {
              cache: "no-store"
            }
          );

          if (!eventResponse.ok) {
            throw new Error(
              "Evenementen konden niet worden opgehaald."
            );
          }

          const events = await eventResponse.json();

          const openEvents = events.filter(
            event => {

              return (
                event.inschrijvingGeopend === true &&
                typeof event.datum === "string" &&
                event.datum.startsWith("2027-")
              );
            }
          );

          if (openEvents.length !== 1) {

            throw new Error(
              openEvents.length === 0
                ? "Er is geen open evenement voor 2027."
                : "Er zijn meerdere open evenementen. " +
                  "De organisatie moet eerst het evenement kiezen."
            );
          }

          // Inclusief begeleiderskeuze.
          const body = {

            evenementId:
              openEvents[0].evenementId,

            afstandKm:
              draft.afstandKm,

            aantalDeelnemers:
              draft.aantalDeelnemers,

            contactpersoon:
              draft.contactpersoon,

            deelnemers:
              draft.deelnemers
          };

          const response = await fetch(
            API_URL + "/api/Inschrijving",
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json"
              },

              body: JSON.stringify(body)
            }
          );

          if (!response.ok) {

            throw new Error(
              "Opslaan mislukt (HTTP " +
              response.status +
              "). Probeer het opnieuw."
            );
          }

          const created = await response.json();

          sessionStorage.removeItem(
            REGISTRATION_KEY
          );

          draft = null;

          if (paymentStatus) {
            paymentStatus.textContent =
              "Inschrijving #" +
              created.inschrijvingId +
              " is opgeslagen! Status: " +
              created.status +
              ". Er is nog niet betaald.";
          }

          paymentButton.textContent =
            "Inschrijving opgeslagen";

        } catch (error) {

          console.error(error);

          if (paymentStatus) {
            paymentStatus.textContent =
              error.message;
          }

          paymentButton.disabled = false;
        }
      }
    );
  }

});
