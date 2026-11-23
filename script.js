// ==========================================
// BABUS PALACE - FIREBASE BOOKING SCRIPT
// ROOM PRICES + FIREBASE + PDF RECEIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTS
    // ==========================================

    const modal = document.getElementById("bookingModal");
    const form = document.getElementById("bookingForm");

    // ==========================================
    // ROOM PRICES
    // ==========================================

    const roomPrices = {
        "Standard Room": 2600,
        "Deluxe Room": 3800,
        "Family Room": 4700
    };

    // ==========================================
    // FIREBASE CONFIG
    // ==========================================

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


    // ==========================================
    // LOAD EXTERNAL SCRIPT
    // ==========================================

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

            const script = document.createElement("script");

            script.src = src;

            script.onload = function () {
                script.dataset.loaded = "true";
                resolve();
            };

            script.onerror = function () {
                reject(
                    new Error(
                        "Could not load external script: " + src
                    )
                );
            };

            document.head.appendChild(script);
        });
    }


    // ==========================================
    // FIREBASE INITIALIZATION
    // ==========================================

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


    // Start Firebase
    initFirebase().catch(function (error) {

        console.error(
            "Firebase startup error:",
            error
        );

    });


    // ==========================================
    // LOAD jsPDF
    // ==========================================

    async function initPDF() {

        if (window.jspdf) {
            return window.jspdf;
        }

        await loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        );

        return window.jspdf;
    }


    // ==========================================
    // CALCULATE NIGHTS
    // ==========================================

    function calculateNights(checkIn, checkOut) {

        const start = new Date(
            checkIn + "T00:00:00"
        );

        const end = new Date(
            checkOut + "T00:00:00"
        );

        const difference =
            end.getTime() - start.getTime();

        return Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );
    }


    // ==========================================
    // FORMAT CURRENCY
    // ==========================================

    function formatCurrency(amount) {

        return "₹" +
            Number(amount).toLocaleString("en-IN");
    }


    // ==========================================
    // OPEN BOOKING WINDOW
    // ==========================================

    window.bookRoom = function (roomName) {

        if (!modal) {

            console.error(
                "Booking modal #bookingModal not found."
            );

            return;
        }

        const roomInput =
            document.getElementById("bookingRoom");

        if (roomInput) {
            roomInput.value = roomName || "";
        }

        // Set today's date as minimum check-in
        const checkInInput =
            document.getElementById("checkIn");

        if (checkInInput) {

            const today =
                new Date().toISOString().split("T")[0];

            checkInInput.min = today;
        }

        modal.style.display = "flex";

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";
    };


    // ==========================================
    // FIND ROOM NAME
    // ==========================================

    function findRoomName(button) {

        const validRooms = [
            "Standard Room",
            "Deluxe Room",
            "Family Room"
        ];

        // Check parent containers
        let parent = button.parentElement;

        for (let level = 0; level < 6 && parent; level++) {

            const text =
                parent.textContent.trim();

            for (const room of validRooms) {

                if (text.includes(room)) {
                    return room;
                }
            }

            parent = parent.parentElement;
        }

        // Check nearby headings
        const headings =
            document.querySelectorAll(
                "h1, h2, h3, h4, h5, h6"
            );

        for (const heading of headings) {

            const text =
                heading.textContent.trim();

            if (validRooms.includes(text)) {
                return text;
            }
        }

        return "";
    }


    // ==========================================
    // MAKE BOOK NOW BUTTONS WORK
    // ==========================================

    document.querySelectorAll("button, a").forEach(function (button) {

        const buttonText =
            button.textContent.trim().toLowerCase();

        if (
            buttonText !== "book now" &&
            !button.classList.contains("book-now")
        ) {
            return;
        }

        button.addEventListener(
            "click",
            function (event) {

                // Prevent links from navigating
                event.preventDefault();

                const roomName =
                    findRoomName(button);

                console.log(
                    "Book Now clicked:",
                    roomName || "No room detected"
                );

                window.bookRoom(roomName);
            }
        );

    });


    // ==========================================
    // CLOSE BOOKING WINDOW
    // ==========================================

    function closeBooking() {

        if (!modal) {
            return;
        }

        modal.style.display = "none";

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";
    }


    // ==========================================
    // CLOSE BUTTON
    // ==========================================

    document
        .querySelectorAll(".modal-close")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                closeBooking
            );

        });


    // ==========================================
    // CLICK OUTSIDE MODAL
    // ==========================================

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {
                    closeBooking();
                }

            }
        );

    }


    // ==========================================
    // ESCAPE KEY
    // ==========================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeBooking();
            }

        }
    );


    // ==========================================
    // CREATE PDF RECEIPT
    // ==========================================

    async function createBookingReceipt(
        bookingId,
        booking
    ) {

        const pdfLibrary =
            await initPDF();

        const jsPDF =
            pdfLibrary.jsPDF;

        const doc =
            new jsPDF();

        const pageWidth =
            doc.internal.pageSize.getWidth();


        // ------------------------------------------
        // HEADER
        // ------------------------------------------

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(24);

        doc.text(
            "BABUS PALACE",
            pageWidth / 2,
            25,
            {
                align: "center"
            }
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
            {
                align: "center"
            }
        );

        doc.text(
            "Phone: +91 75103 92411",
            pageWidth / 2,
            41,
            {
                align: "center"
            }
        );


        // ------------------------------------------
        // TITLE
        // ------------------------------------------

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(18);

        doc.text(
            "BOOKING RECEIPT",
            pageWidth / 2,
            58,
            {
                align: "center"
            }
        );


        // ------------------------------------------
        // BOOKING ID
        // ------------------------------------------

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
            String(bookingId),
            65,
            75
        );


        // ------------------------------------------
        // STATUS
        // ------------------------------------------

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


        // ------------------------------------------
        // GUEST DETAILS
        // ------------------------------------------

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
            String(booking.name || ""),
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
            String(booking.phone || ""),
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
            String(booking.email || ""),
            70,
            y
        );


        // ------------------------------------------
        // ROOM DETAILS
        // ------------------------------------------

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

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(11);

        doc.text(
            "Room:",
            20,
            y
        );

        doc.text(
            String(booking.room || ""),
            70,
            y
        );

        y += 9;

        doc.text(
            "Check-in:",
            20,
            y
        );

        doc.text(
            String(booking.checkIn || ""),
            70,
            y
        );

        y += 9;

        doc.text(
            "Check-out:",
            20,
            y
        );

        doc.text(
            String(booking.checkOut || ""),
            70,
            y
        );

        y += 9;

        doc.text(
            "Guests:",
            20,
            y
        );

        doc.text(
            String(booking.guests || ""),
            70,
            y
        );


        // ------------------------------------------
        // PRICE DETAILS
        // ------------------------------------------

        y += 18;

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(13);

        doc.text(
            "Price Details",
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
            "Room Price:",
            20,
            y
        );

        doc.text(
            formatCurrency(
                booking.price || 0
            ),
            70,
            y
        );

        y += 9;

        doc.text(
            "Nights:",
            20,
            y
        );

        doc.text(
            String(booking.nights || 0),
            70,
            y
        );

        y += 9;

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.text(
            "Total:",
            20,
            y
        );

        doc.text(
            formatCurrency(
                booking.total || 0
            ),
            70,
            y
        );


        // ------------------------------------------
        // FOOTER
        // ------------------------------------------

        y += 25;

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(10);

        doc.text(
            "Thank you for choosing Babus Palace.",
            pageWidth / 2,
            y,
            {
                align: "center"
            }
        );

        doc.text(
            "This is a booking request and requires confirmation.",
            pageWidth / 2,
            y + 7,
            {
                align: "center"
            }
        );


        // ------------------------------------------
        // DOWNLOAD PDF
        // ------------------------------------------

        doc.save(
            "Babus-Palace-Booking-" +
            bookingId +
            ".pdf"
        );
    }


    // ==========================================
    // BOOKING FORM
    // ==========================================

    if (form) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                // --------------------------------------
                // PREVENT DOUBLE SUBMISSION
                // --------------------------------------

                const submitButton =
                    form.querySelector(
                        'button[type="submit"], input[type="submit"]'
                    );

                if (submitButton) {
                    submitButton.disabled = true;
                }


                try {

                    // ----------------------------------
                    // GET FORM VALUES
                    // ----------------------------------

                    const name =
                        document
                            .getElementById("bookingName")
                            ?.value
                            .trim() || "";

                    const phone =
                        document
                            .getElementById("bookingPhone")
                            ?.value
                            .trim() || "";

                    const email =
                        document
                            .getElementById("bookingEmail")
                            ?.value
                            .trim() || "";

                    const room =
                        document
                            .getElementById("bookingRoom")
                            ?.value
                            .trim() || "";

                    const checkIn =
                        document
                            .getElementById("checkIn")
                            ?.value || "";

                    const checkOut =
                        document
                            .getElementById("checkOut")
                            ?.value || "";

                    const guests =
                        document
                            .getElementById("bookingGuests")
                            ?.value || "1";


                    // ----------------------------------
                    // VALIDATION
                    // ----------------------------------

                    if (!name) {

                        alert(
                            "Please enter your name."
                        );

                        return;
                    }


                    if (!phone) {

                        alert(
                            "Please enter your phone number."
                        );

                        return;
                    }


                    if (!email) {

                        alert(
                            "Please enter your email."
                        );

                        return;
                    }


                    if (!room) {

                        alert(
                            "Please select a room."
                        );

                        return;
                    }


                    if (!roomPrices[room]) {

                        alert(
                            "Invalid room selected."
                        );

                        return;
                    }


                    if (!checkIn) {

                        alert(
                            "Please select your check-in date."
                        );

                        return;
                    }


                    if (!checkOut) {

                        alert(
                            "Please select your check-out date."
                        );

                        return;
                    }


                    // ----------------------------------
                    // CALCULATE NIGHTS
                    // ----------------------------------

                    const nights =
                        calculateNights(
                            checkIn,
                            checkOut
                        );


                    if (nights <= 0) {

                        alert(
                            "Check-out date must be after check-in date."
                        );

                        return;
                    }


                    // ----------------------------------
                    // ROOM PRICE
                    // ----------------------------------

                    const price =
                        roomPrices[room];

                    const total =
                        price * nights;


                    // ----------------------------------
                    // FIREBASE
                    // ----------------------------------

                    const firebase =
                        await initFirebase();

                    const db =
                        firebase.firestore();


                    // ----------------------------------
                    // BOOKING ID
                    // ----------------------------------

                    const bookingId =
                        "BP-" +
                        Date.now();


                    // ----------------------------------
                    // BOOKING DATA
                    // ----------------------------------

                    const booking = {

                        bookingId: bookingId,

                        name: name,

                        phone: phone,

                        email: email,

                        room: room,

                        checkIn: checkIn,

                        checkOut: checkOut,

                        guests: Number(guests),

                        price: price,

                        nights: nights,

                        total: total,

                        status:
                            "Pending Confirmation",

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    };


                    // ----------------------------------
                    // SAVE TO FIRESTORE
                    // ----------------------------------

                    await db
                        .collection("bookings")
                        .doc(bookingId)
                        .set(booking);


                    // ----------------------------------
                    // SUCCESS
                    // ----------------------------------

                    alert(
                        "Booking request submitted successfully!\n\n" +
                        "Booking ID: " +
                        bookingId +
                        "\n" +
                        "Room: " +
                        room +
                        "\n" +
                        "Nights: " +
                        nights +
                        "\n" +
                        "Total: " +
                        formatCurrency(total)
                    );


                    // ----------------------------------
                    // CREATE PDF
                    // ----------------------------------

                    try {

                        await createBookingReceipt(
                            bookingId,
                            booking
                        );

                    } catch (pdfError) {

                        console.error(
                            "PDF creation error:",
                            pdfError
                        );

                    }


                    // ----------------------------------
                    // RESET
                    // ----------------------------------

                    form.reset();


                    // ----------------------------------
                    // CLOSE MODAL
                    // ----------------------------------

                    closeBooking();

                } catch (error) {

                    console.error(
                        "Booking error:",
                        error
                    );

                    alert(
                        "Booking failed.\n\n" +
                        "Please check your internet connection " +
                        "and try again."
                    );

                } finally {

                    // Enable button again
                    if (submitButton) {
                        submitButton.disabled = false;
                    }

                }

            }
        );

    } else {

        console.warn(
            "Booking form #bookingForm was not found."
        );

    }

});
