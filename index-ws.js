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

process.on('SIGINT', () => { // Ctrl + C
    // wss needs to be closed, web socket connection needs to be closed, because if not, the sigint never works
    wss.clients.forEach(function each(client) {
        client.close() // when we call sigint we will close all of our web sockets connection and then close the server
    })
    server.close(() => {
        shutdownDB()
    })
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

    db.run(`INSERT INTO visitors (count, time)
        VALUES (${numOfConnectedClients}, datetime('now'))
    `)

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

/** end websockets */

/** begin database */
const sqlite = require('sqlite3')
const db = new sqlite.Database(':memory:')

db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `)
})

function getCounts() {
    db.each('SELECT * FROM visitors', (err, row) => {
        console.log(row)
    })
}

function shutdownDB() {
    getCounts()
    console.log('Shutting down DB')
    db.close()
}