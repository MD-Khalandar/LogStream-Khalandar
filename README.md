# LogStream

LogStream is a small real-time log viewer built with Node.js, Express, vanilla HTML/CSS/JavaScript, and **Server-Sent Events (SSE)**. It simulates application logs on the server and streams them to the browser in real time.

The interface lets a user identify a client, start or stop a live stream, filter visible log levels, and download all logs received in the current browser session.

## Features

- Real-time, one-way log delivery with Server-Sent Events
- Random `INFO`, `WARN`, and `ERROR` log generation every 500 ms
- Client ID included when a stream begins
- Start and stop controls for the stream
- Colour-coded terminal output
- Client-side log-level filtering
- Session log export as `logs.txt`
- A standard JSON endpoint for fetching one generated log

## Tech used

| Technology | Purpose |
| --- | --- |
| Node.js | Runs the server |
| Express 5 | Serves the static frontend and HTTP/SSE routes |
| Server-Sent Events (SSE) | Pushes server logs to the browser over HTTP |
| `EventSource` browser API | Opens and receives the SSE stream |
| HTML / CSS | Defines and styles the user interface |
| Vanilla JavaScript | Handles streaming, filters, controls, and downloads |

## Project structure

```text
.
├── backend.js          # Express server, log generator, REST and SSE endpoints
├── package.json        # Express dependency
└── public/
    ├── index.html      # Log viewer page and styles
    └── index.js        # Browser-side stream and UI logic
```

## Prerequisites

- [Node.js](https://nodejs.org/) (a current LTS version is recommended)
- npm (installed with Node.js)

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   node backend.js
   ```

3. Open [http://localhost:3000](http://localhost:3000) in a browser.

4. Enter a client ID and select **Start Stream**. Select **Stop Stream** when finished.

The server writes connection and disconnection messages to its terminal.

## How SSE works here

SSE is an HTTP-based mechanism for server-to-browser updates. Unlike polling, the browser creates one long-lived request and the server keeps writing events to that same response. Unlike WebSockets, SSE is designed for one-way server-to-client communication, which fits a live log viewer.

When the user starts a stream, the frontend creates:

```js
new EventSource(`/stream?clientId=${encodeURIComponent(clientId)}`)
```

The `EventSource` API connects to the server's `/stream` endpoint. The server configures the response with these essential headers:

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

It then sends SSE messages in this format:

```text
data: {"level":"INFO","timestamp":"12:34:56.789","message":"..."}

```

Each event ends with a blank line (`\n\n`). The browser receives it through `source.onmessage`, parses the JSON, saves it to the session array, and displays it if it matches the selected filter.

The server immediately emits a `Stream started for client ...` event, then emits a new random log every 500 ms. When the browser closes the stream, the server receives the request's `close` event and clears that client's interval, avoiding an orphaned timer.

## Endpoints

### `GET /`

Serves the frontend from the `public` directory through `express.static("public")`.

### `GET /log?clientId=<id>`

Returns one generated log object as JSON. This is a normal request/response endpoint, not a stream.

Example:

```bash
curl "http://localhost:3000/log?clientId=demo-client"
```

Example response:

```json
{
  "clientId": "demo-client",
  "level": "WARN",
  "timestamp": "12:34:56.789",
  "message": "High memory usage detected."
}
```

### `GET /stream?clientId=<id>`

Opens a persistent SSE connection. The response consists of JSON log events sent every 500 ms until the client disconnects.

## Log format

Generated logs have this shape:

```json
{
  "level": "INFO | WARN | ERROR",
  "timestamp": "HH:MM:SS.mmm",
  "message": "A simulated log message"
}
```

The first SSE event also includes the supplied `clientId`. The later generated events contain the log fields above.

Available simulated messages are grouped by level:

- `INFO`: database/session/cache success messages
- `WARN`: memory, CPU, and slow database-response warnings
- `ERROR`: API, database connection, and authentication-service failures

## Frontend behaviour

- **Start Stream** requires a non-empty client ID, marks the session `LIVE`, and disables itself while the connection is open.
- **Stop Stream** calls `EventSource.close()`, marks the session `STOPPED`, and re-enables the start button.
- Changing to a different client ID on a later stream adds a local informational line to the terminal.
- The filter controls only what is shown in the terminal. All received server log lines are still retained in `sessionlogs` for export.
- Terminal output is styled by severity: green for info, orange for warnings, and red for errors.
- The terminal keeps at most 100 DOM children to limit the rendered history; the in-memory export array is not limited.
- **Save Session Output** creates a text `Blob` in the browser and downloads it as `logs.txt`. Nothing is uploaded or stored on the server.

## Notes and limitations

- Logs are simulated and random; no external logging system or database is connected.
- The server listens on port `3000`.
- There is no authentication, persistence, or reconnection/status UI beyond the browser's built-in `EventSource` behavior.
- This project does not currently define npm scripts; use `node backend.js` to start it.

## Possible next improvements

- Add an npm `start` script and development auto-reload.
- Add error and reconnect indicators using `EventSource.onerror`.
- Send named SSE events (for example `event: log`) and support heartbeat events.
- Preserve logs in a database or accept logs from real services.
- Add timestamps/date formatting, search, pause, clear, and filter persistence.
- Add automated tests and input validation/rate limiting for a production deployment.

## License

No license file is currently included. Add a license before distributing or reusing this project publicly.

Deployed on Render : https://logstream-khalandar.onrender.com/
