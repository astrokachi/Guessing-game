require("dotenv").config();
const path = require('path')
//set up express
const express = require("express");
const app = express();
//set up http server
const http = require("http");
const server = http.createServer(app);
//initialize socket.io
const io = require("socket.io")(server, { cors: { origin: "*" } });

const players = []

const PORT = process.env.PORT;

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, 'public')))

app.get("/", (req, res) => {
	res.render("index");
});


//start server
server.listen(PORT, () => {
	console.log(`server is listening on ${PORT}`);
});

//socket logic
io.on("connection", (socket) => {
	console.log("Someone connected!");

    socket.on("name", (data) => {
        console.log(data)
        if(players.length === 0){
            const player = {
                name: data,
                role: admin,

            }
        }else {
            const player = {
                name: data,
                role: player
            }
        }
    })
});
