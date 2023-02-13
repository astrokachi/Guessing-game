function convertStrings(str) {
	str = str.split(" ");
	return str;
}

function createBtn(btnName, className, btn) {
	btn.id = btnName;
	btn.innerHTML = `${btnName} game`;
	btn.classList.add(...className);
	actionBtncon.inner = "";
	actionBtncon.appendChild(btn);
}

function updateInfo(user, users) {
	playerType.innerHTML = `You are a ${user.role}, ${user.name}`;
	changeNo.innerHTML = `players: ${users.length}`;
}

function createGameEl(newEl, question) {
	newEl.innerHTML = `
						<div
						id="gameView"
							class="flex flex-col items-center justify-center gap-4 w-full h-80"
						>
							<div class="text-4xl mb-8">${question}</div>
							<div class="w-72 flex justify-between">
								<label for="answer">Answer</label>
								<input
									id="ans"
									type="text"
									name="answer"
									placeholder="Enter a answer"
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

export {
	convertStrings,
	createBtn,
	updateInfo,
	createGameEl,
	gameMasterViewEl,
};
