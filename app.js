require("dotenv").config();
const path = require("path");
//set up express
const express = require("express");
const app = express();
//set up http server
const http = require("http");
const server = http.createServer(app);
//initialize socket.io
const io = require("socket.io")(server, { cors: { origin: "*" } });

const PORT = process.env.PORT;

let gameMaster = null;
let players = [];
let gameSession = false;

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	res.setHeader("Content-Type", "text/html");
	res.render("index");
});

app.get("/game", (req, res) => {
	res.setHeader("Content-Type", "text/html");
	res.render("game");
});

//start server
server.listen(PORT, () => {
	console.log(`server is listening on ${PORT}`);
});

//socket logic
io.on("connection", (socket) => {
	console.log("Someone connected!");

	socket.on("name", (data) => {
		console.log(data);
		if (!gameMaster) {
			gameMaster = {
				name: data,
				role: "game master",
				id: socket.id,
			};
			socket.emit("role", { gameMaster, players: players });
		} else {
			const player = {
				name: data,
				role: "player",
				tries: 3,
				id: socket.id,
			};
			players.push(player);
			socket.emit("role", players);
			socket.broadcast.emit("role", { gameMaster, players: players });
			socket.broadcast.emit("role", players);
		}
	});

	socket.on("disconnect", () => {
		if (gameMaster?.id === socket.id) {
			if (players.length > 0) {
				const newGm = players.splice(0, 1)[0];
				gameMaster = {
					name: newGm.name,
					role: "game master",
					id: newGm.id,
				};
				console.log(players, gameMaster);
			} else {
				gameMaster = null;
			}
		} else {
			players = [...players.filter((player) => player.id !== socket.id)];
		}
		socket.broadcast.emit("role", { gameMaster, players: players });
		socket.broadcast.emit("role", players);
	});

	socket.on("start", () => {
		if (players.length < 3 || !gameMaster) {
			socket.emit(
				"error",
				"There must be at least 3 players and a game master"
			);
		}
	});
});
