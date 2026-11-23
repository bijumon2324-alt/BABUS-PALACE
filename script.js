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

const HOTEL_ADDRESS =
    "Antopuram, Kalady, Ernakulam, Kerala";

const HOTEL_PHONE =
    "+91 75103 92411";

const HOTEL_WEBSITE =
    window.location.origin +
    window.location.pathname;

const HOTEL_BACKGROUND =
    "hotel.jpg";


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

        const existing =
            document.querySelector(
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


        const script =
            document.createElement("script");

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

    if (
        firebaseReady &&
        window.firebase
    ) {

        return window.firebase;
    }


    await loadScript(
        "https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js"
    );


    await loadScript(
        "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore-compat.js"
    );


    if (
        !window.firebase.apps.length
    ) {

        window.firebase.initializeApp(
            FIREBASE_CONFIG
        );
    }


    firebaseReady = true;

    return window.firebase;
}


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
        Number(amount || 0)
            .toLocaleString("en-IN");
}


// ======================================================
// CALCULATE NIGHTS
// ======================================================

function calculateNights(
    checkIn,
    checkOut
) {

    const start =
        new Date(
            checkIn + "T00:00:00"
        );

    const end =
        new Date(
            checkOut + "T00:00:00"
        );

    const difference =
        end.getTime() -
        start.getTime();

    return Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
    );
}


// ======================================================
// LOAD IMAGE AS DATA URL
// ======================================================

function loadImageAsDataURL(
    imagePath
) {

    return new Promise(
        function (resolve) {

            const image =
                new Image();

            image.crossOrigin =
                "anonymous";


            image.onload =
                function () {

                    try {

                        const canvas =
                            document.createElement(
                                "canvas"
                            );

                        canvas.width =
                            image.naturalWidth;

                        canvas.height =
                            image.naturalHeight;


                        const context =
                            canvas.getContext(
                                "2d"
                            );


                        context.drawImage(
                            image,
                            0,
                            0
                        );


                        resolve(
                            canvas.toDataURL(
                                "image/jpeg",
                                0.90
                            )
                        );

                    } catch (error) {

                        console.error(
                            "Background conversion error:",
                            error
                        );

                        resolve(null);
                    }
                };


            image.onerror =
                function () {

                    console.warn(
                        "Could not load PDF background:",
                        imagePath
                    );

                    resolve(null);
                };


            image.src =
                imagePath +
                "?pdf=" +
                Date.now();
        }
    );
}


// ======================================================
// CREATE PREMIUM QR CODE
// ======================================================

async function createQRImage(
    websiteURL
) {

    await initQRCode();


    const qrContainer =
        document.createElement(
            "div"
        );


    qrContainer.style.position =
        "fixed";

    qrContainer.style.left =
        "-99999px";

    qrContainer.style.top =
        "-99999px";

    qrContainer.style.width =
        "300px";

    qrContainer.style.height =
        "300px";


    document.body.appendChild(
        qrContainer
    );


    try {

        new QRCode(
            qrContainer,
            {
                text: websiteURL,
                width: 300,
                height: 300,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel:
                    QRCode.CorrectLevel.H
            }
        );


        await new Promise(
            function (resolve) {

                setTimeout(
                    resolve,
                    600
                );
            }
        );


        const canvas =
            qrContainer.querySelector(
                "canvas"
            );


        if (canvas) {

            return canvas.toDataURL(
                "image/png"
            );
        }


        const image =
            qrContainer.querySelector(
                "img"
            );


        if (image) {

            return image.src;
        }


        return null;

    } finally {

        if (
            document.body.contains(
                qrContainer
            )
        ) {

            document.body.removeChild(
                qrContainer
            );
        }
    }
}


// ======================================================
// BOOK ROOM
// ======================================================

window.bookRoom =
    function (roomName) {

        const modal =
            document.getElementById(
                "bookingModal"
            );


        if (!modal) {

            alert(
                "Booking system is loading. Please try again."
            );

            return;
        }


        const roomInput =
            document.getElementById(
                "bookingRoom"
            );


        if (roomInput) {

            roomInput.value =
                roomName || "";
        }


        const form =
            document.getElementById(
                "bookingForm"
            );


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

            checkIn.min =
                today;
        }


        if (checkOut) {

            checkOut.min =
                today;
        }


        modal.classList.add(
            "show"
        );


        modal.style.display =
            "flex";


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";
    };


// ======================================================
// CLOSE BOOKING
// ======================================================

window.closeBooking =
    function () {

        const modal =
            document.getElementById(
                "bookingModal"
            );


        if (modal) {

            modal.classList.remove(
                "show"
            );


            modal.style.display =
                "none";


            modal.setAttribute(
                "aria-hidden",
                "true"
            );


            document.body.style.overflow =
                "";
        }
    };


