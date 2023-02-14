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
let waiting = [];
let question = null;
let answer = null;


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
		} else {
			const player = {
				name: data,
				role: "player",
				tries: 3,
				id: socket.id,
				points: 0,
			};

			switch (gameSession) {
				case true:
					waiting.push(player);
					break;
				case false:
					players = [...players, ...waiting];
					players.push(player);
				default:
					break;
			}
		}

		updateAll(socket);
	});

	socket.on("disconnect", () => {
		if (gameMaster?.id === socket.id) {
			gameSession = false;
			if (players.length > 0) {
				const newGm = players.splice(0, 1)[0];
				gameMaster = {
					name: newGm.name,
					role: "game master",
					id: newGm.id,
				};
			} else {
				gameMaster = null;
			}
		} else {
			players = [...players.filter((player) => player.id !== socket.id)];
		}

		updateAll(socket);
	});

	socket.on("create", () => {
		if (players.length < 1 || !gameMaster) {
			socket.emit(
				"error",
				"There must be at least 3 players and a game master"
			);
		} else {
			socket.emit("createQuestion");
		}
	});

	socket.on("start", (data) => {
		gameSession = true;
		question = data.question;
		answer = data.answer;
		socket.broadcast.emit("Enter", { question: question, answer: answer });
		setTimeout(() => {
			socket.emit("end")
		}, 10000);
	});

	socket.on("correct", () => {
		gameSession = false;
		let index;
		let winner = players.filter((player, i) => {
			index = i;
			return player.id === socket.id;
		})[0];
		winner ? (winner.points = 10) : null;
		players = [...players.splice(index, 1), winner];
		players.forEach((player) => (player.tries = 3));
		socket.broadcast.emit("winner", winner);
	});

	socket.on("wrong", () => {
		let index;
		//update tries
		const player = players.filter((player, i) => {
			index = i;
			return player.id === socket.id;
		})[0];
		if (player.tries > 0) {
			players[index].tries = players[index].tries - 1;
		}
		console.log(player);

		update(socket);
	});
});

function update(socket) {
	socket.emit("role", { gameMaster, players: players });
}

function updateAll(socket) {
	socket.broadcast.emit("role", { gameMaster, players: players });
	update(socket);
}
