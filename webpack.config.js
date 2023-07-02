import path from "path";

export default {
	entry : "./main.js",
	mode : "production",
	output : {
		path : path.resolve("./", "build"),
		filename : "mixer.min.js"
	},

	// dev server
	devServer : {
		static : [
			{ directory : "./dev" },
			{ directory : "./build" }
		],
		port : 3000,
		liveReload : true,
		open : [ "http://localhost:3000" ]
	}
}