// ======================================================
// CREATE PREMIUM HOTEL PDF RECEIPT
// ======================================================

async function createBookingReceipt(
    bookingId,
    booking
) {

    const pdfLibrary =
        await initPDF();

    const jsPDF =
        pdfLibrary.jsPDF;


    const doc =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true
        });


    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();


    // ==================================================
    // COLORS
    // ==================================================

    const BLACK = [5, 6, 7];

    const DARK = [11, 13, 15];

    const PANEL = [18, 20, 23];

    const GOLD = [217, 173, 50];

    const LIGHT_GOLD = [245, 211, 107];

    const WHITE = [248, 244, 232];

    const MUTED = [200, 195, 183];

    const SOFT = [150, 147, 138];


    // ==================================================
    // WEBSITE BACKGROUND IMAGE
    // ==================================================

    let backgroundImage = null;


    try {

        backgroundImage =
            await loadImageAsDataURL(
                HOTEL_BACKGROUND
            );

    } catch (error) {

        console.warn(
            "Hotel background unavailable.",
            error
        );
    }


    // ==================================================
    // FULL PAGE BACKGROUND
    // ==================================================

    if (backgroundImage) {

        doc.addImage(
            backgroundImage,
            "JPEG",
            0,
            0,
            pageWidth,
            pageHeight
        );

    } else {

        doc.setFillColor(
            BLACK[0],
            BLACK[1],
            BLACK[2]
        );

        doc.rect(
            0,
            0,
            pageWidth,
            pageHeight,
            "F"
        );
    }


    // ==================================================
    // DARK OVERLAY
    // ==================================================

    doc.setFillColor(
        5,
        6,
        7
    );


    doc.setGState(
        new doc.GState({
            opacity: 0.76
        })
    );


    doc.rect(
        0,
        0,
        pageWidth,
        pageHeight,
        "F"
    );


    doc.setGState(
        new doc.GState({
            opacity: 1
        })
    );


    // ==================================================
    // PREMIUM OUTER BORDER
    // ==================================================

    doc.setDrawColor(
        GOLD[0],
        GOLD[1],
        GOLD[2]
    );

    doc.setLineWidth(
        0.8
    );


    doc.rect(
        6,
        6,
        pageWidth - 12,
        pageHeight - 12
    );


    doc.setDrawColor(
        130,
        103,
        30
    );

    doc.setLineWidth(
        0.25
    );


    doc.rect(
        9,
        9,
        pageWidth - 18,
        pageHeight - 18
    );


    // ==================================================
    // HOTEL BRAND
    // ==================================================

    doc.setFont(
        "times",
        "bold"
    );

    doc.setFontSize(
        25
    );


    doc.setTextColor(
        GOLD[0],
        GOLD[1],
        GOLD[2]
    );


    doc.text(
        "BABUS PALACE",
        pageWidth / 2,
        25,
        {
            align: "center"
        }
    );


    doc.setFont(
        "times",
        "italic"
    );

    doc.setFontSize(
        8.5
    );


    doc.setTextColor(
        LIGHT_GOLD[0],
        LIGHT_GOLD[1],
        LIGHT_GOLD[2]
    );


    doc.text(
        "A PREMIUM STAY IN KALADY",
        pageWidth / 2,
        32,
        {
            align: "center"
        }
    );


    // ==================================================
    // ADDRESS
    // ==================================================

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        7.5
    );


    doc.setTextColor(
        MUTED[0],
        MUTED[1],
        MUTED[2]
    );


    doc.text(
        HOTEL_ADDRESS,
        pageWidth / 2,
        39,
        {
            align: "center"
        }
    );


    doc.text(
        "Phone: " + HOTEL_PHONE,
        pageWidth / 2,
        45,
        {
            align: "center"
        }
    );


    // ==================================================
    // DIVIDER
    // ==================================================

    doc.setDrawColor(
        GOLD[0],
        GOLD[1],
        GOLD[2]
    );

    doc.setLineWidth(
        0.55
    );


    doc.line(
        27,
        52,
        pageWidth - 27,
        52
    );


    // ==================================================
    // RECEIPT TITLE
    // ==================================================

    doc.setFont(
        "times",
        "bold"
    );

    doc.setFontSize(
        18
    );


    doc.setTextColor(
        WHITE[0],
        WHITE[1],
        WHITE[2]
    );


    doc.text(
        "BOOKING RECEIPT",
        pageWidth / 2,
        64,
        {
            align: "center"
        }
    );


    // ==================================================
    // BOOKING ID
    // ==================================================

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        7
    );


    doc.setTextColor(
        SOFT[0],
        SOFT[1],
        SOFT[2]
    );


    doc.text(
        "BOOKING ID",
        20,
        75
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        9
    );


    doc.setTextColor(
        LIGHT_GOLD[0],
        LIGHT_GOLD[1],
        LIGHT_GOLD[2]
    );


    doc.text(
        String(bookingId),
        20,
        81
    );


    // ==================================================
    // STATUS
    // ==================================================

    doc.setFillColor(
        48,
        40,
        19
    );


    doc.roundedRect(
        pageWidth - 57,
        72,
        37,
        12,
        3,
        3,
        "F"
    );


    doc.setDrawColor(
        GOLD[0],
        GOLD[1],
        GOLD[2]
    );

    doc.setLineWidth(
        0.25
    );


    doc.roundedRect(
        pageWidth - 57,
        72,
        37,
        12,
        3,
        3,
        "S"
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        7
    );


    doc.setTextColor(
        LIGHT_GOLD[0],
        LIGHT_GOLD[1],
        LIGHT_GOLD[2]
    );


    doc.text(
        "PENDING",
        pageWidth - 38.5,
        79,
        {
            align: "center"
        }
    );


    // ==================================================
    // SECTION HELPER
    // ==================================================

    function drawSection(
        y,
        height,
        title
    ) {

        doc.setFillColor(
            PANEL[0],
            PANEL[1],
            PANEL[2]
        );


        doc.setGState(
            new doc.GState({
                opacity: 0.92
            })
        );


        doc.roundedRect(
            16,
            y,
            pageWidth - 32,
            height,
            3,
            3,
            "F"
        );


        doc.setGState(
            new doc.GState({
                opacity: 1
            })
        );


        doc.setDrawColor(
            85,
            72,
            39
        );

        doc.setLineWidth(
            0.25
        );


        doc.roundedRect(
            16,
            y,
            pageWidth - 32,
            height,
            3,
            3,
            "S"
        );


        doc.setFont(
            "times",
            "bold"
        );

        doc.setFontSize(
            11
        );


        doc.setTextColor(
            GOLD[0],
            GOLD[1],
            GOLD[2]
        );


        doc.text(
            title,
            22,
            y + 9
        );
    }


    // ==================================================
    // GUEST DETAILS
    // ==================================================

    drawSection(
        88,
        39,
        "GUEST DETAILS"
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        7
    );


    doc.setTextColor(
        SOFT[0],
        SOFT[1],
        SOFT[2]
    );


    doc.text(
        "Guest Name",
        22,
        105
    );

    doc.text(
        "Phone",
        22,
        115
    );

    doc.text(
        "Email",
        22,
        125
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        8
    );


    doc.setTextColor(
        WHITE[0],
        WHITE[1],
        WHITE[2]
    );


    doc.text(
        String(
            booking.name || ""
        ),
        57,
        105
    );


    doc.text(
        String(
            booking.phone || ""
        ),
        57,
        115
    );


    doc.text(
        String(
            booking.email || ""
        ),
        57,
        125
    );


    // ==================================================
    // STAY DETAILS
    // ==================================================

    drawSection(
        132,
        46,
        "STAY DETAILS"
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        7
    );


    doc.setTextColor(
        SOFT[0],
        SOFT[1],
        SOFT[2]
    );


    doc.text(
        "Room",
        22,
        149
    );

    doc.text(
        "Check-in",
        22,
        159
    );

    doc.text(
        "Check-out",
        22,
        169
    );

    doc.text(
        "Guests",
        110,
        149
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        8
    );


    doc.setTextColor(
        WHITE[0],
        WHITE[1],
        WHITE[2]
    );


    doc.text(
        String(
            booking.room || ""
        ),
        57,
        149
    );


    doc.text(
        String(
            booking.checkIn || ""
        ),
        57,
        159
    );


    doc.text(
        String(
            booking.checkOut || ""
        ),
        57,
        169
    );


    doc.text(
        String(
            booking.guests || ""
        ),
        142,
        149
    );


    // ==================================================
    // PRICE SUMMARY
    // ==================================================

    drawSection(
        179,
        43,
        "PRICE SUMMARY"
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        7.5
    );


    doc.setTextColor(
        SOFT[0],
        SOFT[1],
        SOFT[2]
    );


    doc.text(
        "Room rate / night",
        22,
        195
    );


    doc.text(
        "Number of nights",
        22,
        205
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        8
    );


    doc.setTextColor(
        WHITE[0],
        WHITE[1],
        WHITE[2]
    );


    doc.text(
        formatCurrency(
            booking.price
        ),
        pageWidth - 22,
        195,
        {
            align: "right"
        }
    );


    doc.text(
        String(
            booking.nights
        ),
        pageWidth - 22,
        205,
        {
            align: "right"
        }
    );


    // ==================================================
    // TOTAL
    // ==================================================

    doc.setDrawColor(
        GOLD[0],
        GOLD[1],
        GOLD[2]
    );

    doc.setLineWidth(
        0.35
    );


    doc.line(
        22,
        211,
        pageWidth - 22,
        211
    );


    doc.setFont(
        "times",
        "bold"
    );

    doc.setFontSize(
        11
    );


    doc.setTextColor(
        LIGHT_GOLD[0],
        LIGHT_GOLD[1],
        LIGHT_GOLD[2]
    );


    doc.text(
        "TOTAL",
        22,
        219
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        11
    );


    doc.text(
        formatCurrency(
            booking.total
        ),
        pageWidth - 22,
        219,
        {
            align: "right"
        }
    );


    // ==================================================
    // QR CODE
    // ==================================================

    let qrImage = null;


    try {

        qrImage =
            await createQRImage(
                HOTEL_WEBSITE
            );

    } catch (qrError) {

        console.error(
            "QR generation error:",
            qrError
        );
    }


    if (qrImage) {

        doc.setFillColor(
            248,
            244,
            232
        );


        doc.roundedRect(
            20,
            230,
            39,
            39,
            3,
            3,
            "F"
        );


        doc.addImage(
            qrImage,
            "PNG",
            23,
            233,
            33,
            33
        );


        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(
            7.5
        );


        doc.setTextColor(
            WHITE[0],
            WHITE[1],
            WHITE[2]
        );


        doc.text(
            "SCAN TO VISIT",
            67,
            242
        );


        doc.setFont(
            "times",
            "bold"
        );

        doc.setFontSize(
            12
        );


        doc.setTextColor(
            GOLD[0],
            GOLD[1],
            GOLD[2]
        );


        doc.text(
            "BABUS PALACE",
            67,
            251
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(
            7.5
        );


        doc.setTextColor(
            MUTED[0],
            MUTED[1],
            MUTED[2]
        );


        doc.text(
            "Scan the QR code to visit",
            67,
            259
        );


        doc.text(
            "our official website.",
            67,
            266
        );
    }


    // ==================================================
    // FOOTER
    // ==================================================

    doc.setDrawColor(
        GOLD[0],
        GOLD[1],
        GOLD[2]
    );

    doc.setLineWidth(
        0.45
    );


    doc.line(
        20,
        276,
        pageWidth - 20,
        276
    );


    doc.setFont(
        "times",
        "italic"
    );

    doc.setFontSize(
        9
    );


    doc.setTextColor(
        LIGHT_GOLD[0],
        LIGHT_GOLD[1],
        LIGHT_GOLD[2]
    );


    doc.text(
        "Thank you for choosing BABUS PALACE",
        pageWidth / 2,
        283,
        {
            align: "center"
        }
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        6.5
    );


    doc.setTextColor(
        SOFT[0],
        SOFT[1],
        SOFT[2]
    );


    doc.text(
        "Booking request subject to confirmation by BABUS PALACE.",
        pageWidth / 2,
        289,
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

function openWhatsApp(
    booking
) {

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
        encodeURIComponent(
            message
        );


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


                    // ==================================================
                    // VALIDATION
                    // ==================================================

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


                    // ==================================================
                    // NIGHTS
                    // ==================================================

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


                    // ==================================================
                    // PRICE
                    // ==================================================

                    const price =
                        ROOM_PRICES[room] || 0;


                    if (!price) {

                        alert(
                            "Invalid room selected."
                        );

                        return;
                    }


                    // ==================================================
                    // TOTAL
                    // ==================================================

                    const total =
                        price * nights;


                    // ==================================================
                    // BOOKING ID
                    // ==================================================

                    const bookingId =
                        "BP-" +
                        Date.now();


                    // ==================================================
                    // BOOKING OBJECT
                    // ==================================================

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


                    // ==================================================
                    // BUTTON
                    // ==================================================

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
                    // FIREBASE
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
                    // PDF
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
                    // WHATSAPP
                    // ==================================================

                    openWhatsApp(
                        booking
                    );


                    // ==================================================
                    // RESET
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
                    // CLOSE
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
        // OUTSIDE MODAL
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
        // ESCAPE
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
        // GALLERY
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
        // LOGO
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
        // CONTACT LINKS
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
                            // Browser handles the link.
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
