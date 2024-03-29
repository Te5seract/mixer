import MixerEvents from "./MixerEvents.js";
import MixerStyles from "./MixerStyles.js";
import MixerHelper from "./MixerHelper.js";

export default class Mixer {
    constructor (elem, options) {
        this.selector = elem.match(/data-.*('|`|")/igm) ? elem.replace(/(^data-.*('|`|"))/igm, "[$1]") : elem;
        this.elem = elem instanceof HTMLElement ? elem : document.querySelector(this.selector);

		// options
		this.interactive = options.interactive;
		this.context = options.containerContext !== undefined ? options.containerContext : true;
		this.boundaries = options.containerBoundaries !== undefined ? options.containerBoundaries : false;
		this.elastic = options.elastic !== undefined ? options.elastic : true;
		this.effects = options.effects;
		this.direction = options.direction ? options.direction : "horizontal";

		// styling
		this.gap = options.gap ? options.gap : 15;
		this.horizontalAlignment = options.horizontalAlignment ? options.horizontalAlignment : "flex-start";
		this.padding = options.padding ? options.padding : 15;

		// dynamic
		this.items = {};

		// run the library
        this._setup();
    }

	/**
	* sets up the library and initialises helper libraries
	*
	* @return {void}
	*/
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

	/**
	* discovers the library initialisation node and lays
	* out the foundation properties for the library to work with
	* @return {void}
	*/
	_discover () {
		const children = [ ...this.elem.children ],
			scout = document.createElement("div");

		scout.setAttribute("data-mixr-role", "scout");
		document.body.insertBefore(scout, document.body.firstElementChild);

		this.elem.classList.add("_mixer");

		children.forEach((child, i) => {
            child.style.cssText = `transform: translate(0, 0); z-index: 1;`;
			child.classList.add("_mixer__item");
			child.setAttribute("data-mixer-movable", "true");
			child.setAttribute("data-node-ref", i);

			this.items[i] = {
                x : 0,
                y : 0,
				movedAmountX : 0,
				movedAmountY : 0,
                yOrigin :  child.getBoundingClientRect().top - this.elem.getBoundingClientRect().top,
				xOrigin : child.getBoundingClientRect().left - ( child.clientWidth + scout.offsetLeft ),
				scoutTop : scout.offsetTop,
				scoutLeft : scout.offsetLeft,
				marginLeft : this.elem.getBoundingClientRect().left - scout.offsetLeft,
				marginTop : this.elem.getBoundingClientRect().top,
				containerWidth : this.elem.clientWidth,
				containerHeight : this.elem.clientHeight,
				node : child,
				height : child.clientHeight,
				width : child.clientWidth,
				top : child.getBoundingClientRect().top,
				left : child.getBoundingClientRect().left,
				right : child.getBoundingClientRect().left + child.clientWidth,
				center : ( child.getBoundingClientRect().left + ( child.getBoundingClientRect().left + child.clientWidth )) * .5,
				ref : i
			};
		});

		scout.remove();
	}

	_styles () {
		const style = new MixerStyles(this);

		// container styles
		style.addRule("._mixer", {
			"display" : "flex",
			"gap" : `${ this.gap }px`,
            "align-items" : "center",
			"user-select" : "none",
			"position" : "relative",
			"justify-content" : this.horizontalAlignment,
			"box-sizing" : "border-box",
			"padding" : `${ this.padding }px`
		});

		// child styles
		style.addRule(`._mixer__item *${ this.interactive && this.interactive.length ? `:not(${ this.interactive.join(",") })` : ""}`, {
			"pointer-events" : "none"
		});

		style.addRule("._mixer__item", {
			"cursor" : "grab"
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

	get () {
		const itemList = Object.values(this.events.items);

		const sortedItems = itemList.sort((first, last) => {
			return first.xOrigin - last.xOrigin;
		});

		return sortedItems;
	}
}
