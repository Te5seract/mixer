import Helper from "./Helper.js";

(function () {
	const helper = new Helper();

	helper.mkdir("./dev", err => {
		if (err) {
			console.log(err);

			return;
		}

		console.log("> success: dev directory created!");
	});
})();
