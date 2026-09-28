const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const terminal = document.getElementById("terminal");

let pollingTimer = null;

startBtn.addEventListener("click", () => {

    startBtn.disabled = true;
    stopBtn.disabled = false;

    pollingTimer = setInterval(async () => {

        const response = await fetch("/log");

        const log = await response.json();

        displayLog(log);

    }, 500);

});

stopBtn.addEventListener("click", () => {

    clearInterval(pollingTimer);

    pollingTimer = null;

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