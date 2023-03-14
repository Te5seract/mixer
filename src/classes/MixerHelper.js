export default class MixerHelper {
	constructor () {
		this.hooks = {};
	}

	setHook (name, value) {
		this.hooks[name] = value;
	}

	getHook (name) {
		if (this.hooks[name]) return this.hooks[name];

		return;
	}
}
