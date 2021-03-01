#!/usr/bin/env node

/**
 * @type {any}
 */
const WebSocket = require('ws')
const http = require('http')
const wss = new WebSocket.Server({ noServer: true })
const setupWSConnection = require('./utils.js').setupWSConnection
const loadFromMapFile = require('./server-utils/loadMapFromFile.js')

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

//Sets up the server
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})
//Sets up connection
wss.on('connection', setupWSConnection);

//Gets the map data
const MAP_URL = __dirname + "/public/maps/Ortia 2021-03-01-13-14.map";
const mapData = loadFromMapFile(MAP_URL).then(() => console.log("Loaded map!"));

wss.on( "client-request-initial-state", () => {
  if (!mapData) { //MAPDATA NOT LOADED
    console.log("Mapdata not yet loaded");
  } else {
    //MAPDATA IS LOADED
    console.log("Mapdata is loaded");
  }''
} )

server.on('upgrade', (request, socket, head) => {
  // You may check auth of request here..
  /**
   * @param {any} ws
   */
  const handleAuth = ws => {
    wss.emit('connection', ws, request)
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

server.listen({ host, port })

console.log(`running at '${host}' on port ${port}`)
