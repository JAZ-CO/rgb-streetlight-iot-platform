import http from "http";
import { createApp } from "./app.js";

const port = process.env.PORT || 3000;
const { app, initRealtime } = createApp();
const server = http.createServer(app);

initRealtime(server);

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
