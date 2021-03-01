//CREATING THE SERVER
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

//APP SERVES THE ACTUAL WEBSITE
app.use("/public", express.static( __dirname + "/public" ));


const PORT = 3000;
server.listen( PORT, () => {
    console.log(`Server listening on port ${ PORT }`)
} )