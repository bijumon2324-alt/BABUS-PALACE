// ==========================================
// BABUS PALACE - COMPLETE WORKING SCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("bookingModal");
    const form = document.getElementById("bookingForm");

    // ==========================================
    // OPEN BOOKING WINDOW
    // ==========================================

    window.bookRoom = function (roomName) {

        if (!modal) {
            console.error("Booking modal not found.");
            return;
        }

        const roomInput = document.getElementById("bookingRoom");

        if (roomInput) {
            roomInput.value = roomName;
        }

        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };


    // ==========================================
    // CLOSE BOOKING WINDOW
    // ==========================================

    function closeBooking() {

        if (!modal) return;

        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }


    // X BUTTON
    document.querySelectorAll(".modal-close").forEach(function (button) {

        button.addEventListener("click", function () {

            closeBooking();

        });

    });


    // CLICK OUTSIDE MODAL
    if (modal) {

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {
                closeBooking();
            }

        });

    }


    // ESC KEY
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            closeBooking();
        }

    });


    // ==========================================
    // BOOKING FORM
    // ==========================================

    if (form) {

        form.addEventListener("submit", function (event) {

            event.preventDefault();

            const room =
                form.elements["room"]?.value.trim();

            const checkIn =
                form.elements["checkin"]?.value;

            const checkOut =
                form.elements["checkout"]?.value;

            const guests =
                form.elements["guests"]?.value;

            const phone =
                form.elements["phone"]?.value.trim();

            const name =
                form.elements["name"]?.value.trim();

            const email =
                form.elements["email"]?.value.trim();


            // REQUIRED FIELDS
            if (
                !room ||
                !checkIn ||
                !checkOut ||
                !guests ||
                !phone ||
                !name ||
                !email
            ) {

                alert("Please fill in all booking details.");

                return;
            }


            // DATE CHECK
            if (new Date(checkOut) <= new Date(checkIn)) {

                alert("Check-out date must be after check-in date.");

                return;
            }


            // ==========================================
            // SAVE BOOKING
            // ==========================================

            const booking = {

                id: Date.now(),

                room: room,

                checkIn: checkIn,

                checkOut: checkOut,

                guests: guests,

                phone: phone,

                name: name,

                email: email,

                status: "Pending",

                createdAt: new Date().toLocaleString()

            };


            let bookings =
                JSON.parse(
                    localStorage.getItem("babusPalaceBookings")
                ) || [];


            bookings.push(booking);


            localStorage.setItem(
                "babusPalaceBookings",
                JSON.stringify(bookings)
            );


            // ==========================================
            // WHATSAPP BOOKING MESSAGE
            // ==========================================

            const message =
                "🏨 *BABUS PALACE - ROOM BOOKING*%0A%0A" +

                "*Room:* " + encodeURIComponent(room) + "%0A" +

                "*Guest Name:* " + encodeURIComponent(name) + "%0A" +

                "*Guests:* " + encodeURIComponent(guests) + "%0A" +

                "*Check-in:* " + encodeURIComponent(checkIn) + "%0A" +

                "*Check-out:* " + encodeURIComponent(checkOut) + "%0A" +

                "*Phone:* " + encodeURIComponent(phone) + "%0A" +

                "*Email:* " + encodeURIComponent(email);


            const whatsappURL =
                "https://wa.me/917510392411?text=" + message;


            // Open WhatsApp
            window.open(whatsappURL, "_blank");


            // SUCCESS MESSAGE
            alert(
                "Booking request created successfully!\n\n" +
                "Room: " + room
            );


            // RESET FORM
            form.reset();


            // CLOSE WINDOW
            closeBooking();

        });

    }


    // ==========================================
    // HOTEL LOGIN
    // ==========================================

    const hotelLogin =
        document.querySelector(".hotel-login");

    if (hotelLogin) {

        hotelLogin.addEventListener("click", function () {

            window.location.href = "admin.html";

        });

    }


    // ==========================================
    // BACK TO TOP
    // ==========================================

    const backToTop =
        document.getElementById("backToTop");

    if (backToTop) {

        backToTop.addEventListener("click", function () {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        });

    }


    // ==========================================
    // SMOOTH SCROLL
    // ==========================================

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId =
                this.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }

        });

    });

});
