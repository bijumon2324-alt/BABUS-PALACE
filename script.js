// ==========================================
// BABUS PALACE - FIREBASE BOOKING SCRIPT
// WITH ROOM PRICES + PDF BOOKING RECEIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("bookingModal");
    const form = document.getElementById("bookingForm");

    // ------------------------------------------
    // ROOM PRICES
    // ------------------------------------------
    const roomPrices = {
        "Standard Room": 2600,
        "Deluxe Room": 3800,
        "Family Room": 4700
    };

    // ------------------------------------------
    // FIREBASE CONFIG
    // ------------------------------------------
    const firebaseConfig = {
        apiKey: "AIzaSyC1IpCqOqA7zVNhsKBuJdNv9oYk4wEQtAtg",
        authDomain: "babus-palace.firebaseapp.com",
        projectId: "babus-palace",
        storageBucket: "babus-palace.firebasestorage.app",
        messagingSenderId: "432285024629",
        appId: "1:432285024629:web:f0ae81a3a2e99479e8d33c",
        measurementId: "G-P8TE61PCDE"
    };

    let firebaseReady = false;

    // ------------------------------------------
    // LOAD EXTERNAL SCRIPT
    // ------------------------------------------
    function loadScript(src) {
        return new Promise((resolve, reject) => {

            const existing = document.querySelector(
                `script[src="${src}"]`
            );

            if (existing) {

                if (
                    existing.dataset.loaded === "true" ||
                    (src.includes("firebase") && window.firebase) ||
                    (src.includes("jspdf") && window.jspdf)
                ) {
                    resolve();
                    return;
                }

                existing.addEventListener(
                    "load",
                    resolve,
                    { once: true }
                );

                existing.addEventListener(
                    "error",
                    reject,
                    { once: true }
                );

                return;
            }

            const s = document.createElement("script");

            s.src = src;

            s.onload = function () {
                s.dataset.loaded = "true";
                resolve();
            };

            s.onerror = function () {
                reject(
                    new Error("Could not load external script.")
                );
            };

            document.head.appendChild(s);
        });
    }

    // ------------------------------------------
    // FIREBASE INITIALIZATION
    // ------------------------------------------
    async function initFirebase() {

        if (firebaseReady && window.firebase) {
            return window.firebase;
        }

        await loadScript(
            "https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js"
        );

        await loadScript(
            "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore-compat.js"
        );

        if (!window.firebase.apps.length) {
            window.firebase.initializeApp(firebaseConfig);
        }

        firebaseReady = true;

        return window.firebase;
    }

    initFirebase().catch(error => {
        console.error("Firebase startup error:", error);
    });


    // ------------------------------------------
    // LOAD jsPDF
    // ------------------------------------------
    async function initPDF() {

        if (window.jspdf) {
            return window.jspdf;
        }

        await loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        );

        return window.jspdf;
    }


    // ------------------------------------------
    // CALCULATE NIGHTS
    // ------------------------------------------
    function calculateNights(checkIn, checkOut) {

        const start = new Date(checkIn);
        const end = new Date(checkOut);

        const difference =
            end.getTime() - start.getTime();

        return Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );
    }


    // ------------------------------------------
    // FORMAT CURRENCY
    // ------------------------------------------
    function formatCurrency(amount) {

        return "₹" +
            Number(amount).toLocaleString("en-IN");
    }


    // ------------------------------------------
    // OPEN BOOKING WINDOW
    // ------------------------------------------
    window.bookRoom = function (roomName) {

        if (!modal) {
            console.error("Booking modal not found.");
            return;
        }

        const roomInput =
            document.getElementById("bookingRoom");

        if (roomInput) {
            roomInput.value = roomName;
        }

        modal.style.display = "flex";

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";
    };


    // ------------------------------------------
    // CLOSE BOOKING WINDOW
    // ------------------------------------------
    function closeBooking() {

        if (!modal) return;

        modal.style.display = "none";

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";
    }


    document
        .querySelectorAll(".modal-close")
        .forEach(button => {

            button.addEventListener(
                "click",
                closeBooking
            );

        });


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {
                    closeBooking();
                }

            }
        );
    }


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeBooking();
            }

        }
    );


    // ------------------------------------------
    // CREATE PDF RECEIPT
    // ------------------------------------------
    async function createBookingReceipt(
        bookingId,
        booking
    ) {

        const pdfLibrary =
            await initPDF();

        const { jsPDF } =
            pdfLibrary;

        const doc =
            new jsPDF();

        const pageWidth =
            doc.internal.pageSize.getWidth();


        // HEADER
        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(24);

        doc.text(
            "BABUS PALACE",
            pageWidth / 2,
            25,
            { align: "center" }
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(11);

        doc.text(
            "Kalady, Ernakulam, Kerala",
            pageWidth / 2,
            34,
            { align: "center" }
        );

        doc.text(
            "Phone: +91 75103 92411",
            pageWidth / 2,
            41,
            { align: "center" }
        );


        // TITLE
        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(18);

        doc.text(
            "BOOKING RECEIPT",
            pageWidth / 2,
            58,
            { align: "center" }
        );


        // BOOKING ID
        doc.setFontSize(11);

        doc.text(
            "Booking ID:",
            20,
            75
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.text(
            bookingId,
            65,
            75
        );


        // STATUS
        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.text(
            "Status:",
            20,
            84
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.text(
            "Pending Confirmation",
            65,
            84
        );


        // GUEST DETAILS
        let y = 103;

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(13);

        doc.text(
            "Guest Details",
            20,
            y
        );

        y += 10;

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(11);

        doc.text(
            "Guest Name:",
            20,
            y
        );

        doc.text(
            String(booking.name),
            70,
            y
        );

        y += 9;

        doc.text(
            "Phone:",
            20,
            y
        );

        doc.text(
            String(booking.phone),
            70,
            y
        );

        y += 9;

        doc.text(
            "Email:",
            20,
            y
        );

        doc.text(
            String(booking.email),
            70,
            y
        );


        // ROOM DETAILS
        y += 18;

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(13);

        doc.text(
            "Room Details",
            20,
            y
        );

        y += 10;

        doc
