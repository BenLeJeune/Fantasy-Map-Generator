import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
const doc = new Y.Doc();
const mapData = doc.getMap("mapData");

let observers = [];
mapData.observe(() => {
    console.log(`Mapdata changed: `, mapData.toJSON())
    for ( let observer in observers ) {
        if (typeof observer === "function") observer( mapData )
    }
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

window.changeDoc = ( cb ) => cb( doc, Y );
window.docExists = () => {
    console.log(`Does this doc exist? `, mapData.toJSON())
    return mapData.has("pack") && mapData.has("grid");
};
window.syncedWithServer = wsProvider.synced;
window.setOnConnect = cb => {
    onConnected = cb;
}

window.registerObserver = observer => observers.push( observer );

window.packToMap = pack => {
    let packMap = new Y.Map();
    for ( let key of Object.keys(pack) ) {
        if (typeof pack[key] === "object" && Array.isArray(pack[key])) {
            //If is an array
            let arr = new Y.Array();
            arr.push( pack[key] );
            packMap.set( key, arr );
        }
        else {
            //Object or Array
            packMap.set( key, pack[key] );
        }
    }
    return packMap;
}

window.shallowMapToObject = map => {
    let destObj = {};
    for ( let [ key, value ] of map ) {
        destObj[key] = value;
    }
    return destObj;
}