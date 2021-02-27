const Automerge = require("automerge");
const io = require("socket.io-client");
const Buffer = require("buffer");
const e = require("cors");
const socket = io(); 

const PORT = 3000;
const HOST = '127.0.0.1';

const docSet = new Automerge.DocSet();

console.log("docSet:", docSet);

//console.log the doc whenever it changes
//Whenever there is a change in the document, we want to send it to the server.
//docSet.registerHandler((docId, doc) => {
    
    //console.log(`Sending change to server: [${ docId }] ${ JSON.stringify(doc) }`);
    ////If we have the example document, we want to emit the data.
    //if ( docId === "example" ) {   
        ////This emits an event that we can respond to on the server,
        ////sending with it the new document

        ////So these objects are funky and use SYMBOLS as keys, which json doesn't like.
        ////For each "symbol" we'll turn it into a string property that json does like.
        //const destinationDoc = jsonSymbols.jsonSymbolEncoder(doc);

        //console.log("destination:", destinationDoc);

        //console.log("parsed again:", jsonSymbols.jsonSymbolParser(destinationDoc));

        //const emitData = {
            //new_doc: destinationDoc,
            //client_id: socket.id
        //}

        //socket.emit("client-new-doc", emitData );
    //}
//})

function updateDocument( description, updateCallback ) {
    //We want to make changes in the same place that we send the changes to the server
    
    const currentDoc = docSet.getDoc("example");
    console.log(`serverNum before internal update: `, currentDoc.serverNum.value);

    if ( currentDoc ) {
        const newDoc = Automerge.change(currentDoc, description, updateCallback);
        console.log("internal newDoc serverNum: ", newDoc.serverNum.value)
        //Get the changes
        const changes = Automerge.getChanges(currentDoc, newDoc);


        docSet.setDoc("example", newDoc);

        const emitData = {
            changes: JSON.stringify(changes),
            client_id: socket.id
        }
        console.log("sending new doc to server: ", newDoc.serverNum.value);

        socket.emit("client-new-changes", emitData)

    }

}

//We also want to be able to recieve data from the server
//As currently setup, should (?) bounce infinitely

socket.on("server-new-changes", data => {

    console.log("server-new-changes event");

    const changes = JSON.parse(data.changes);
    const client_id = data.client_id;

    console.log(client_id, socket.id);

    if ( client_id === socket.id ) {
        console.log("These are changes from us - don't worry");
    } else {
        //We want to apply the changes we get from the server
        const currentDoc = docSet.getDoc("example");
        console.log("Applying changes from server: ", changes);
        const newDoc = Automerge.applyChanges(currentDoc, changes);
        console.log("Server response gives serverNum at ", newDoc.serverNum.value)
        docSet.setDoc("example", newDoc);
    }
})

socket.on("server-set-initial-state", data => {
    //We get all the changes since the start of the node
    const changes = data.initChanges;
    console.log("Setting up doc");
    //We apply this to a fresh node
    const freshDoc = Automerge.applyChanges(Automerge.init(), changes);
    //Now, set this as the state
    console.log("Initial state has serverNum at ", freshDoc.serverNum.value);
    docSet.setDoc("example", freshDoc);
})

socket.connect(PORT, HOST);

socket.on("connect", () => {
    console.log("Connected to server!");
    console.log(socket);
})



























//console.log("Socket: ", socket);

//console.log("Trying to connect");
////Connect to the port


//socket.on("connect", () => {
  //console.log(`Connected to ${PORT}:${HOST}`)
//})

////Recieving data from the server
//socket.on("data", data => {
    //if (!(data instanceof Buffer.Buffer)) {
        //data = Buffer.Buffer.from(data, 'utf8');
    //}
    //connection.recieveData( data );
//})

setInterval(() => {
    updateDocument( doc => {
        doc.serverNum.increment();
    } )
}, 5000)

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

        updateDocument("Making a bigger increment!", doc => {
            doc.serverNum.increment(5);
        });
    }
};

module.exports = syncFunc;