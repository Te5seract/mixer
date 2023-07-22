import MixerStyles from "./classes/MixerStyles.js";
import MixerEvents from "./classes/MixerEvents.js";
import MixerHelpers from "./classes/MixerHelpers.js";

/**
* @namespace Core
*
* author: isaacastley@live.com
*/
export default class Mixer {
    constructor (selector, options) {
        // static
        this.options = options;
        this.selector = selector;
        this.canvas = this.selector instanceof HTMLElement ? this.selector : document.querySelector(this.selector);

        // dynamic
        this.meta = [];

        // kickoff
        this.#init();
    }

    // -- private methods

    /**
    * initialize the library
    *
    * @return {void}
    */
    #init () {
        const styles = new MixerStyles({
            options : this.options,
            selector : this.selector,
            canvas : this.canvas,
            track : this.track,
            items : this.items
        });

        this.#structure();

        /*
        * once the structure is set up, the 
        * library can function
        */
        this.events = new MixerEvents({
            options : this.options,
            selector : this.selector,
            canvas : this.canvas,
            track : this.track,
            items : this.items,
            meta : this.meta
        });
    }

    /**
    * set the html structure that mixer expects
    *
    * @return {void}
    */
    #structure () {
        this.canvas.dataset.mixerRole = "mixer-container";
        this.canvas.classList.add("_mixer");

        this.tmpItems = [ ...this.canvas.children ];

        this.#items();

        this.track = this.#track();
        this.items = [ ...this.track.children ];

        this.#setMeta();
    }

    /**
    * builds out the track for the mixer items
    * to go into
    *
    * @return {HTMLElement}
    */
    #track () {
        const track = document.createElement("div");

        track.classList.add("_mixer__track");
        track.dataset.mixerRole = "track";

        this.canvas.append(track);

        this.tmpItems.forEach(item => {
            track.append(item);
        });

        return track;
    }

    /**
    * modify the mixer items
    *
    * @return {void}
    */
    #items () {
        this.tmpItems.forEach((item, i) => {
            item.classList.add("_mixer__item");
            item.dataset.mixerRole = "mixer-item";
        });
    }

    /**
    * sets up internal JS references to
    * the mixer items
    *
    * @return {void}
    */
    #setMeta () {
        this.items.forEach((item, i) => {
            item.dataset.mixerId = i;

            this.#setProps(item, i);
        });
    }

    /**
    * sets all the internal meta data
    * for each of the mixer items
    *
    * @param {HTMLElement} item
    * a mixer item passed in from a loop
    *
    * @param {int} index
    * the index of the item in the loop
    *
    * @return {void}
    */
    #setProps (item, index) {
        const node = item.getBoundingClientRect(),
            canvas = this.canvas.getBoundingClientRect(),
            { direction } = this.options,
            { gap } = this.options,
            maxY = canvas.height - node.height,
            maxX = canvas.width - node.width;

        this.meta.push({
            x : 0,
            y : 0,
            id : index,
            gap : gap,
            canvas : {
                node : this.canvas,
                left : canvas.left,
                top : canvas.top,
                bottom : canvas.bottom,
                right : canvas.right,
                width : canvas.width,
                height : canvas.height
            },
            item : {
                node : item,
                left : node.left,
                top : node.top,
                bottom : node.bottom,
                right : node.right,
                width : node.width,
                height : node.height,
                boundaries : {
                    top : index === 0 || direction !== "vertical" ? 0 : -( ( node.height + gap ) * index ),
                    bottom : index === 0 || direction !== "vertical" ? maxY : maxY - ( node.height + gap ) * index,
                    left : index === 0 || direction !== "horizontal" ? 0 : -( ( node.width + gap ) * index ),
                    right : index === 0 || direction !== "horizontal" ? maxX : maxX - ( node.width + gap ) * index
                }
            }
        });

        console.log(this.meta);
    }

    // -- public methods

    /**
    * listens for events that fire during
    * mixer interaction
    *
    * @param {string} type
    * the type of event to listen for:
    * movement: "move", "moving" or "movement"
    *
    * grab: "grab", "grabbing" or "grabbed"
    *
    * released: "release", "released" or "letgo"
    *
    * @param {callable} callback
    * a callback method that returns event data
    */
    event (type, callback) {
        if (type.match(/move|moving|movement/i)) { 
            callback ? this.events.move(callback) : null; 

            return;
        }
    }

    getId (item) {
        const helper = new MixerHelpers(),
            mixrItem = helper.parents(item, "mixerRole:mixer-item"),
            id = mixrItem.dataset.mixerId;

        if (!id) return null;

        return Number(id);
    }

    remove (id) {
        const meta = this.meta[id];

        this.meta.filter(item => item.id === id && item.item.node.remove());
        this.meta = this.meta.filter(item => item.id !== id);

        this.meta = this.meta.filter(Boolean);

        this.items = [ ...this.track.children ];
    }

    refresh () {
        const { direction } = this.options;

        this.meta.forEach((item, i) => {
            const node = item.item.node.getBoundingClientRect(),
                canvas = this.canvas.getBoundingClientRect(),
                top = canvas.top,
                bottom = canvas.top + ( item.item.height ),
                left = canvas.left,
                right = canvas.left + ( item.item.width ),
                maxY = canvas.height - item.item.height,
                maxX = canvas.width - node.width;

            item.item.top = i === 0 || direction !== "vertical" ? top : top + ( item.item.height + item.gap ) * i;
            item.item.bottom = i === 0 || direction !== "vertical" ? bottom : bottom + ( item.item.height + item.gap ) * i;
            item.item.left = i === 0 || direction !== "horizontal" ? left : left + ( item.item.width + item.gap ) * i;
            item.item.right = i === 0 || direction !== "horizontal" ? right : right + ( item.item.width + item.gap ) * i;

            //console.log(item.item.right = i === 0 || direction !== "horizontal" ? right : right + ( item.item.width + item.gap ) * i);

            console.log(item.item.boundaries.left);

            item.item.boundaries = {
                top : i === 0 || direction !== "vertical" ? 0 : -( ( item.item.height + item.gap ) * i ),
                bottom : i === 0 || direction !== "vertical" ? maxY : maxY - ( item.item.height + item.gap ) * i,
                left : i === 0 || direction !== "horizontal" ? 0 : -( ( node.width + item.gap ) * i ),
                right : i === 0 || direction !== "horizontal" ? maxX : maxX - ( node.width + item.gap ) * i
            }

            //item.item.left = node.left;
            //item.item.right = node.right;
            //item.item.width = node.width;
            //item.item.height = node.height;
        });

        console.log(this.meta);
    }
}

window.Mixer = Mixer;
