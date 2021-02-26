const Automerge = require("automerge");

//from the automerge-net github repo mostly

class Connection {

    constructor(docSet, socket) {
        //docSet is the document, socket is the connected socket
        this.autoMerge = new Automerge.Connection( docSet, msg => this.sendMsg( msg ) );
        this.socket = socket;
        this.buffer = Buffer.alloc(0);
        this.autoMerge.open();
    }

    recieveData = data => {
        this.buffer = Buffer.concat([this.buffer, data]);

        while (true) {
            //If there is enough buffer data, decode it into messages
            
            if ( this.buffer.length < 4 ) break;

            const msgLength = this.buffer.readInt32BE(0);
            if ( this.buffer.length < msgLength + 4 ) break;

            const msg = JSON.parse(this.buffer.toString('utf8', 4, msgLength + 4));
            this.buffer = this.buffer.slice( msgLength + 4 );
            console.log("Recieved:", msg);
            this.autoMerge.receiveMsg( msg );
        }

    }

    sendMsg = msg => {
        if (!this.socket) return;

        console.log("Sending message...");

        const data = Buffer.from(JSON.stringify(msg), 'utf8');
        const header = Buffer.alloc(4);

        header.writeInt32BE(data.length, 0);

        this.socket.write(header);
        this.socket.write(data);

        this.socket.emit("data", { data: "cool-data" });

    }

    close = () => { //Closes the connection
        if (!this.socket) return;
        this.socket.end();
        this.socket = null;
    }

}

module.exports = Connection;