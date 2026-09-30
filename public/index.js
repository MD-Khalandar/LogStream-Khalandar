const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const terminal = document.getElementById("terminal");

let source=null;
const clientIdInput = document.getElementById("clientId");
let previousClientId = null;
startBtn.addEventListener("click", () => {

    const clientId = clientIdInput.value.trim();

    if (!clientId) {
        alert("Enter a client name");
        return;
    }

    const terminalHeader =
        document.getElementById("terminalHeader");

    if (
        previousClientId !== null &&
        previousClientId !== clientId
    ) {
        const line = document.createElement("div");

        line.textContent =
        `[INFO] ${new Date().toLocaleTimeString()} - Client changed from "${previousClientId}" to "${clientId}"`;

        line.classList.add("info");

        terminal.appendChild(line);
    }

    previousClientId = clientId;

    terminalHeader.textContent =
        `Session: ${clientId} | Status: LIVE`;

    source = new EventSource(
        `/stream?clientId=${encodeURIComponent(clientId)}`
    );

    startBtn.disabled = true;
    stopBtn.disabled = false;

    source.onmessage = (event) => {

        const log = JSON.parse(event.data);

        displayLog(log);

    };

});
stopBtn.addEventListener("click", () => {

    const terminalHeader =
        document.getElementById("terminalHeader");

    const clientId = clientIdInput.value;

    terminalHeader.textContent =
        `Session: ${clientId} | Status: STOPPED`;

    if (source) {
        source.close();
        source = null;
    }

    startBtn.disabled = false;
    stopBtn.disabled = true;

});
function displayLog(log) {

    const line = document.createElement("div");

    line.textContent =
        `[${log.level}] ${log.timestamp} - ${log.message}`;

    if (log.level === "INFO") {
        line.classList.add("info");
    }

    else if (log.level === "WARN") {
        line.classList.add("warn");
    }

    else if (log.level === "ERROR") {
        line.classList.add("error");
    }

    terminal.appendChild(line);

    terminal.scrollTop = terminal.scrollHeight;
}