const Automerge = require("automerge");
const io = require("socket.io-client");
const socket = io(); 

const PORT = 3000;
const HOST = '127.0.0.1';

const docSet = new Automerge.DocSet();

console.log("docSet:", docSet);

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

setInterval(() => {
    updateDocument( doc => {
        doc.serverNum.increment();
    } )
}, 5000)

//FORWARDING FUNCTIONS FROM ___-CHANGES.JS

const syncFunc = {
    TriggerChange: () => {
        //Whenever we do this, let's increment the state by 1 because why not.
        updateDocument("Making a bigger increment!", doc => {
            doc.serverNum.increment(5);
        });
    }
};

module.exports = syncFunc;