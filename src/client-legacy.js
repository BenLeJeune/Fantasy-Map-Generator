//Setting up the websocket
const io = require("socket.io-client");
const socket = io();
const PORT = 3000, HOST = '127.0.0.1';

//Declaring the YJS document
import * as Y from 'yjs';

const doc = new Y.Doc();

//Connecting the websocket
socket.connect(PORT, HOST);
socket.on("connect", () => {
    console.log(`Connected to ${HOST}:${PORT}`);
})