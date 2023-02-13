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

export { convertStrings, createBtn, updateInfo };
