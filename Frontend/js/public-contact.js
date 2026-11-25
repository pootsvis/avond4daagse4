
document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // AVOND4DAAGSE 2027
  // PUBLIEK CONTACTFORMULIER
  // ==========================================

  const API_URL = "http://localhost:5278";

  const contactForm = document.getElementById(
    "ppContactForm"
  );

  if (!contactForm) {
    return;
  }

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

  const submitButton = contactForm.querySelector(
    'button[type="submit"]'
  );

  // ==========================================
  // 1. ONDERWERP VAN SPONSORPAGINA
  // ==========================================

  const params = new URLSearchParams(
    window.location.search
  );

  if (
    params.get("onderwerp") === "sponsoring" &&
    subject
  ) {
    subject.value = "Sponsoring";
  }


  // ==========================================
  // 2. TEKENS TELLEN
  // ==========================================

  const updateCounter = () => {

    if (counter && message) {
      counter.textContent =
        `${message.value.length} / 2000 tekens`;
    }
  };

  message?.addEventListener(
    "input",
    updateCounter
  );

  updateCounter();


  // ==========================================
  // 3. CONTACTFORMULIER VERZENDEN
  // ==========================================

  contactForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      if (!contactForm.reportValidity()) {
        return;
      }

      const voornaam = contactForm.querySelector(
        '[name="voornaam"]'
      ).value.trim();

      const achternaam = contactForm.querySelector(
        '[name="achternaam"]'
      ).value.trim();

      const email = contactForm.querySelector(
        '[name="email"]'
      ).value.trim();

      const onderwerp = subject.value;

      const bericht = message.value.trim();

      if (
        !voornaam ||
        !achternaam ||
        !email ||
        !onderwerp ||
        !bericht
      ) {

        status.textContent =
          "Vul alle verplichte velden in.";

        return;
      }

      // DTO die de backend verwacht.
      const contactvraag = {
        voornaam,
        achternaam,
        email,
        onderwerp,
        bericht
      };

      submitButton.disabled = true;

      status.textContent =
        "Je bericht wordt verzonden...";

      try {

        const response = await fetch(
          API_URL + "/api/ContactVraag",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify(contactvraag)
          }
        );

        if (!response.ok) {

          throw new Error(
            "Verzenden mislukt (HTTP " +
            response.status +
            ")."
          );
        }

        const result = await response.json();

        // Alleen na succesvolle opslag.
        status.textContent =
          "Je bericht is succesvol opgeslagen! " +
          "Contactvraag #" +
          result.contactvraagId +
          " heeft de status Nieuw.";

        contactForm.reset();

        updateCounter();

      } catch (error) {

        console.error(
          "Contactformulier fout:",
          error
        );

        status.textContent =
          "Je bericht kon niet worden verzonden. " +
          "Controleer of de backend actief is " +
          "en probeer opnieuw.";

      } finally {

        submitButton.disabled = false;
      }
    }
  );

});
