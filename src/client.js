import * as Y from "yjs";
import { WebsocketProvider, WebSocketProvider } from "y-websocket";

const doc = new Y.Doc();
const wsProvider = new WebsocketProvider(
    "ws://localhost:3000",
    "example-doc-room",
    doc
);

console.time("Connected to socket server in");

wsProvider.on("sync", event => {
    console.timeEnd("Connected to socket server in");
    wsProvider.emit("client-request-initial-state");
});

window.someFunc = function someFunc() {
    alert("SomeFunction!");
}