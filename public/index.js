const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const terminal = document.getElementById("terminal");

let source=null;
const clientIdInput = document.getElementById("clientId");
let previousClientId = null;
const filter = document.getElementById("filter");
let sessionlogs=[];
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
         
    const formatted =
        `[${log.level}] ${log.timestamp} - ${log.message}`;
    sessionlogs.push(formatted);
    const selected = filter.value;

    if (
        selected === "ALL" ||
        (log.level === selected)
    ) {
        displayLog(log);
    }
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

    line.classList.add(log.level.toLowerCase());

    terminal.appendChild(line);

    if (terminal.children.length > 100) {
        terminal.removeChild(terminal.firstChild);
    }

    terminal.scrollTop = terminal.scrollHeight;
}
const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", () => {
    const text = sessionlogs.join("\n");

    const blob = new Blob(
        [text],
        { type: "text/plain" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "logs.txt";

    link.click();

    URL.revokeObjectURL(url);
});