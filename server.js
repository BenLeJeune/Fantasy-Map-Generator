const express = require("express");
//Making a simple express server 

const SERVER_PORT = 3000;
const app = express();
const server = require("http").createServer( app );
const io = require("socket.io")(server);

app.use("/public", express.static( __dirname + "/public" ));

app.get("/", (req, res) => {
    res.send("Hi there!");
})

//AUTOMERGE STUFF
const Automerge = require("automerge");

const docSet = new Automerge.DocSet();
const emptyDoc = Automerge.init();
const initDoc = Automerge.change( emptyDoc, "Initial state", doc => {
    doc.serverNum = new Automerge.Counter();
});


docSet.setDoc( "example", initDoc );

//Print the document whenever it changes
docSet.registerHandler((docId, doc) => {
    console.log(`[${ docId }]: ${ doc.serverNum | "No server number" }`)
});

//setInterval(() => { //Increments a counter every 3 seconds
    //let doc = docSet.getDoc("example");
    //let newDoc = Automerge.change( doc, doc => {
        //doc.serverNum = ( doc.serverNum | 0 ) + 1
    //});
    //let changes = Automerge.getChanges( doc, newDoc );
    //docSet.setDoc("example", newDoc);
//}, 5000 );


//When something connects
const handler = socket => {

    let doc = docSet.getDoc("example");
    
    console.log( socket.client.id + "connected!" )
    //We've connected to a socket!
    
    //We want to send this socket the changes so they can make their doc.
    const initChanges = Automerge.getAllChanges( doc );
    const emitData = { initChanges }
    socket.emit("server-set-initial-state", emitData);    

    //Time to listen for some events...


    socket.on("client-new-changes", data => {
        //We got the new document!
        //Let's look at it...

        let doc = docSet.getDoc("example");

        console.log( "Client sending us changes" );
        
        //Now we want to send this out to everyone.
        const changes = JSON.parse(data.changes);
        
        const newDoc = Automerge.applyChanges( doc, changes );

        docSet.setDoc("example", newDoc);

        const emitData = {
            changes: JSON.stringify(changes),
            client_id: data.client_id
        };
        //Broadcast.emit sends to everyone EXCEPT FOR the client that sent it
        socket.broadcast.emit("server-new-changes", emitData );

        console.log(doc.serverNum, newDoc.serverNum);
    })
}
    
io.sockets.on("connect", handler);

//Correct server setup

server.listen( SERVER_PORT, () => {
    console.log(`http server listening on port ${ SERVER_PORT }`);
} )