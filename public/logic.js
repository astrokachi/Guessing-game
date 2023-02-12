let socket;
const btn1 = document.querySelector("#btn1");

btn1.addEventListener("click", function () {
	const inputName = document.querySelector("#name").value;
	if (inputName) {
		socket = io("http://localhost:3000");
		socket.emit("name", inputName);
	}
});

socket.on('admin', () => {
	
})
