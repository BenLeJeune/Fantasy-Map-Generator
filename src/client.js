import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
const doc = new Y.Doc();
const mapData = doc.getMap("mapData");

mapData.observe(() => {
    console.log(`Mapdata changed: `, mapData.toJSON())
})

const wsProvider = new WebsocketProvider(
    "ws://localhost:3000",
    "example-doc-room",
    doc
);

console.time("Connected to socket server in");

wsProvider.on("sync", event => {
    console.timeEnd("Connected to socket server in");
    onConnected();
});

let onConnected;

window.changeDoc = ( cb ) => cb( doc );
window.docExists = () => {
    console.log(`Does this doc exist? `, mapData.toJSON())
    return mapData.entries.length !== 0
};
window.syncedWithServer = wsProvider.synced;
window.setOnConnect = cb => {
    onConnected = cb;
}