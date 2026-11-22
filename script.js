// ===============================
// BABUS PALACE - MAIN SCRIPT
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    // -------------------------------
    // BOOKING POPUP
    // -------------------------------

    const bookingModal = document.getElementById("bookingModal");
    const closeBooking = document.getElementById("closeBooking");
    const bookingForm = document.getElementById("bookingForm");

    // Open booking popup
    document.querySelectorAll(
        ".book-btn, .book-now, .booking-btn, [data-booking]"
    ).forEach(function (button) {

        button.addEventListener("click", function (e) {
            e.preventDefault();

            if (bookingModal) {
                bookingModal.style.display = "flex";
                document.body.style.overflow = "hidden";
            }
        });

    });

    // Close with X button
    if (closeBooking) {
        closeBooking.addEventListener("click", function () {
            closeModal();
        });
    }

    // Close when clicking outside popup
    if (bookingModal) {
        bookingModal.addEventListener("click", function (e) {
            if (e.target === bookingModal) {
                closeModal();
            }
        });
    }

    // Close function
    function closeModal() {
        if (bookingModal) {
            bookingModal.style.display = "none";
            document.body.style.overflow = "";
        }
    }

    // Close with ESC key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeModal();
        }
    });


    // -------------------------------
    // BOOKING FORM
    // -------------------------------

    if (bookingForm) {

        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("guestName")?.value.trim();
            const phone = document.getElementById("guestPhone")?.value.trim();
            const email = document.getElementById("guestEmail")?.value.trim();
            const checkIn = document.getElementById("checkIn")?.value;
            const checkOut = document.getElementById("checkOut")?.value;
            const room = document.getElementById("roomType")?.value;

            if (!name || !phone || !checkIn || !checkOut || !room) {
                alert("Please fill in all required booking details.");
                return;
            }

            if (new Date(checkOut) <= new Date(checkIn)) {
                alert("Check-out date must be after check-in date.");
                return;
            }

            const booking = {
                id: Date.now(),
                name: name,
                phone: phone,
                email: email || "",
                checkIn: checkIn,
                checkOut: checkOut,
                room: room,
                status: "Pending",
                createdAt: new Date().toLocaleString()
            };

            // Save booking
            let bookings =
                JSON.parse(localStorage.getItem("babusPalaceBookings")) || [];

            bookings.push(booking);

            localStorage.setItem(
                "babusPalaceBookings",
                JSON.stringify(bookings)
            );

            alert(
                "Booking request submitted successfully!\n\n" +
                "Guest: " + name +
                "\nRoom: " + room
            );

            bookingForm.reset();
            closeModal();
        });
    }


    // -------------------------------
    // ADMIN LOGIN BUTTON
    // -------------------------------

    const adminButtons = document.querySelectorAll(
        ".admin-login, #adminLogin, [data-admin-login]"
    );

    adminButtons.forEach(function (button) {

        button.addEventListener("click", function (e) {
            e.preventDefault();

            window.location.href = "admin.html";
        });

    });


    // -------------------------------
    // ROOM BUTTONS
    // -------------------------------

    document.querySelectorAll(".room-card").forEach(function (roomCard) {

        const button = roomCard.querySelector(
            ".book-btn, .book-now, .booking-btn"
        );

        if (button) {

            button.addEventListener("click", function () {

                const roomName =
                    roomCard.querySelector("h3")?.textContent.trim();

                const roomInput =
                    document.getElementById("roomType");

                if (roomInput && roomName) {
                    roomInput.value = roomName;
                }

            });

        }

    });


    // -------------------------------
    // CURRENT YEAR
    // -------------------------------

    document.querySelectorAll(".current-year").forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });


    // -------------------------------
    // MOBILE MENU
    // -------------------------------

    const menuButton =
        document.querySelector(".menu-toggle") ||
        document.querySelector("#menuToggle");

    const navMenu =
        document.querySelector(".nav-links") ||
        document.querySelector("#navLinks");

    if (menuButton && navMenu) {

        menuButton.addEventListener("click", function () {
            navMenu.classList.toggle("active");
        });

    }


    // -------------------------------
    // SMOOTH SCROLL
    // -------------------------------

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {

        link.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");

            if (targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {
                e.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        });

    });

});
