import type { ServerWebSocket } from "bun";

const openConnections: Set<ServerWebSocket<unknown>> = new Set();

const server = Bun.serve<{ authToken: string }>({
  fetch(req, server) {
    const success = server.upgrade(req);
    if (success) {
      // Bun automatically returns a 101 Switching Protocols
      // if the upgrade succeeds
      return undefined;
    }

    // handle HTTP request normally
    return new Response("Hello world!");
  },
  websocket: {
    async open(ws) {
      openConnections.add(ws)
    },
    async close(ws, code, reason) {
      openConnections.delete(ws)
    },
    // this is called when a message is received
    async message(ws, message) {
      console.log(`Received ${message}`);
      // send back a message
      ws.send(`You said: ${message}`);
      // notify everyone else about the message
      for (const otherWs of openConnections) {
        if (otherWs !== ws) {
          otherWs.send(`Someone else said: ${message}`)
        }
      }
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
