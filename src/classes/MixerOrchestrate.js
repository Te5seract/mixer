import Orchestrate from "./alpha/Orchestrate.js";

import MixerCore from "./MixerCore.js";
import MixerEvents from "./MixerEvents.js";
import MixerStyles from "./MixerStyles.js";
import MixerHelper from "./MixerHelper.js";

export default class Mixer extends Orchestrate {
	constructor (elem, options) {
		super();

		this.elem = elem;
		this.options = options;
	}

	connect_ () {
		return [
			MixerCore,
			MixerEvents,
			MixerStyles,
			MixerHelper
		];
	}
}
