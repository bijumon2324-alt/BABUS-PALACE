// ==========================================
// BABUS PALACE - COMPLETE BOOKING SYSTEM
// FIREBASE + WHATSAPP + PDF RECEIPT
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
    // HOTEL WHATSAPP NUMBER
    // ==========================================

    const whatsappNumber = "917510392411";

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
                        "Could not load script: " + src
                    )
                );
            };

            document.head.appendChild(script);
        });
    }


    // ==========================================
    // FIREBASE
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
    // PDF LIBRARY
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
    // FORMAT MONEY
    // ==========================================

    function formatCurrency(amount) {

        return "₹" +
            Number(amount).toLocaleString("en-IN");
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
    // OPEN BOOKING MODAL
    // ==========================================

    window.bookRoom = function (roomName) {

        if (!modal) {

            console.error(
                "bookingModal not found."
            );

            return;
        }

        const roomInput =
            document.getElementById("bookingRoom");

        if (roomInput) {
            roomInput.value = roomName || "";
        }

        // Today's date
        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        const checkInInput =
            form?.querySelector(
                'input[name="checkin"]'
            );

        const checkOutInput =
            form?.querySelector(
                'input[name="checkout"]'
            );

        if (checkInInput) {
            checkInInput.min = today;
        }

        if (checkOutInput) {
            checkOutInput.min = today;
        }

        modal.style.display = "flex";

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";
    };


    // ==========================================
    // CLOSE MODAL
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
            {
                align: "center"
            }
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
            String(bookingId),
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


        // PRICE DETAILS

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
            formatCurrency(booking.price),
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
            String(booking.nights),
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
            formatCurrency(booking.total),
            70,
            y
        );


        // FOOTER

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


        // SAVE PDF

        doc.save(
            "Babus-Palace-Booking-" +
            bookingId +
            ".pdf"
        );
    }


    // ==========================================
    // OPEN WHATSAPP
    // ==========================================

    function openWhatsApp(booking) {

        const message =
`🏨 *BABUS PALACE - BOOKING REQUEST*

🆔 *Booking ID:* ${booking.bookingId}

👤 *Guest Details*
Name: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email}

🛏️ *Room Details*
Room: ${booking.room}
Check-in: ${booking.checkIn}
Check-out: ${booking.checkOut}
Guests: ${booking.guests}

💰 *Price Details*
Room Price: ${formatCurrency(booking.price)}
Nights: ${booking.nights}
Total: *${formatCurrency(booking.total)}*

📌 Status: Pending Confirmation

Please confirm my booking.`;

        const whatsappURL =
            "https://wa.me/" +
            whatsappNumber +
            "?text=" +
            encodeURIComponent(message);

        window.open(
            whatsappURL,
            "_blank"
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
                // GET FORM VALUES
                // --------------------------------------

                const room =
                    document
                        .getElementById("bookingRoom")
                        ?.value
                        .trim() || "";

                const name =
                    form
                        .querySelector(
                            'input[name="name"]'
                        )
                        ?.value
                        .trim() || "";

                const phone =
                    form
                        .querySelector(
                            'input[name="phone"]'
                        )
                        ?.value
                        .trim() || "";

                const email =
                    form
                        .querySelector(
                            'input[name="email"]'
                        )
                        ?.value
                        .trim() || "";

                const checkIn =
                    form
                        .querySelector(
                            'input[name="checkin"]'
                        )
                        ?.value || "";

                const checkOut =
                    form
                        .querySelector(
                            'input[name="checkout"]'
                        )
                        ?.value || "";

                const guests =
                    form
                        .querySelector(
                            'input[name="guests"]'
                        )
                        ?.value || "1";


                // --------------------------------------
                // VALIDATION
                // --------------------------------------

                if (!room) {

                    alert(
                        "Please select a room."
                    );

                    return;
                }

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

                if (!checkIn) {

                    alert(
                        "Please select check-in date."
                    );

                    return;
                }

                if (!checkOut) {

                    alert(
                        "Please select check-out date."
                    );

                    return;
                }


                // --------------------------------------
                // CALCULATE NIGHTS
                // --------------------------------------

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


                // --------------------------------------
                // PRICE
                // --------------------------------------

                const price =
                    roomPrices[room] || 0;

                if (!price) {

                    alert(
                        "Invalid room selected."
                    );

                    return;
                }

                const total =
                    price * nights;


                // --------------------------------------
                // BOOKING ID
                // --------------------------------------

                const bookingId =
                    "BP-" +
                    Date.now();


                // --------------------------------------
                // BOOKING OBJECT
                // --------------------------------------

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
                        null

                };


                // --------------------------------------
                // DISABLE BUTTON
                // --------------------------------------

                const submitButton =
                    form.querySelector(
                        ".booking-submit"
                    );

                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.textContent =
                        "Processing...";
                }


                // ======================================
                // SAVE TO FIREBASE
                // ======================================

                try {

                    const firebase =
                        await initFirebase();

                    const db =
                        firebase.firestore();

                    booking.createdAt =
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp();

                    await db
                        .collection("bookings")
                        .doc(bookingId)
                        .set(booking);

                    console.log(
                        "Booking saved to Firebase:",
                        bookingId
                    );

                } catch (firebaseError) {

                    console.error(
                        "Firebase error:",
                        firebaseError
                    );

                    // Restore button
                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Confirm Booking";
                    }

                    alert(
                        "Could not save the booking to Firebase.\n\n" +
                        "Please check your internet connection and try again."
                    );

                    return;
                }


                // ======================================
                // SUCCESS MESSAGE
                // ======================================

                alert(
                    "Booking request created successfully!\n\n" +
                    "Booking ID: " +
                    bookingId +
                    "\n" +
                    "Total: " +
                    formatCurrency(total) +
                    "\n\n" +
                    "WhatsApp will now open."
                );


                // ======================================
                // PDF RECEIPT
                // ======================================

                try {

                    await createBookingReceipt(
                        bookingId,
                        booking
                    );

                } catch (pdfError) {

                    console.error(
                        "PDF error:",
                        pdfError
                    );

                }


                // ======================================
                // WHATSAPP
                // ======================================

                openWhatsApp(booking);


                // ======================================
                // RESET FORM
                // ======================================

                form.reset();


                // Keep room field blank after reset
                const roomInput =
                    document.getElementById(
                        "bookingRoom"
                    );

                if (roomInput) {
                    roomInput.value = "";
                }


                // ======================================
                // CLOSE MODAL
                // ======================================

                closeBooking();


                // ======================================
                // RESTORE BUTTON
                // ======================================

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Confirm Booking";
                }

            }
        );

    } else {

        console.error(
            "bookingForm not found."
        );

    }

});
