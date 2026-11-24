
// ============================================
// AVOND4DAAGSE 2027 - PUBLIEKE SUBPAGINA'S
// Geen backend of betalingen in deze demo.
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  // SCROLL-ANIMATIES

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    !reducedMotion &&
    "IntersectionObserver" in window
  ) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("pp-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: "0px 0px -16px 0px"
    });

    document.querySelectorAll(
      ".pp-reveal"
    ).forEach(element => {
      element.classList.add("pp-reveal-ready");
      observer.observe(element);
    });
  }


  // ==========================================
  // ROUTES - ECHTE OPENSTREETMAP-ONDERGROND
  // ==========================================

  const mapElement = document.getElementById("ppMap");

  if (mapElement) {
    const status = document.getElementById("ppMapStatus");

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
          status.textContent = "Je locatie wordt opgezocht...";
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
        "De kaartbibliotheek kon niet laden. Controleer je internetverbinding.";
    }

    // Filter op afstand

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
      const distance = distanceFilter?.value || "all";

      let visible = 0;

      routeCards.forEach(card => {
        const matches =
          distance === "all" ||
          card.dataset.distance === distance;

        card.hidden = !matches;

        if (matches) visible++;
      });

      if (routeCount) {
        const dateText = dayFilter?.selectedOptions[0]
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
  // INSCHRIJVEN - DEELNEMERS TOEVOEGEN
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
    const pricePerPerson = 8.50;

    const getCount = () =>
      participants.querySelectorAll(
        ".pp-participant"
      ).length;

    const updateSummary = () => {
      const count = getCount();
      const total = count * pricePerPerson;

      if (countElement) {
        countElement.textContent =
          `${count} deelnemer${count === 1 ? "" : "s"}`;
      }

      if (priceElement) {
        priceElement.textContent = total.toLocaleString(
          "nl-NL",
          {
            style: "currency",
            currency: "EUR"
          }
        );
      }

      if (addButton) {
        addButton.disabled =
          count >= maxParticipants;
      }
    };

    const createParticipant = number => {
      const fieldset = document.createElement("fieldset");

      fieldset.className = "pp-participant";

      fieldset.innerHTML = `
        <legend>Deelnemer ${number}</legend>

        <div class="pp-field-grid">
          <label>Voornaam
            <input name="voornaam[]" type="text"
              maxlength="80" required>
          </label>
          <label>Achternaam
            <input name="achternaam[]" type="text"
              maxlength="80" required>
          </label>
        </div>

        <div class="pp-field-grid">
          <label>School of groep
            <input name="school[]" type="text"
              maxlength="100"
              placeholder="Bijv. De Regenboog">
          </label>
          <label>Geboortedatum
            <input name="geboortedatum[]" type="date"
              required>
          </label>
        </div>

        <label>Hoeveelste deelname?
          <input name="keer[]" type="number"
            min="1" max="50" value="1" required>
        </label>

        <button type="button"
          class="pp-btn pp-btn--light pp-remove-person">
          Verwijder deze deelnemer
        </button>
      `;

      return fieldset;
    };

    addButton?.addEventListener("click", () => {
      if (getCount() >= maxParticipants) return;

      participants.appendChild(
        createParticipant(getCount() + 1)
      );

      updateSummary();
    });

    participants?.addEventListener("click", event => {
      const button = event.target.closest(
        ".pp-remove-person"
      );

      if (!button) return;

      button.closest(".pp-participant")?.remove();

      participants.querySelectorAll(
        ".pp-participant"
      ).forEach((person, index) => {
        person.querySelector("legend").textContent =
          `Deelnemer ${index + 1}`;
      });

      updateSummary();
    });

    updateSummary();

    registrationForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        if (!registrationForm.reportValidity()) {
          return;
        }

        const count = getCount();

        // Alleen demototalen onthouden.
        // Namen en contactgegevens worden niet opgeslagen.
        const demo = {
          count,
          distance: distanceSelect.value,
          total: count * pricePerPerson
        };

        try {
          sessionStorage.setItem(
            "a4d_registration_demo",
            JSON.stringify(demo)
          );
        } catch (error) {
          console.warn(
            "Demo-overzicht kon niet lokaal worden onthouden.",
            error
          );
        }

        window.location.href = "betalen.html";
      }
    );
  }


  // ==========================================
  // CONTACT - VALIDATIE EN ONDERWERP
  // ==========================================

  const contactForm = document.getElementById(
    "ppContactForm"
  );

  if (contactForm) {
    const subject = document.getElementById("ppSubject");
    const message = document.getElementById("ppMessage");
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

    message?.addEventListener("input", updateCounter);
    updateCounter();

    contactForm.addEventListener("submit", event => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      if (status) {
        status.textContent =
          "Demo: je formulier is gecontroleerd, " +
          "maar het bericht is nog niet verzonden. " +
          "De backendkoppeling volgt later.";
      }
    });
  }


  // ==========================================
  // BETALEN - ALLEEN DEMONSTRATIE
  // ==========================================

  const paymentDemo = document.getElementById(
    "ppPaymentDemo"
  );

  if (paymentDemo) {
    let demo = null;

    try {
      const saved = sessionStorage.getItem(
        "a4d_registration_demo"
      );

      if (saved) demo = JSON.parse(saved);
    } catch (error) {
      console.warn(
        "Demogegevens konden niet worden gelezen.",
        error
      );
    }

    const count = document.getElementById(
      "ppPaymentCount"
    );

    const distance = document.getElementById(
      "ppPaymentDistance"
    );

    const total = document.getElementById(
      "ppPaymentTotal"
    );

    if (demo) {
      if (count) {
        count.textContent = String(demo.count);
      }

      if (distance) {
        distance.textContent = demo.distance + " km";
      }

      if (total) {
        total.textContent = Number(
          demo.total
        ).toLocaleString("nl-NL", {
          style: "currency",
          currency: "EUR"
        });
      }
    }

    paymentDemo.addEventListener("click", () => {
      const status = document.getElementById(
        "ppPaymentStatus"
      );

      if (status) {
        status.textContent =
          "Demo: er is niets afgeschreven en er is " +
          "nog geen inschrijving in de database opgeslagen.";
      }
    });
  }

});
