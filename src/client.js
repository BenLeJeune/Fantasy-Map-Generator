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

window.doc = ( cb ) => cb( doc, Y );

window.changeDoc = ( cb ) => cb( doc, Y );
window.docExists = () => {
    console.log(`Does this doc exist? `, mapData.toJSON())
    return mapData.has("pack") && mapData.has("grid");
};
window.syncedWithServer = wsProvider.synced;
window.setOnConnect = cb => {
    onConnected = cb;
}

window.Y = () => Y;

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


///
/// CONVERTS A MAP BACK INTO AN OBJECT
/// CONVERTS Y ARRAYS INTO REGULAR ARRAYS
///
window.shallowMapToObject = map => {
    let destObj = {};
    for ( let [ key, value ] of map ) {
        if ( value.toArray ) {
            destObj[key] = value.toArray()
        } else {
            destObj = Object.assign( destObj, { [key]: value } );
        }
    }
    return destObj;
}

///
/// THIS CONVERTS AN OBJECT INTO A MAP
/// THE OBJECT'S PROPERTIES WILL BE CONVERTED INTO APPROPRIATE Y DATA TYPES
///
window.shallowObjectToMap = object => {
    let map = new Y.Map();
    for ( let key of Object.keys(object) ) {
        if ( Array.isArray( object[key] )) {
            let arr = new Y.Array();
            arr.push( object[key] );
            map.set( key, arr );
        } else {
            map.set( key, object[key] );
        }
    }
    return map;
}