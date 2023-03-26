export default class Orchestrate {
	constructor () {
		this.scopes = this.connect_();

		this._compose();
	}

	_compose () {
		const composed = {};

		this.scopes.forEach(scope => {
			const scopeName = scope.prototype.constructor.name,
				scopedProps = {};

			Object.getOwnPropertyNames(scope.prototype).forEach(prop => {
				if (!prop.match(/constructor/)) {
					scopedProps[prop] = prop.match(/^\$/) ? scope.prototype[prop]() : scope.prototype[prop];
				}
			});

			composed[scopeName] = scopedProps;
		});

		console.log(composed);
	}
}
