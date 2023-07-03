import fs from "fs";

export default class Helper {
	mkdir (path, callback) {
		if (!fs.existsSync(path))  {
			fs.mkdir(path, { recursive : true }, callback);
		}
	}

	mkfile (path, callback) {
		fs.open(path, "as+", 0o666, callback);

		return this;
	}
}
