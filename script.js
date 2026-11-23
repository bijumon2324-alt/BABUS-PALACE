// ======================================================
// BABUS PALACE - COMPLETE WEBSITE + BOOKING SYSTEM
// FIREBASE + WHATSAPP + PREMIUM PDF RECEIPT + QR CODE
// ======================================================


// ======================================================
// CONFIGURATION
// ======================================================

const ROOM_PRICES = {
    "Standard Room": 2600,
    "Deluxe Room": 3800,
    "Family Room": 4700
};

const WHATSAPP_NUMBER = "917510392411";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC1IpCqOqA7zVNhsKBuJdNv9oYk4wEQtAtg",
    authDomain: "babus-palace.firebaseapp.com",
    projectId: "babus-palace",
    storageBucket: "babus-palace.firebasestorage.app",
    messagingSenderId: "432285024629",
    appId: "1:432285024629:web:f0ae81a3a2e99479e8d33c",
    measurementId: "G-P8TE61PCDE"
};

let firebaseReady = false;


// ======================================================
// LOAD EXTERNAL JAVASCRIPT
// ======================================================

function loadScript(src) {

    return new Promise(function (resolve, reject) {

        const existing = document.querySelector(
            `script[src="${src}"]`
        );

        if (existing) {

            if (
                existing.dataset.loaded === "true" ||
                (src.includes("firebase") && window.firebase) ||
                (src.includes("jspdf") && window.jspdf) ||
                (src.includes("qrcode") && window.QRCode)
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


// ======================================================
// FIREBASE INITIALIZATION
// ======================================================

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

        window.firebase.initializeApp(
            FIREBASE_CONFIG
        );
    }

    firebaseReady = true;

    return window.firebase;
}


// Start Firebase in background

initFirebase().catch(function (error) {

    console.error(
        "Firebase startup error:",
        error
    );

});


// ======================================================
// PDF LIBRARY
// ======================================================

async function initPDF() {

    if (window.jspdf) {
        return window.jspdf;
    }

    await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    );

    return window.jspdf;
}


// ======================================================
// QR CODE LIBRARY
// ======================================================

async function initQRCode() {

    if (window.QRCode) {
        return window.QRCode;
    }

    await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"
    );

    return window.QRCode;
}


// ======================================================
// FORMAT CURRENCY
// ======================================================

function formatCurrency(amount) {

    return "₹" +
        Number(amount).toLocaleString("en-IN");
}


// ======================================================
// CALCULATE NIGHTS
// ======================================================

function calculateNights(checkIn, checkOut) {

    const start =
        new Date(checkIn + "T00:00:00");

    const end =
        new Date(checkOut + "T00:00:00");

    const difference =
        end.getTime() - start.getTime();

    return Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
    );
}


// ======================================================
// BOOK ROOM
// ======================================================

window.bookRoom = function (roomName) {

    const modal =
        document.getElementById("bookingModal");

    if (!modal) {

        alert(
            "Booking system is loading. Please try again."
        );

        return;
    }

    const roomInput =
        document.getElementById("bookingRoom");

    if (roomInput) {
        roomInput.value = roomName || "";
    }

    const form =
        document.getElementById("bookingForm");

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const checkIn =
        form?.querySelector(
            'input[name="checkin"]'
        );

    const checkOut =
        form?.querySelector(
            'input[name="checkout"]'
        );

    if (checkIn) {
        checkIn.min = today;
    }

    if (checkOut) {
        checkOut.min = today;
    }

    modal.classList.add("show");

    modal.style.display = "flex";

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";
};


// ======================================================
// CLOSE BOOKING
// ======================================================

window.closeBooking = function () {

    const modal =
        document.getElementById("bookingModal");

    if (modal) {

        modal.classList.remove("show");

        modal.style.display = "none";

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";
    }
};


// ======================================================
// CREATE PREMIUM HOTEL PDF RECEIPT
// ======================================================

