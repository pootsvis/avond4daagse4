
// =======================================
// AVOND4DAAGSE 2027
// PUBLIEKE HOMEPAGE - INTERACTIES
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    const page = document.querySelector("body.pub-home");

    if (!page) {
        return;
    }


    // ===================================
    // HERO AFBEELDING
    // ===================================

    const photo = page.querySelector(".pub-hero-photo");
    const hero = page.querySelector(".pub-hero");

    if (photo && hero) {

        const photoFailed = () => {
            hero.classList.add("pub-hero-no-photo");
            photo.hidden = true;

            console.warn(
                "Hero-afbeelding niet gevonden. Controleer: " +
                "Frontend/assets/images/hero-wandelaars.jpg"
            );
        };

        if (photo.complete && photo.naturalWidth === 0) {
            photoFailed();
        } else {
            photo.addEventListener(
                "error",
                photoFailed,
                { once: true }
            );
        }
    }


    // ===================================
    // LOCATIE SELECTEREN
    // ===================================

    const locationCards = [
        ...page.querySelectorAll(
            ".location-card[data-location]"
        )
    ];

    const selectedName = page.querySelector(
        "#selected-location-name"
    );

    const selectedDescription = page.querySelector(
        "#selected-location-description"
    );

    locationCards.forEach((card) => {

        const choice = card.querySelector(
            ".location-choice"
        );

        if (!choice) {
            return;
        }

        choice.addEventListener("click", () => {

            locationCards.forEach((otherCard) => {

                const button = otherCard.querySelector(
                    ".location-choice"
                );

                const isSelected = otherCard === card;

                otherCard.classList.toggle(
                    "selected",
                    isSelected
                );

                if (button) {
                    button.textContent = isSelected
                        ? "Gekozen"
                        : "Kies";

                    button.setAttribute(
                        "aria-pressed",
                        String(isSelected)
                    );
                }
            });


            // Tekst onderaan bijwerken
            const name = card.querySelector(
                ".location-identity h3"
            );

            const description = card.querySelector(
                ".location-description"
            );

            if (name && selectedName) {
                selectedName.textContent =
                    name.textContent.trim();
            }

            if (description && selectedDescription) {
                selectedDescription.textContent =
                    description.textContent.trim();
            }

        });

    });


    // ===================================
    // SCROLL ANIMATIES
    // ===================================

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const targets = page.querySelectorAll(
        ".info-card, " +
        ".location-card, " +
        ".locations-section .section-heading, " +
        ".selected-section .section-heading"
    );

    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add(
                    "pub-visible"
                );

                observer.unobserve(entry.target);

            });

        },
        {
            rootMargin: "0px 0px -12px 0px",
            threshold: 0.04
        }
    );

    targets.forEach((element) => {

        element.classList.add(
            "pub-reveal-ready"
        );

        observer.observe(element);

    });

});
