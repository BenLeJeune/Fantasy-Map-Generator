const express = require("express");

const Connection = require("./server-connection");

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

// setInterval(() => { //Increments a counter every 3 seconds
//     let doc = docSet.getDoc("example");
//     doc = Automerge.change( doc, doc => {
//         doc.serverNum = ( doc.serverNum | 0 ) + 1
//     });
//     docSet.setDoc("example", doc);
// }, 3000 );

//When something connects
const handler = socket => {

    console.log( socket.client.id )
    
    console.log(`[${ socket.remoteAddress }: ${ socket.remotePort }] connected`)
    
    const connection = new Connection( docSet, socket );

    //When recieving data from the client
    socket.on('data', data => {
        if (!( data instanceof Buffer )) {
            data = Buffer.from( data, 'utf8' );
        }
        
        connection.recieveData( data );

    })

    //On close
    socket.on( 'close', data => {
        console.log(`[${ socket.remoteAddress }: ${ socket.remotePort }] closed`);
        connection.close();
    } )

    //On error
    socket.on('error', error => {
        console.log(`[${ socket.remoteAddress }: ${ socket.remotePort }] error: ${ error }`)
    })
}

// app.use('/server', (req, res) => {
//     handler( req.socket );
// })

io.sockets.on("connect", handler);

// app.listen(SERVER_PORT, () => {
//     console.log(`Server listening on port ${ SERVER_PORT }`);
// })

//Correct server setup

server.listen( SERVER_PORT, () => {
    console.log(`http server listening on port ${ SERVER_PORT }`)
} );