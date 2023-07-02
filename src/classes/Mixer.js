import MixerEvents from "./MixerEvents.js";
import MixerStyles from "./MixerStyles.js";
import MixerHelper from "./MixerHelper.js";

export default class Mixer {
    constructor (elem, options) {
        this.selector = elem.match(/data-.*('|`|")/igm) ? elem.replace(/(^data-.*('|`|"))/igm, "[$1]") : elem;
        this.elem = elem instanceof HTMLElement ? elem : document.querySelector(this.selector);
		this.options = options;

		// options
		this.interactive = options.interactive;
		this.context = options.containerContext !== undefined ? options.containerContext : true;
		this.boundaries = options.containerBoundaries !== undefined ? options.containerBoundaries : false;
		this.elastic = options.elastic !== undefined ? options.elastic : true;
		this.effects = options.effects;
		this.direction = !options.direction || options.direction.match(/horizontal/i) ? "row" : options.direction;
		this.direction = !options.direction || options.direction.match(/vertical/i) ? "column" : options.direction;

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

		const events = new MixerEvents(this, this.options);

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
		const existingTrack = document.querySelector(`[data-mixer-role="track"]`),
			discoveredChildren = existingTrack ? [ ...existingTrack.children ] : [ ...this.elem.children ],
			scout = document.createElement("div");

		if (!existingTrack) {
			const track = document.createElement("div");
			track.classList.add("_mixer-track");
			track.dataset.mixerRole = "track";

			discoveredChildren.forEach(child => {
				track.append(child);
			});

			this.track = track;
			this.elem.append(track);
		}

		const children = existingTrack ? [ ...existingTrack.children ] : [ ...this.track.children ];

		scout.setAttribute("data-mixr-role", "scout");
		document.body.insertBefore(scout, document.body.firstElementChild);

		this.elem.classList.add("_mixer");

		children.forEach((child, i) => {
            child.style.cssText = `transform: translate(0, 0); z-index: 1;`;
			child.classList.add("_mixer__item");
			child.setAttribute("data-mixer-movable", "true");
			child.setAttribute("data-node-ref", i);
			const { left, right, width } = this.elem.getBoundingClientRect();

			//this.elem.scrollTo(100, 0);
			//console.dir(this.elem.scrollLeft);

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
				containerLeft : Math.round(left - (scout.offsetLeft + child.clientWidth)),
				containerRight : ( Math.round(left - (scout.offsetLeft + child.clientWidth)) + width ) - child.clientWidth,
				node : child,
				height : child.clientHeight,
				width : child.clientWidth,
				top : child.getBoundingClientRect().top,
				left : child.getBoundingClientRect().left,
				right : child.getBoundingClientRect().left + child.clientWidth,
				center : ( child.getBoundingClientRect().left + ( child.getBoundingClientRect().left + child.clientWidth )) * .5,
				bottom : child.getBoundingClientRect().top + child.clientHeight,
				centerTop : ( child.getBoundingClientRect().top + ( child.getBoundingClientRect().top + child.clientHeight )) * .5,
				ref : i
			};
		});

		scout.remove();
	}

	_styles () {
		const style = new MixerStyles(this),
			direction = {};

		// container styles
		if (this.direction === "horizontal") {
			direction["width"] = "max-content";
		}
		else if (this.direction === "column") {
			direction["height"] = "max-content";
			direction["flex-direction"] = "column";
		}

		style.addRule("._mixer-track", {
			"display" : "flex",
			...direction,
			"gap" : `${ this.gap }px`,
		});

		style.addRule("._mixer", {
			"overflow" : "auto",
			"display" : "flex",
            "align-items" : "center",
			"user-select" : "none",
			"position" : "relative",
			"flex-direction" : this.direction,
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

		return [ ...this.track.children ];

		//if (this.direction === "horizontal") {
			//console.log(1);
			//const sortedItems = itemList.sort((first, last) => {
				//return first.xOrigin - last.xOrigin;
			//});

			//return sortedItems;
		//}

		//const sortedItems = itemList.sort((first, last) => {
			//return first.yOrigin - last.yOrigin;
		//});

		//return sortedItems;
	}

	refresh () {
		this._setup();
	}

	add (node) {
		if (node instanceof HTMLElement) {
			this.track.append(node);

			return;
		}

		this.elem.innerHTML += node;
	}

	remove () {}
}

window.Mixer = Mixer;
