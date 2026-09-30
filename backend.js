const express = require("express");

const app = express();

app.use(express.static("public"));

const messages = {
    INFO: [
        "Database connection stable.",
        "Session initialized.",
        "Cache refresh completed."
    ],

    WARN: [
        "High memory usage detected.",
        "CPU usage above normal.",
        "Database response is slow."
    ],

    ERROR: [
        "API request failed.",
        "Database connection failed.",
        "Authentication service unavailable."
    ]
};

function getTimestamp() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function generateLog() {
    const levels = ["INFO", "WARN", "ERROR"];

    const level =
        levels[Math.floor(Math.random() * levels.length)];

    const possibleMessages = messages[level];

    const message =
        possibleMessages[
            Math.floor(Math.random() * possibleMessages.length)
        ];

    return {
        level: level,
        timestamp: getTimestamp(),
        message: message
    };
}

app.get("/log", (req, res) => {

    const clientId = req.query.clientId;

    const log = generateLog();

    res.json({
        clientId: clientId,
        ...log
    });

});
app.get("/stream", (req, res) => {

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const clientId = req.query.clientId;

    console.log(`${clientId} connected`);

    res.write(
        `data: ${JSON.stringify({
        clientId: clientId,
        level: "INFO",
        timestamp: getTimestamp(),
        message: `Stream started for client ${clientId}`
    })}\n\n`
);

    const timer = setInterval(() => {

        const log = generateLog();

        res.write(
            `data: ${JSON.stringify(log)}\n\n`
        );

    }, 500);

    req.on("close", () => {

        clearInterval(timer);

        console.log(`${clientId} disconnected`);

    });

});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});