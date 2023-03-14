import MixerEvents from "./MixerEvents.js";
import MixerStyles from "./MixerStyles.js";
import MixerHelper from "./MixerHelper.js";

export default class Mixer {
    constructor (elem, options) {
        this.selector = elem.match(/data-.*('|`|")/igm) ? elem.replace(/(^data-.*('|`|"))/igm, "[$1]") : elem;
        this.elem = elem instanceof HTMLElement ? elem : document.querySelector(this.selector);

		// options
		this.interactive = options.interactive;
		this.gap = options.gap ? options.gap : 15;
		this.context = options.containerContext !== undefined ? options.containerContext : true;
		this.boundaries = options.containerBoundaries !== undefined ? options.containerBoundaries : false;
		this.elastic = options.elastic !== undefined ? options.elastic : true;
		this.effects = options.effects;

		// dynamic
		this.items = {};

		// run the library
        this._setup();
    }

    _setup () {
		// style setup
		this._styles();

		// set discover content
		this._discover();

		const events = new MixerEvents(this);

		this.events = events;

		// do events
		events.start();
    }

	_discover () {
		const children = [ ...this.elem.children ];

		this.elem.classList.add("_mixer");

		children.forEach((child, i) => {
            child.style.cssText = `transform: translate(0, 0);`;
			child.classList.add("_mixer__item");
			child.setAttribute("data-mixer-movable", "true");
			child.setAttribute("data-node-ref", i);

			this.items[i] = {
                x : 0,
                y : 0,
                yOrigin :  child.getBoundingClientRect().top - this.elem.getBoundingClientRect().top,
                xOrigin : child.getBoundingClientRect().left,
                DOMMargin : children[0].getBoundingClientRect().left,
				node : child
			};
		});
	}

	_styles () {
		const style = new MixerStyles(this);

		// container styles
		style.addRule("._mixer", {
			"display" : "flex",
			"gap" : `${ this.gap }px`,
            "align-items" : "center"
		});

		// child styles
		style.addRule(`._mixer__item *${ this.interactive.length ? `:not(${ this.interactive.join(",") })` : ""}`, {
			"pointer-events" : "none"
		});

		style.addRule(this.selector, {
			"gap" : `${ this.gap }px`
		});
	}

	ready (callback) {
		this.callback = callback;
		this.callback ? this.callback() : null;
	}

	move (callback) {
		this.events.move(callback);
	}
}