async function createBookingReceipt(
    bookingId,
    booking
) {

    // --------------------------------------------------
    // LOAD PDF
    // --------------------------------------------------

    const pdfLibrary =
        await initPDF();

    const jsPDF =
        pdfLibrary.jsPDF;

    const doc =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();


    // --------------------------------------------------
    // LOAD QR CODE
    // --------------------------------------------------

    await initQRCode();


    // --------------------------------------------------
    // WEBSITE URL
    // --------------------------------------------------

    const websiteURL =
        window.location.origin +
        window.location.pathname;


    // --------------------------------------------------
    // CREATE QR CODE
    // --------------------------------------------------

    const qrContainer =
        document.createElement("div");

    qrContainer.style.position = "fixed";
    qrContainer.style.left = "-9999px";
    qrContainer.style.top = "-9999px";

    document.body.appendChild(
        qrContainer
    );

    new QRCode(
        qrContainer,
        {
            text: websiteURL,
            width: 300,
            height: 300,
            correctLevel:
                QRCode.CorrectLevel.H
        }
    );


    // Wait for QR generation

    await new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                500
            );

        }
    );


    const qrCanvas =
        qrContainer.querySelector(
            "canvas"
        );

    let qrImage = null;

    if (qrCanvas) {

        qrImage =
            qrCanvas.toDataURL(
                "image/png"
            );
    }


    document.body.removeChild(
        qrContainer
    );


    // --------------------------------------------------
    // LUXURY COLORS
    // --------------------------------------------------

    const background =
        [18, 22, 32];

    const panel =
        [27, 32, 45];

    const gold =
        [212, 170, 74];

    const lightGold =
        [238, 208, 130];

    const white =
        [245, 245, 245];

    const grey =
        [170, 175, 185];


    // --------------------------------------------------
    // FULL DARK BACKGROUND
    // --------------------------------------------------

    doc.setFillColor(
        background[0],
        background[1],
        background[2]
    );

    doc.rect(
        0,
        0,
        pageWidth,
        pageHeight,
        "F"
    );


    // --------------------------------------------------
    // GOLD OUTER BORDER
    // --------------------------------------------------

    doc.setDrawColor(
        gold[0],
        gold[1],
        gold[2]
    );

    doc.setLineWidth(1.2);

    doc.rect(
        7,
        7,
        pageWidth - 14,
        pageHeight - 14
    );


    // Inner border

    doc.setLineWidth(0.3);

    doc.rect(
        10,
        10,
        pageWidth - 20,
        pageHeight - 20
    );


    // --------------------------------------------------
    // HOTEL BRAND
    // --------------------------------------------------

    doc.setFont(
        "times",
        "bold"
    );

    doc.setFontSize(27);

    doc.setTextColor(
        gold[0],
        gold[1],
        gold[2]
    );

    doc.text(
        "BABUS PALACE",
        pageWidth / 2,
        28,
        {
            align: "center"
        }
    );


    // Subtitle

    doc.setFont(
        "times",
        "italic"
    );

    doc.setFontSize(10);

    doc.setTextColor(
        lightGold[0],
        lightGold[1],
        lightGold[2]
    );

    doc.text(
        "A PREMIUM STAY IN KALADY",
        pageWidth / 2,
        36,
        {
            align: "center"
        }
    );


    // --------------------------------------------------
    // HOTEL ADDRESS
    // --------------------------------------------------

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        grey[0],
        grey[1],
        grey[2]
    );

    doc.text(
        "Antopuram, Kalady, Ernakulam, Kerala",
        pageWidth / 2,
        43,
        {
            align: "center"
        }
    );


    // Phone ONLY
    // No website owner email

    doc.text(
        "Phone: +91 75103 92411",
        pageWidth / 2,
        49,
        {
            align: "center"
        }
    );


    // --------------------------------------------------
    // GOLD DIVIDER
    // --------------------------------------------------

    doc.setDrawColor(
        gold[0],
        gold[1],
        gold[2]
    );

    doc.setLineWidth(0.6);

    doc.line(
        25,
        57,
        pageWidth - 25,
        57
    );


    // --------------------------------------------------
    // BOOKING RECEIPT TITLE
    // --------------------------------------------------

    doc.setFont(
        "times",
        "bold"
    );

    doc.setFontSize(21);

    doc.setTextColor(
        white[0],
        white[1],
        white[2]
    );

    doc.text(
        "BOOKING RECEIPT",
        pageWidth / 2,
        70,
        {
            align: "center"
        }
    );


    // --------------------------------------------------
    // BOOKING ID
    // --------------------------------------------------

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        grey[0],
        grey[1],
        grey[2]
    );

    doc.text(
        "BOOKING ID",
        22,
        82
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

    doc.setTextColor(
        lightGold[0],
        lightGold[1],
        lightGold[2]
    );

    doc.text(
        String(bookingId),
        22,
        89
    );


    // --------------------------------------------------
    // STATUS BADGE
    // --------------------------------------------------

    doc.setFillColor(
        45,
        39,
        25
    );

    doc.roundedRect(
        pageWidth - 70,
        78,
        45,
        14,
        3,
        3,
        "F"
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(8);

    doc.setTextColor(
        lightGold[0],
        lightGold[1],
        lightGold[2]
    );

    doc.text(
        "PENDING",
        pageWidth - 47.5,
        84,
        {
            align: "center"
        }
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7);

    doc.text(
        "CONFIRMATION",
        pageWidth - 47.5,
        89,
        {
            align: "center"
        }
    );


    // ==================================================
    // GUEST DETAILS
    // ==================================================

    doc.setFillColor(
        panel[0],
        panel[1],
        panel[2]
    );

    doc.roundedRect(
        18,
        101,
        pageWidth - 36,
        48,
        4,
        4,
        "F"
    );


    doc.setFont(
        "times",
        "bold"
    );

    doc.setFontSize(14);

    doc.setTextColor(
        gold[0],
        gold[1],
        gold[2]
    );

    doc.text(
        "GUEST DETAILS",
        25,
        112
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        grey[0],
        grey[1],
        grey[2]
    );

    doc.text(
        "Guest Name",
        25,
        122
    );

    doc.text(
        "Phone",
        25,
        132
    );

    doc.text(
        "Email",
        25,
        142
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setTextColor(
        white[0],
        white[1],
        white[2]
    );

    doc.text(
        String(
            booking.name || ""
        ),
        62,
        122
    );

    doc.text(
        String(
            booking.phone || ""
        ),
        62,
        132
    );

    doc.text(
        String(
            booking.email || ""
        ),
        62,
        142
    );


    // ==================================================
    // STAY DETAILS
    // ==================================================

    doc.setFillColor(
        panel[0],
        panel[1],
        panel[2]
    );

    doc.roundedRect(
        18,
        157,
        pageWidth - 36,
        56,
        4,
        4,
        "F"
    );


    doc.setFont(
        "times",
        "bold"
    );

    doc.setFontSize(14);

    doc.setTextColor(
        gold[0],
        gold[1],
        gold[2]
    );

    doc.text(
        "STAY DETAILS",
        25,
        168
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        grey[0],
        grey[1],
        grey[2]
    );

    doc.text(
        "Room",
        25,
        179
    );

    doc.text(
        "Check-in",
        25,
        189
    );

    doc.text(
        "Check-out",
        25,
        199
    );

    doc.text(
        "Guests",
        25,
        209
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setTextColor(
        white[0],
        white[1],
        white[2]
    );

    doc.text(
        String(
            booking.room || ""
        ),
        62,
        179
    );

    doc.text(
        String(
            booking.checkIn || ""
        ),
        62,
        189
    );

    doc.text(
        String(
            booking.checkOut || ""
        ),
        62,
        199
    );

    doc.text(
        String(
            booking.guests || ""
        ),
        62,
        209
    );


    // ==================================================
    // PRICE SUMMARY
    // ==================================================

    doc.setFillColor(
        35,
        37,
        40
    );

    doc.roundedRect(
        18,
        221,
        pageWidth - 36,
        43,
        4,
        4,
        "F"
    );


    doc.setFont(
        "times",
        "bold"
    );

    doc.setFontSize(14);

    doc.setTextColor(
        gold[0],
        gold[1],
        gold[2]
    );

    doc.text(
        "PRICE SUMMARY",
        25,
        232
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        grey[0],
        grey[1],
        grey[2]
    );

    doc.text(
        "Room rate",
        25,
        242
    );

    doc.text(
        "Number of nights",
        25,
        251
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setTextColor(
        white[0],
        white[1],
        white[2]
    );

    doc.text(
        formatCurrency(
            booking.price
        ),
        pageWidth - 25,
        242,
        {
            align: "right"
        }
    );

    doc.text(
        String(
            booking.nights
        ),
        pageWidth - 25,
        251,
        {
            align: "right"
        }
    );


    // --------------------------------------------------
    // TOTAL LINE
    // --------------------------------------------------

    doc.setDrawColor(
        gold[0],
        gold[1],
        gold[2]
    );

    doc.line(
        25,
        256,
        pageWidth - 25,
        256
    );


    doc.setFont(
        "times",
        "bold"
    );

    doc.setFontSize(15);

    doc.setTextColor(
        lightGold[0],
        lightGold[1],
        lightGold[2]
    );

    doc.text(
        "TOTAL",
        25,
        261
    );

    doc.text(
        formatCurrency(
            booking.total
        ),
        pageWidth - 25,
        261,
        {
            align: "right"
        }
    );


    // ==================================================
    // QR CODE
    // ==================================================

    if (qrImage) {

        // White QR background

        doc.setFillColor(
            245,
            245,
            245
        );

        doc.roundedRect(
            18,
            274,
            42,
            42,
            3,
            3,
            "F"
        );


        // QR

        doc.addImage(
            qrImage,
            "PNG",
            21,
            277,
            36,
            36
        );


        // QR title

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(8);

        doc.setTextColor(
            white[0],
            white[1],
            white[2]
        );

        doc.text(
            "SCAN TO VISIT",
            67,
            285
        );


        doc.setFont(
            "times",
            "bold"
        );

        doc.setFontSize(13);

        doc.setTextColor(
            gold[0],
            gold[1],
            gold[2]
        );

        doc.text(
            "BABUS PALACE",
            67,
            294
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);

        doc.setTextColor(
            grey[0],
            grey[1],
            grey[2]
        );

        doc.text(
            "Scan this QR code to visit",
            67,
            302
        );

        doc.text(
            "our official website.",
            67,
            308
        );
    }


    // ==================================================
    // FOOTER
    // ==================================================

    doc.setDrawColor(
        gold[0],
        gold[1],
        gold[2]
    );

    doc.line(
        25,
        324,
        pageWidth - 25,
        324
    );


    doc.setFont(
        "times",
        "italic"
    );

    doc.setFontSize(10);

    doc.setTextColor(
        lightGold[0],
        lightGold[1],
        lightGold[2]
    );

    doc.text(
        "Thank you for choosing BABUS PALACE",
        pageWidth / 2,
        333,
        {
            align: "center"
        }
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7.5);

    doc.setTextColor(
        grey[0],
        grey[1],
        grey[2]
    );

    doc.text(
        "This booking request is subject to confirmation by BABUS PALACE.",
        pageWidth / 2,
        340,
        {
            align: "center"
        }
    );

    doc.text(
        "Antopuram • Kalady • Ernakulam • Kerala",
        pageWidth / 2,
        346,
        {
            align: "center"
        }
    );


    // ==================================================
    // SAVE PDF
    // ==================================================

    doc.save(
        "Babus-Palace-Booking-" +
        bookingId +
        ".pdf"
    );
}


// ======================================================
// OPEN WHATSAPP
// ======================================================

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
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    window.open(
        whatsappURL,
        "_blank"
    );
}


// ======================================================
// DOM CONTENT LOADED
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // ==================================================
        // BOOKING FORM
        // ==================================================

        const bookingForm =
            document.getElementById(
                "bookingForm"
            );


        if (bookingForm) {

            bookingForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    // ------------------------------------------
                    // GET FORM VALUES
                    // ------------------------------------------

                    const room =
                        document
                            .getElementById(
                                "bookingRoom"
                            )
                            ?.value
                            .trim() || "";


                    const name =
                        bookingForm
                            .querySelector(
                                'input[name="name"]'
                            )
                            ?.value
                            .trim() || "";


                    const phone =
                        bookingForm
                            .querySelector(
                                'input[name="phone"]'
                            )
                            ?.value
                            .trim() || "";


                    const email =
                        bookingForm
                            .querySelector(
                                'input[name="email"]'
                            )
                            ?.value
                            .trim() || "";


                    const checkIn =
                        bookingForm
                            .querySelector(
                                'input[name="checkin"]'
                            )
                            ?.value || "";


                    const checkOut =
                        bookingForm
                            .querySelector(
                                'input[name="checkout"]'
                            )
                            ?.value || "";


                    const guests =
                        bookingForm
                            .querySelector(
                                'input[name="guests"]'
                            )
                            ?.value || "1";


                    // ------------------------------------------
                    // VALIDATION
                    // ------------------------------------------

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


                    // ------------------------------------------
                    // CALCULATE NIGHTS
                    // ------------------------------------------

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


                    // ------------------------------------------
                    // ROOM PRICE
                    // ------------------------------------------

                    const price =
                        ROOM_PRICES[room] || 0;


                    if (!price) {

                        alert(
                            "Invalid room selected."
                        );

                        return;
                    }


                    // ------------------------------------------
                    // TOTAL
                    // ------------------------------------------

                    const total =
                        price * nights;


                    // ------------------------------------------
                    // BOOKING ID
                    // ------------------------------------------

                    const bookingId =
                        "BP-" +
                        Date.now();


                    // ------------------------------------------
                    // BOOKING OBJECT
                    // ------------------------------------------

                    const booking = {

                        bookingId:
                            bookingId,

                        name:
                            name,

                        phone:
                            phone,

                        email:
                            email,

                        room:
                            room,

                        checkIn:
                            checkIn,

                        checkOut:
                            checkOut,

                        guests:
                            Number(guests),

                        price:
                            price,

                        nights:
                            nights,

                        total:
                            total,

                        status:
                            "Pending Confirmation",

                        createdAt:
                            null
                    };


                    // ------------------------------------------
                    // BUTTON
                    // ------------------------------------------

                    const submitButton =
                        bookingForm.querySelector(
                            ".booking-submit"
                        );


                    if (submitButton) {

                        submitButton.disabled =
                            true;

                        submitButton.textContent =
                            "Processing...";
                    }


                    // ==================================================
                    // SAVE TO FIREBASE
                    // ==================================================

                    try {

                        const firebase =
                            await initFirebase();


                        const db =
                            firebase.firestore();


                        booking.createdAt =
                            firebase
                                .firestore
                                .FieldValue
                                .serverTimestamp();


                        await db
                            .collection(
                                "bookings"
                            )
                            .doc(
                                bookingId
                            )
                            .set(
                                booking
                            );


                        console.log(
                            "Booking saved to Firebase:",
                            bookingId
                        );


                    } catch (firebaseError) {

                        console.error(
                            "Firebase error:",
                            firebaseError
                        );


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


                    // ==================================================
                    // SUCCESS
                    // ==================================================

                    alert(
                        "Booking request created successfully!\n\n" +
                        "Booking ID: " +
                        bookingId +
                        "\n" +
                        "Total: " +
                        formatCurrency(
                            total
                        ) +
                        "\n\n" +
                        "Your premium PDF receipt will now be generated."
                    );


                    // ==================================================
                    // GENERATE PDF
                    // ==================================================

                    try {

                        await createBookingReceipt(
                            bookingId,
                            booking
                        );


                    } catch (pdfError) {

                        console.error(
                            "PDF generation error:",
                            pdfError
                        );

                        alert(
                            "Booking was saved successfully, but the PDF receipt could not be generated."
                        );
                    }


                    // ==================================================
                    // OPEN WHATSAPP
                    // ==================================================

                    openWhatsApp(
                        booking
                    );


                    // ==================================================
                    // RESET FORM
                    // ==================================================

                    bookingForm.reset();


                    const roomInput =
                        document.getElementById(
                            "bookingRoom"
                        );


                    if (roomInput) {

                        roomInput.value =
                            "";
                    }


                    // ==================================================
                    // CLOSE MODAL
                    // ==================================================

                    closeBooking();


                    // ==================================================
                    // RESTORE BUTTON
                    // ==================================================

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Confirm Booking";
                    }

                }
            );
        }


        // ==================================================
        // CLOSE MODAL BUTTONS
        // ==================================================

        document
            .querySelectorAll(
                ".modal-close"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            closeBooking();

                            closeLightbox();
                        }
                    );

                }
            );


        // ==================================================
        // CLICK OUTSIDE BOOKING MODAL
        // ==================================================

        const bookingModal =
            document.getElementById(
                "bookingModal"
            );


        if (bookingModal) {

            bookingModal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        bookingModal
                    ) {

                        closeBooking();
                    }

                }
            );
        }


        // ==================================================
        // ESCAPE KEY
        // ==================================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeBooking();

                    closeLightbox();
                }

            }
        );


        // ==================================================
        // GALLERY LIGHTBOX
        // ==================================================

        const galleryImages =
            document.querySelectorAll(
                ".gallery-card img, .gallery img"
            );


        galleryImages.forEach(
            function (image) {

                image.style.cursor =
                    "pointer";


                image.addEventListener(
                    "click",
                    function () {

                        openLightbox(
                            this.src,
                            this.alt
                        );

                    }
                );

            }
        );


        // ==================================================
        // LOGO → HOME
        // ==================================================

        const logo =
            document.querySelector(
                ".logo"
            );


        if (logo) {

            logo.style.cursor =
                "pointer";


            logo.addEventListener(
                "click",
                function (event) {

                    const home =
                        document.getElementById(
                            "home"
                        );


                    if (home) {

                        event.preventDefault();


                        home.scrollIntoView(
                            {
                                behavior:
                                    "smooth"
                            }
                        );
                    }

                }
            );
        }


        // ==================================================
        // MOBILE MENU
        // ==================================================

        const menuButton =
            document.querySelector(
                ".menu-toggle, .menu-btn, .hamburger"
            );


        const nav =
            document.querySelector(
                "nav"
            );


        if (
            menuButton &&
            nav
        ) {

            menuButton.addEventListener(
                "click",
                function () {

                    nav.classList.toggle(
                        "active"
                    );

                }
            );


            nav.querySelectorAll(
                "a"
            ).forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        function () {

                            nav.classList.remove(
                                "active"
                            );

                        }
                    );

                }
            );
        }


        // ==================================================
        // BACK TO TOP
        // ==================================================

        const topButton =
            document.getElementById(
                "backToTop"
            );


        if (topButton) {

            window.addEventListener(
                "scroll",
                function () {

                    if (
                        window.scrollY >
                        400
                    ) {

                        topButton.classList.add(
                            "show"
                        );

                    } else {

                        topButton.classList.remove(
                            "show"
                        );
                    }

                }
            );


            topButton.addEventListener(
                "click",
                function () {

                    window.scrollTo(
                        {
                            top: 0,
                            behavior:
                                "smooth"
                        }
                    );

                }
            );
        }


        // ==================================================
        // DATE VALIDATION
        // ==================================================

        const checkInInput =
            bookingForm?.querySelector(
                'input[name="checkin"]'
            );


        const checkOutInput =
            bookingForm?.querySelector(
                'input[name="checkout"]'
            );


        if (checkInInput) {

            checkInInput.addEventListener(
                "change",
                function () {

                    if (
                        checkOutInput &&
                        this.value
                    ) {

                        checkOutInput.min =
                            this.value;
                    }

                }
            );
        }


        // ==================================================
        // PHONE / EMAIL / MAP / WHATSAPP
        // ==================================================

        document
            .querySelectorAll(
                'a[href^="tel:"], a[href^="mailto:"], a[href*="google.com/maps"], a[href*="wa.me"]'
            )
            .forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        function () {
                            // Browser handles these links.
                        }
                    );

                }
            );

    }
);


