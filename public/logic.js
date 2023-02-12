import { convertStrings } from "./utils.js";
let socket;
const btn1 = document.querySelector("#btn1");
const stage1 = document.querySelector("#stage1");
const stage2 = document.querySelector("#stage2");
const actionBtncon = document.querySelector("#actionBtncon");
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
		stage1.classList.add("hidden");
		stage2.classList.remove("hidden");

		socket.on("role", (users) => {
			if (!users.gameMaster) {
				//get user
				const user = users.filter((user) => user.id === socket.id)[0];
				console.log(user);
				// display info
				playerType.innerHTML = `You are a ${user.role}, ${user.name}`;
				changeNo.innerHTML = `players: ${users.length}`;
				//disply join button
				createBtn("join");
			}

			if (users.gameMaster) {
				let gm = users.gameMaster;
				//display info
				playerType.innerHTML = `You are the ${gm.role}, ${gm.name}`;
				changeNo.innerHTML = `players: ${users.players.length}`;
				//display btn create button
				createBtn("create");
				createBtnEl = document.querySelector("#create");
				createBtnEl.addEventListener("click", () => {
					socket.emit("start");
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
	}
});

function createBtn(name) {
	newBtn.id = name;
	newBtn.innerHTML = `${name} game`;
	newBtn.classList.add(...btnClass);
	actionBtncon.inner = "";
	actionBtncon.appendChild(newBtn);
}
