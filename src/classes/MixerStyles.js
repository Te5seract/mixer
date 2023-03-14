export default class MixerStyles {
	constructor (mixer) {
		const sheet = document.createElement("style");

		// extending core mixer class
		this.selector = mixer.selector;
		this.elem = mixer.elem;

		// static
		this.sheet = sheet;
		this.rules = {};

		document.head.append(sheet);
	}

	addRule (selector, rules) {
		if (this.rules[selector]) {
			const existing = Object.keys(this.rules[selector]);

			existing.forEach(rule => {
				if (this.rules[selector][rule]) {
					this.rules[selector][rule] = rules[rule];
				}
			});

			this._write();

			return;
		}

		this.rules[selector] = rules;

		this._write();

		//this.rules[selector] += rules;
	}

	_write () {
		let rules = "";

		Object.keys(this.rules).forEach(selector => {
			let selectorRules = "";
			rules += selector;

			Object.keys(this.rules[selector]).forEach(rule => {
				selectorRules += `${ rule }: ${ this.rules[selector][rule] };`;
			});

			selectorRules = `{${ selectorRules }}`;

			rules += selectorRules;
		});

		this.sheet.innerHTML = rules;
	}
}
