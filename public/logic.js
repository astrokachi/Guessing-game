let socket;
const btn1 = document.querySelector("#btn1");
const stage1 = document.querySelector("#stage1");
const stage2 = document.querySelector("#stage2");
const btn2 = document.querySelector("#btn2");

btn1.addEventListener("click", function () {
	const inputName = document.querySelector("#name").value;
	if (inputName) {
		socket = io("http://localhost:3000");
		socket.emit("name", inputName);
		stage1.classList.add("hidden");

		socket.on("role", (users) => {
			console.log(socket.id);
			console.log(users);
			const user = users.filter((user) => user.id === socket.id)[0];
			console.log(user);
			// update users
			playerType.innerHTML = `You are a ${user.role}`;
			changeNo.innerHTML = `players: ${users.length}`;
		});
	}
});
