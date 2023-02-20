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
	socket.emit("isSet", gameMaster === null ? false : true);


	socket.on("name", (data) => {
		if (!gameMaster) {
			gameMaster = {
				name: data,
				role: "game master",
				id: socket.id,
				points: 0,
			};
			socket.broadcast.emit("isSet", gameMaster === null ? false : true);
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
			gameSession = false;
			if (players.length > 0) {
				const newGm = players.splice(0, 1)[0];
				gameMaster = {
					name: newGm.name,
					role: "game master",
					id: newGm.id,
					points: newGm.points,
					tries: 3,
				};
			
			} else {
				gameMaster = null;
			}
		} else if (gameMaster && gameMaster.id !== socket.id) {
			players = [...players.filter((player) => player.id !== socket.id)];
		}

		updateAll(socket);
	});

	socket.on("create", () => {
		if (players.length < 3 || !gameMaster) {
			socket.emit("error", "There must be at least 3 players");
		} else {
			socket.emit("createQuestion");
			socket.broadcast.emit("join");
		}
	});

	socket.on("start", (data) => {
		gameSession = true;
		question = data.question;
		answer = data.answer;
		socket.broadcast.emit("Enter", { question: question, answer: answer });
	});

	socket.on("time up", () => {
		let newGm = players[0];
		newGm.role = "game master";
		newGm.tries = 3;
		gameMaster.role = "player";
		players[0] = gameMaster;
		gameMaster = newGm;
		socket.broadcast.emit("end", answer);
		socket.emit("end", answer);
		players.forEach((player) => (player.tries = 3));
		updateAll(socket);

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
	});
}

function updateAll(socket) {
	socket.broadcast.emit("role", {
		gameMaster,
		players: players,
		waiting: waiting,
	});
	update(socket);
}

//Update all -> emit + broadcast emit
//update all but current -> broadcast emit
//update one -> emit
