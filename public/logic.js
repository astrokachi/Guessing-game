import {
	convertStrings,
	createBtn,
	updateInfo,
	createGameEl,
} from "./utils.js";
let socket;
const btn1 = document.querySelector("#btn1");
const btn3 = document.querySelector("#btn3");
const stage1 = document.querySelector("#stage1");
const stage2 = document.querySelector("#stage2");
const stage3 = document.querySelector("#stage3");
const actionBtncon = document.querySelector("#actionBtncon");
const container = document.querySelector(".container");
let newBtn = document.createElement("button");
let newEl = document.createElement("div");
let createBtnEl;

const btnClass = convertStrings(
	"middle none center block mx-auto rounded-lg bg-purple-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
);

const elClass = convertStrings("text-red-600 font-sm");

btn1.addEventListener("click", function () {
	const inputName = document.querySelector("#name").value;
	if (inputName) {
		socket = io("http://localhost:3000");
		socket.emit("name", inputName);
		//update view
		stage1.classList.add("hidden");
		stage2.classList.remove("hidden");

		socket.on("role", (users) => {
			if (!users.gameMaster) {
				//get user
				const user = users.filter((user) => user.id === socket.id)[0];
				// display info
				playerType.innerHTML = `You are a ${user.role}, ${user.name}`;
				changeNo.innerHTML = `players: ${users.length}`;
				//disply join button
				createBtn("join", btnClass, newBtn);
				const joinBtnEl = document.querySelector("#join");
				console.log(joinBtnEl);
				socket.on("Enter", (data) => {
					const { question, answer } = data;
					joinBtnEl.addEventListener("click", function () {
						stage2.classList.add("hidden");
						//display new page with question
						newEl = createGameEl(newEl);
						container.appendChild(newEl);
					});
				});
			}

			if (users.gameMaster) {
				let gm = users.gameMaster;
				//display info
				playerType.innerHTML = `You are the ${gm.role}, ${gm.name}`;
				changeNo.innerHTML = `players: ${users.players.length}`;
				//display btn create button
				createBtn("create", btnClass, newBtn);
				createBtnEl = document.querySelector("#create");
				createBtnEl.addEventListener("click", () => {
					socket.emit("create");
				});
			}
		});
		socket.on("error", (message) => {
			//display error message
			newEl.innerHTML = message;
			newEl.classList.add(elClass);
			if (actionBtncon.childElementCount === 1) {
				actionBtncon.appendChild(newEl);
			}
		});

		socket.on("createQuestion", () => {
			//update view
			stage2.classList.add("hidden");
			stage3.classList.remove("hidden");

			btn3.addEventListener("click", () => {
				const questionEl = document.querySelector("#question");
				const answerEl = document.querySelector("#answer");
				if (questionEl.value && answerEl.value) {
					socket.emit("start", {
						question: questionEl.value,
						answer: answerEl.value,
					});
				}
			});
		});

		//end of logic
	}
});
