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
let show = true;

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
	socket.emit("isSet", gameMaster?.id);

	socket.on("name", (data) => {
		console.log(data);
		if (!gameMaster) {
			gameMaster = {
				name: data,
				role: "game master",
				id: socket.id,
				points: 0,
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
		if (gameMaster && gameMaster.id === socket.id) {
			show = true;
			gameSession = false;
			if (players.length > 0) {
				const newGm = players.splice(0, 1)[0];
				gameMaster = {
					name: newGm.name,
					role: "game master",
					id: newGm.id,
					points: newGm.points,
				};
				console.log(gameMaster);
			} else {
				gameMaster = null;
			}
		} else if (gameMaster && gameMaster.id !== socket.id) {
			players = [...players.filter((player) => player.id !== socket.id)];
		}

		updateAll(socket);
	});

	socket.on("create", () => {
		if (players.length < 1 || !gameMaster) {
			socket.emit("error", "There must be at least 3 players");
		} else {
			socket.emit("createQuestion");
			socket.broadcast.emit("join");
			show = false;
		}
	});

	socket.on("start", (data) => {
		gameSession = true;
		question = data.question;
		answer = data.answer;
		socket.broadcast.emit("Enter", { question: question, answer: answer });
		setTimeout(() => {
			socket.emit("end");
		}, 1000);
	});

	socket.on("correct", () => {
		gameSession = false;
		players = [...players, ...waiting];
		waiting = [];
		//get and update winner
		let winner = players.filter((player) => player.id === socket.id)[0];
		winner ? (winner.points += 10) : null;
		winner ? (winner.role = "game master") : null;

		gameMaster.role = "player";
		//update other players
		players.forEach((player) => (player.tries = 3));
		players = players.filter((player) => player.id !== socket.id);
		players.push(gameMaster);

		//set winner to game master
		gameMaster = winner;
		socket.broadcast.emit("winner", winner);
		socket.emit("winner", winner);

		updateAll(socket);
	});

	socket.on("wrong", () => {
		//update tries
		players.forEach((player) => {
			if (player.id == socket.id) {
				player.tries--;
				console.log(player);
				update(socket);
			}
		});
	});
});

function update(socket) {
	socket.emit("role", {
		gameMaster,
		players: players,
		waiting: waiting,
		show: show,
	});
}

function updateAll(socket) {
	socket.broadcast.emit("role", {
		gameMaster,
		players: players,
		waiting: waiting,
		show: show,
	});
	update(socket);
}

//Update all -> emit + broadcast emit
//update all but current -> broadcast emit
//update one -> emit