// ======================================================
// LIGHTBOX
// ======================================================

function openLightbox(
    imageSrc,
    imageAlt
) {

    let lightbox =
        document.getElementById(
            "imageLightbox"
        );


    if (!lightbox) {

        lightbox =
            document.createElement(
                "div"
            );


        lightbox.id =
            "imageLightbox";


        lightbox.innerHTML = `
            <div class="lightbox-overlay">

                <button
                    class="lightbox-close"
                    aria-label="Close">
                    &times;
                </button>

                <img
                    class="lightbox-image"
                    alt="">
            </div>
        `;


        document.body.appendChild(
            lightbox
        );


        const overlay =
            lightbox.querySelector(
                ".lightbox-overlay"
            );


        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    this
                ) {

                    closeLightbox();
                }

            }
        );


        lightbox
            .querySelector(
                ".lightbox-close"
            )
            .addEventListener(
                "click",
                closeLightbox
            );
    }


    const image =
        lightbox.querySelector(
            ".lightbox-image"
        );


    image.src =
        imageSrc;


    image.alt =
        imageAlt ||
        "BABUS PALACE";


    lightbox.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";
}


// ======================================================
// CLOSE LIGHTBOX
// ======================================================

function closeLightbox() {

    const lightbox =
        document.getElementById(
            "imageLightbox"
        );


    if (lightbox) {

        lightbox.classList.remove(
            "show"
        );

        document.body.style.overflow =
            "";
    }
}
