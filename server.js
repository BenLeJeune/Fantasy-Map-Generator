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
const initDoc = Automerge.change(Automerge.init(), doc => doc.hello = "hi");

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

    console.log( socket.client.id + "connected!" )
    //We've connected to a socket!
    //Time to listen for some events...

    socket.on("client-new-doc", data => {
        //We got the new document!
        //Let's look at it...
        console.log( "Client data:", data );
    })
}
    
io.sockets.on("connect", handler);

//Correct server setup

server.listen( SERVER_PORT, () => {
    console.log(`http server listening on port ${ SERVER_PORT }`);
} )