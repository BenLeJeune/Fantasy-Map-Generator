const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/client.js",
    output: {
        library: "WebsocketClient",
        path: path.resolve( __dirname, "./public" ),
        filename: "bundle.js"
    }
}