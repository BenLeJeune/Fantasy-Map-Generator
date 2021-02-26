const Automerge = require("automerge");
const io = require("socket.io-client");
const Connection = require("./server-connection");
const Buffer = require("buffer");
const socket = io();

const PORT = 3000;
const HOST = '127.0.0.1';

const docSet = new Automerge.DocSet();
const initDoc = new Automerge.from({ serverNum: 0 });
docSet.setDoc("example", initDoc);

console.log("docSet:", docSet);

//console.log the doc whenever it changes
docSet.registerHandler((docId, doc) => {
    console.log(`[${ docId }] ${ JSON.stringify(doc) }`);
})

let connection = new Connection(docSet, socket);
console.log("Socket: ", socket);

console.log("Trying to connect");
//Connect to the port
socket.connect(PORT, HOST, () => {
  console.log(`${HOST}:${PORT} connected`);
})

socket.on("connect", () => {
  console.log(`Connected to ${PORT}:${HOST}`)
})

//Recieving data from the server
socket.on("data", data => {
    if (!(data instanceof Buffer.Buffer)) {
        data = Buffer.Buffer.from(data, 'utf8');
    }
    connection.recieveData( data );
})

setInterval(() => {
    let doc = docSet.getDoc("example");
    console.log(doc.serverNum);
}, 1000)

// setInterval(() => {
//     let doc = docSet.getDoc('example')
//     if (doc) {
//       doc = Automerge.change(doc, doc => {
//         doc.clientNum = (doc.clientNum || 0) + 1
//       })
//       docSet.setDoc('example', doc)
//     }
//   }, 3000)

const syncFunc = {
    TriggerChange: () => {
        //Whenever we do this, let's increment the state by 1 because why not.
        console.log("Reached triggerChange()");
        let currentDoc = docSet.getDoc("example");
        console.log("Got the doc!");

        if (Automerge.change) {
        let [ newDoc ] = Automerge.change( currentDoc, "incrementing", doc => {
            doc.serverNum = doc.serverNum ? doc.serverNum + 1 : 1;
            console.log("oops")
        });
        }
        console.log("Setting the doc!");
        docSet.setDoc("example", newDoc);
    }
};

module.exports = syncFunc;