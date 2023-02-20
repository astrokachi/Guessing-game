import {
	convertStrings,
	createGameEl,
	gameMasterViewEl,
	winnerViewEl,
	gameWonEl,
	displayPoints,
	gameEnd,
} from "./utils.js";
let socket;
const btn1 = document.querySelector("#btn1");
const btn3 = document.querySelector("#btn3");
const stage1 = document.querySelector("#stage1");
const stage2 = document.querySelector("#stage2");
const stage3 = document.querySelector("#stage3");
const container = document.querySelector(".container");
let newBtn = document.createElement("button");
let newEl = document.createElement("div");
let winnerView = document.querySelector("#winnerView");
let createBtnEl;
let run = false;
let time = 0;

const btnClass = convertStrings(
	"middle none center block mx-auto rounded-lg bg-purple-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
);

const elClass = convertStrings("text-red-600 font-sm");

socket = io("http://localhost:3000");

socket.on("isSet", (isSet) => {
	if (isSet) {
		btn1.innerHTML = "join game";
	} else {
		btn1.innerHTML = "create game";
	}
});

btn1.addEventListener("click", function () {
	const inputName = document.querySelector("#name").value;
	if (inputName) {
		socket.emit("name", inputName);
		//update view
		stage1.classList.add("hidden");
		stage2.classList.remove("hidden");

		socket.on("role", (users) => {
			displayPoints(users.players, users.gameMaster);
			//All player logic
			if (users.waiting.length > 0) {
				const user = users.waiting.filter((user) => user.id === socket.id)[0];
				// display info
				playerType.innerHTML = `You are a ${user.role}, ${user.name}`;
				stage2.innerHTML = "please wait for the next session to start";
			} else if (users.gameMaster.id !== socket.id) {
				//get user
				const user = users.players.filter((user) => user.id === socket.id)[0];
				// display info
				playerType.innerHTML = `You are a ${user.role}, ${user.name}`;
				changeNo.innerHTML = `players: ${users.players.length}`;

				stage2.innerHTML = "Please wait for the game master to set a question.";

				//disply join button
				socket.on("Enter", (data) => {
					const { question, answer } = data;
					stage2.classList.add("hidden");
					//display new page with question
					newEl = createGameEl(newEl, question);
					container.appendChild(newEl);
					//
					const btn4 = document.querySelector("#btn4");
					btn4.addEventListener("click", () => {
						const ans = document.querySelector("#ans").value;
						if (ans === answer) {
							//handle correct logic
							socket.emit("correct");
						} else {
							//handle wrong logic
							socket.emit("wrong");
						}
					});
				});
				//update tries display
				const triesEl = document.querySelector("#tries");
				if (triesEl) {
					triesEl.innerHTML = `You have ${user.tries} tries left!`;
				}

				if (user.tries <= 0) {
					const ans = document.querySelector("#ans");
					ans.disabled = true;
					triesEl.innerHTML = `You have ${0} tries left!`;
				}
			}

			//Game master logic
			else if (users.gameMaster.id === socket.id) {
				let gm = users.gameMaster;
				//display info
				playerType.innerHTML = `You are the ${gm.role}, ${gm.name}`;
				changeNo.innerHTML = `players: ${users.players.length}`;
				stage2.classList.remove("hidden");
				stage2.classList.add("flex", "flex-col");
				//display btn create button
				newBtn.id = "create";
				newBtn.innerHTML = `create question`;
				newBtn.classList.add(...btnClass);
				stage2.innerHTML = "";
				stage2.appendChild(newBtn);
				//
				createBtnEl = document.querySelector("#create");
				createBtnEl.addEventListener("click", () => {
					socket.emit("create");
					winnerView ? (winnerView.innerHTML = "") : null;
				});
			}

			socket.on("createQuestion", () => {
				//update view
				stage2.classList.add("hidden");
				stage3.classList.remove("hidden");

				btn3.addEventListener("click", () => {
					const questionEl = document.querySelector("#question");
					const answerEl = document.querySelector("#answer");
					if (questionEl.value && answerEl.value) {
						run = true;
						socket.emit("start", {
							question: questionEl.value,
							answer: answerEl.value,
						});
						//update game masters game page view
						stage3.classList.add("hidden");
						newEl = gameMasterViewEl(newEl, questionEl.value, answerEl.value);
						container.appendChild(newEl);
					}
				});
			});

			socket.on("end", (answer) => {
				newEl = gameEnd(newEl, answer);
				container.appendChild(newEl);
				socket.emit("restart");
			});

			socket.on("winner", (winner) => {
				time = 0;
				run = false;
				displayPoints(users.players, users.gameMaster);
				if (winner.id === socket.id) {
					newEl = winnerViewEl(newEl);
					container.appendChild(newEl);
					createBtnEl = document.querySelector("#create");
					createBtnEl.addEventListener("click", () => {
						document.getElementById("winnerView").innerHTML = "";
						socket.emit("create");
					});
				} else {
					newEl = gameWonEl(newEl, winner);
					container.appendChild(newEl);
				}
			});
		});

		//end of role

		socket.on("error", (message) => {
			//display error message
			newEl.innerHTML = message;
			newEl.classList.add(elClass);
			if (stage2.childElementCount === 1) {
				stage2.appendChild(newEl);
			}
		});

		//end of logic
	}
});

setInterval(() => {
	if (run) {
		const timer = setTimeout(() => {
			time++;
			if (time == 10) {
				run = false;
				socket.emit("time up");
				clearTimeout(timer);
				time = 0;
			}
		}, 1000);
	}
}, 1000);
