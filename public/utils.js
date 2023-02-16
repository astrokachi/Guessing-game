function convertStrings(str) {
	str = str.split(" ");
	return str;
}

function createGameEl(newEl, question) {
	newEl.innerHTML = `
						<div
						id="gameView"
							class="flex flex-col items-center justify-center gap-4 w-full h-80"
						>
							<div class="text-4xl mb-8">${question}</div>
							<div class="w-72 flex justify-between items-center">
								<label for="answer">Answer</label>
								<input
									id="ans"
									type="text"
									name="answer"
									placeholder="Enter an answer"
									class="outline-none border border-blue-600 text-black rounded-md p-2"
								/>
							</div>
							<button
								id="btn4"
								class="middle none center block mx-auto rounded-lg bg-purple-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
								data-ripple-light="true"
							>
								Submit
							</button>
							<div id="tries" class="text-sm mb-4"></div>
						</div>
					`;

	return newEl;
}

function gameMasterViewEl(newEl, question, answer) {
	newEl.innerHTML = `
						<div
						id="gmGameView"
							class="flex flex-col items-center justify-center gap-4 w-full h-80"
						>
							<div class="text-4xl mb-4">Q: ${question}</div>
							<div class="text-2xl mb-2">A: ${answer}</div>
							
						</div>
					`;

	return newEl;
}

function winnerViewEl(newEl) {
	newEl.innerHTML = `
						<div
						id="winnerView"
							class="flex flex-col items-center justify-center gap-4 w-full h-80"
						>
							<div class="text-2xl mb-4">You have won!!! 🎉🎉🎇</div>	
							<div class="text-xl mb-4">You are the new game master</div>
							<button id="create" class="middle none center block mx-auto rounded-lg bg-purple-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" >Create session</button>	
						</div>
					`;

	return newEl;
}

function gameWonEl(newEl, winner) {
	newEl.innerHTML = `
						<div
						id="gameWon"
							class="flex flex-col items-center justify-center gap-4 w-full h-80"
						>
							<div class="text-2xl mb-4">${winner.name} has won this round.</div>	
						</div>
					`;

	return newEl;
}

function displayPoints(players, gm) {
	document.querySelector("aside").innerHTML =
		"<div class='text-lg h hidden'>POINTS</div>";
	document.querySelector(".h").classList.remove("hidden");
	let newEl = document.createElement("div");
	players.forEach((player) => {
		newEl.innerHTML += `<ol>${player.name}: ${player.points}</ol>`;
	});
	newEl.innerHTML += `<ol>${gm.name}: ${gm.points}</ol>`;
	document.querySelector("aside").appendChild(newEl);
}

export {
	convertStrings,
	createGameEl,
	gameMasterViewEl,
	winnerViewEl,
	gameWonEl,
	displayPoints,
};
