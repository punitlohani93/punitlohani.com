const express = require('express')
const http = require('http')

const server = http.createServer()
const app = express()

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
})

server.on('request', app)
server.listen(3000, () => {
    console.log('WS Server started on port 3000')
})

/** Begin WebSocket server */
const WebSocketServer = require('ws').Server

const wss = new WebSocketServer({ server: server })

wss.on('connection', (wsconnection) => {
    const numOfConnectedClients = wss.clients.size
    console.log('Clients connected: ', numOfConnectedClients)

    wss.broadcast(`Current visitors: ${numOfConnectedClients}`)

    if (wsconnection.readyState === wsconnection.OPEN) {
        wsconnection.send('Welcome to my WS server')
    }

    wsconnection.on('close', function close() {
        wss.broadcast(`Client disconnected; Current visitors ${numOfConnectedClients}`)
        console.log('A client has disconnected')
    })
})

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data)
    })
}