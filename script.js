// ==========================================
// BABUS PALACE - FIREBASE BOOKING SCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("bookingModal");
    const form = document.getElementById("bookingForm");

    // ------------------------------------------
    // FIREBASE CONFIG
    // ------------------------------------------
    const firebaseConfig = {
        apiKey: "AIzaSyC1gIpOqA7zVNhsKBuJdNv9oYk4wEQtAtg",
        authDomain: "babus-palace.firebaseapp.com",
        projectId: "babus-palace",
        storageBucket: "babus-palace.firebasestorage.app",
        messagingSenderId: "432285024629",
        appId: "1:432285024629:web:f0ae81a3a2e99479e8d33c",
        measurementId: "G-P8TE61PCDE"
    };

    let firebaseReady = false;

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                existing.addEventListener("load", resolve, { once: true });
                if (window.firebase) resolve();
                return;
            }

            const s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = () => reject(new Error("Could not load Firebase SDK."));
            document.head.appendChild(s);
        });
    }

    async function initFirebase() {
        if (firebaseReady && window.firebase) return window.firebase;

        await loadScript("https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore-compat.js");

        if (!window.firebase.apps.length) {
            window.firebase.initializeApp(firebaseConfig);
        }

        firebaseReady = true;
        return window.firebase;
    }

    // Start loading Firebase while the page is open.
    initFirebase().catch(error => console.error("Firebase startup error:", error));

    // ------------------------------------------
    // OPEN BOOKING WINDOW
    // ------------------------------------------
    window.bookRoom = function (roomName) {
        if (!modal) {
            console.error("Booking modal not found.");
            return;
        }

        const roomInput = document.getElementById("bookingRoom");
        if (roomInput) roomInput.value = roomName;

        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    // ------------------------------------------
    // CLOSE BOOKING WINDOW
    // ------------------------------------------
    function closeBooking() {
        if (!modal) return;
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    document.querySelectorAll(".modal-close").forEach(button => {
        button.addEventListener("click", closeBooking);
    });

    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) closeBooking();
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeBooking();
    });

    // ------------------------------------------
    // BOOKING FORM
    // ------------------------------------------
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const room = form.elements["room"]?.value.trim();
            const checkIn = form.elements["checkin"]?.value;
            const checkOut = form.elements["checkout"]?.value;
            const guests = form.elements["guests"]?.value;
            const phone = form.elements["phone"]?.value.trim();
            const name = form.elements["name"]?.value.trim();
            const email = form.elements["email"]?.value.trim();

            if (!room || !checkIn || !checkOut || !guests || !phone || !name || !email) {
                alert("Please fill in all booking details.");
                return;
            }

            if (new Date(checkOut) <= new Date(checkIn)) {
                alert("Check-out date must be after check-in date.");
                return;
            }

            const submitButton = form.querySelector("button[type='submit']");
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Saving Booking...";
            }

            const booking = {
                room,
                checkIn,
                checkOut,
                guests: Number(guests),
                phone,
                name,
                email,
                status: "Pending",
                createdAt: new Date().toISOString()
            };

            // Open WhatsApp from the user click before the async Firebase operation.
            const message =
                "🏨 *BABUS PALACE - ROOM BOOKING*\n\n" +
                "*Room:* " + room + "\n" +
                "*Guest Name:* " + name + "\n" +
                "*Guests:* " + guests + "\n" +
                "*Check-in:* " + checkIn + "\n" +
                "*Check-out:* " + checkOut + "\n" +
                "*Phone:* " + phone + "\n" +
                "*Email:* " + email;

            const whatsappURL =
                "https://wa.me/917510392411?text=" + encodeURIComponent(message);

            let whatsappWindow = null;
            try {
                whatsappWindow = window.open(whatsappURL, "_blank");
            } catch (e) {
                console.warn("WhatsApp window could not be opened.", e);
            }

            try {
                const firebase = await initFirebase();
                const db = firebase.firestore();

                const docRef = await db.collection("bookings").add(booking);

                // Keep a local copy too, for backup on this device.
                const localBookings = JSON.parse(
                    localStorage.getItem("babusPalaceBookings") || "[]"
                );
                localBookings.push({ id: docRef.id, ...booking });
                localStorage.setItem("babusPalaceBookings", JSON.stringify(localBookings));

                alert("Booking request sent successfully!\n\nRoom: " + room);
                form.reset();
                closeBooking();

                // If the browser blocked the first attempt, provide a normal navigation fallback.
                if (!whatsappWindow) {
                    window.location.href = whatsappURL;
                }
            } catch (error) {
                console.error("Firebase booking error:", error);
                alert(
                    "The WhatsApp message was prepared, but the booking could not be saved to the hotel database.\n\nPlease try again."
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Confirm Booking";
                }
            }
        });
    }

    // ------------------------------------------
    // HOTEL LOGIN
    // ------------------------------------------
    const hotelLogin = document.querySelector(".hotel-login");
    if (hotelLogin) {
        hotelLogin.addEventListener("click", function () {
            window.location.href = "admin.html";
        });
    }

    // ------------------------------------------
    // BACK TO TOP
    // ------------------------------------------
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
        backToTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ------------------------------------------
    // SMOOTH SCROLL
    // ------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            const targetId = this.getAttribute("href");
            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
});
