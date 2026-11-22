// BABUS PALACE - Website Functions

function bookRoom(roomName) {
    const modal = document.getElementById("bookingModal");

    if (!modal) {
        alert("Booking system is loading. Please try again.");
        return;
    }

    const roomInput = document.getElementById("bookingRoom");

    if (roomInput) {
        roomInput.value = roomName;
    }

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeBooking() {
    const modal = document.getElementById("bookingModal");

    if (modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
}

document.addEventListener("DOMContentLoaded", function () {

    // BOOKING FORM
    const bookingForm = document.getElementById("bookingForm");

    if (bookingForm) {
        bookingForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const room = document.getElementById("bookingRoom")?.value || "";
            const name = document.getElementById("guestName")?.value.trim() || "";
            const phone = document.getElementById("guestPhone")?.value.trim() || "";
            const email = document.getElementById("guestEmail")?.value.trim() || "";
            const checkIn = document.getElementById("checkIn")?.value || "";
            const checkOut = document.getElementById("checkOut")?.value || "";
            const guests = document.getElementById("guests")?.value || "";

            if (!name || !phone || !checkIn || !checkOut || !guests) {
                alert("Please fill in all required booking details.");
                return;
            }

            if (new Date(checkOut) <= new Date(checkIn)) {
                alert("Check-out date must be after the check-in date.");
                return;
            }

            const message =
                "🏨 BABUS PALACE - ROOM BOOKING REQUEST\n\n" +
                "Room: " + room + "\n" +
                "Guest Name: " + name + "\n" +
                "Phone: " + phone + "\n" +
                "Email: " + (email || "Not provided") + "\n" +
                "Check-in: " + checkIn + "\n" +
                "Check-out: " + checkOut + "\n" +
                "Guests: " + guests;

            const whatsappNumber = "917510392411";

            const whatsappURL =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(message);

            window.open(whatsappURL, "_blank");

            closeBooking();
            bookingForm.reset();

            if (room) {
                const roomInput = document.getElementById("bookingRoom");

                if (roomInput) {
                    roomInput.value = room;
                }
            }
        });
    }

    // CLOSE BOOKING MODAL
    const modal = document.getElementById("bookingModal");

    if (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                closeBooking();
            }
        });
    }

    // ESCAPE KEY
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeBooking();
            closeLightbox();
        }
    });

    // GALLERY
    const galleryImages =
        document.querySelectorAll(".gallery-card img, .gallery img");

    galleryImages.forEach(function (image) {

        image.style.cursor = "pointer";

        image.addEventListener("click", function () {
            openLightbox(this.src, this.alt);
        });

    });

    // LOGO → HOME
    const logo = document.querySelector(".logo");

    if (logo) {
        logo.addEventListener("click", function (event) {

            const home = document.getElementById("home");

            if (home) {
                event.preventDefault();

                home.scrollIntoView({
                    behavior: "smooth"
                });
            }

        });
    }

    // MOBILE MENU
    const menuButton =
        document.querySelector(".menu-toggle, .menu-btn, .hamburger");

    const nav = document.querySelector("nav");

    if (menuButton && nav) {

        menuButton.addEventListener("click", function () {
            nav.classList.toggle("active");
        });

        nav.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {
                nav.classList.remove("active");
            });

        });
    }

    // BACK TO TOP
    const topButton = document.getElementById("backToTop");

    if (topButton) {

        window.addEventListener("scroll", function () {

            if (window.scrollY > 400) {
                topButton.classList.add("show");
            } else {
                topButton.classList.remove("show");
            }

        });

        topButton.addEventListener("click", function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });
    }

});

// LIGHTBOX
function openLightbox(imageSrc, imageAlt) {

    let lightbox = document.getElementById("imageLightbox");

    if (!lightbox) {

        lightbox = document.createElement("div");

        lightbox.id = "imageLightbox";

        lightbox.innerHTML = `
            <div class="lightbox-overlay">
                <button class="lightbox-close" aria-label="Close">&times;</button>
                <img class="lightbox-image" alt="">
            </div>
        `;

        document.body.appendChild(lightbox);

        lightbox
            .querySelector(".lightbox-overlay")
            .addEventListener("click", function (event) {

                if (event.target === this) {
                    closeLightbox();
                }

            });

        lightbox
            .querySelector(".lightbox-close")
            .addEventListener("click", closeLightbox);
    }

    const image = lightbox.querySelector(".lightbox-image");

    image.src = imageSrc;
    image.alt = imageAlt || "BABUS PALACE";

    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {

    const lightbox = document.getElementById("imageLightbox");

    if (lightbox) {

        lightbox.classList.remove("show");
        document.body.style.overflow = "";

    }
}
