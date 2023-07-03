import Helper from "./Helper.js";
import fs from "fs";

(function () {
	const helper = new Helper();

	// create dev directory
	helper.mkdir("./dev", err => {
		if (err) {
			console.log(err);

			return;
		}

		console.log("> success: dev directory created!");
	});

	// make index.html
	helper.mkfile("./dev/index.html", err => {
		if (err) {
			console.log(err);

			return;
		}

		console.log("> success: index.html written!");
	});

	const index = `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title></title>

		<script src="./mixer.min.js" defer></script>
		<script src="./js/main.js" type="module" defer></script>

		<style>
			body {
				background-color: #333;
			}

			.items {
				/*width: 700px;*/
				width: min(300px, 100% - 10px);
				height: 300px;
				background-color: #ccc;
				/*margin-left: 180px;*/
				margin: 0 auto;
				margin-top: 120px;
			}

			.items__item {
				background-color: blue;
				width: 120px;
				height: 120px;
				position: relative;
				border-radius: 3px;
			}

			.items__item img {
				width: 100%;
				height: 100%;
				position: absolute;
				z-index: 1;
			}

			.items__item-remove {
				background-color: rgba(0, 0, 0, .5);
				cursor: pointer;
				color: #fff;
				width: 40px;
				height: 40px;
				border-radius: 100px;
				position: absolute;
				top: 5px;
				right: 5px;
				border: unset;
				z-index: 2;
			}
		</style>
	</head>
	<body>
		<section class="items" data-component="mixer-sorting">

			<article class="items__item">
				<button class="items__item-remove" data-upload-tile="remove">X</button>

				<img src="https://picsum.photos/200">
			</article>

			<article class="items__item">
				<button class="items__item-remove" data-upload-tile="remove">X</button>

				<img src="https://picsum.photos/250">
			</article>

			<article class="items__item">
				<button class="items__item-remove" data-upload-tile="remove">X</button>

				<img src="https://picsum.photos/300">
			</article>

			<article class="items__item">
				<button class="items__item-remove" data-upload-tile="remove">X</button>

				<img src="https://picsum.photos/320">
			</article>

		</section>

		<button data-mixer="get-nodes">Get</button>

		<button data-mixer="add-node">Add</button>
	</body>
	</html>
	`;

	// write to index.html
	fs.writeFile("./dev/index.html", index, err => {
		if (err) {
			console.log(err);

			return;
		}

		console.log("> success: written to index.html!");
	});

	/**
	* create JS
	*/
	const js = `
		(function () {
			const mixerOne = new Mixer(\`[data-component="mixer-sorting"]\`, {
					containerBoundaries : true,
					containerContext : false,
					elastic : true,
					//direction : "vertical",
					direction : "horizontal",
					interactive : [
						\`[data-upload-tile="remove"]\`
					],
					gap : 15,
					padding : 15
					//horizontalAlignment : "flex-start",
				}),
				addItemTrigger = document.querySelector(\`[data-mixer="add-node"]\`);

			mixerOne.ready(function (e) {
				addItemTrigger.addEventListener("click", () => {
					const addItem = document.createElement("article");

					addItem.classList.add("items__item");
					addItem.innerHTML = \`
						<button class="items__item-remove" data-upload-tile="remove">X</button>
						<img src="https://picsum.photos/350">
					\`;

					this.add(addItem);
					this.refresh();
				});

				document.querySelector(\`[data-mixer="get-nodes"]\`).addEventListener("click", () => {
					//console.log(this.get());
				});
			});
		})();
	`;

	// make dev/js directory
	helper.mkdir("./dev/js", err => {
		if (err) {
			console.log(err);

			return;
		}

		console.log("> success: dev directory created!");
	});

	// make main.js
	helper.mkfile("./dev/js/main.js", err => {
		if (err) {
			console.log(err);

			return;
		}

		console.log("> success: main.js written!");
	});

	// write to main.js
	fs.writeFile("./dev/js/main.js", js, err => {
		if (err) {
			console.log(err);

			return;
		}

		console.log("> success: written to main.js!");
	});
})();
