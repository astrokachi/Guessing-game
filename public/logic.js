let socket;
const btn1 = document.querySelector("#btn1");
const stage1 = document.querySelector("#stage1");
const stage2 = document.querySelector("#stage2");
const btn2 = document.querySelector("#btn2");
const actionBtncon = document.querySelector("#actionBtncon");
let newBtn = document.createElement("button");
import { convertStrings } from "./utils.js";

// let newEl = document.createElement("div");

const btnClass = convertStrings(
	"middle none center block mx-auto rounded-lg bg-purple-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
);

btn1.addEventListener("click", function () {
	const inputName = document.querySelector("#name").value;
	if (inputName) {
		socket = io("http://localhost:3000");
		socket.emit("name", inputName);
		stage1.classList.add("hidden");
		stage2.classList.remove("hidden");

		socket.on("role", (users) => {
			const user = users.filter((user) => user.id === socket.id)[0];
			console.log(user);
			// update users
			playerType.innerHTML = `You are a ${user.role}`;
			changeNo.innerHTML = `players: ${users.length}`;

			//display btn create or join depending on role of user

			if (user.role === "game master" && actionBtncon.childElementCount === 0) {
				newBtn.id = "Create";
				newBtn.innerHTML = "Create game";
				newBtn.classList.add(...btnClass);
				actionBtncon.appendChild(newBtn);
			}
		});
	}
});
