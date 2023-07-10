import MixerStyles from "./classes/MixerStyles.js";
import MixerEvents from "./classes/MixerEvents.js";

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

    /**
    * initialize the library
    *
    * @return {void}
    */
    #init () {
        const styles = new MixerStyles({
            options : this.options,
            selector : this.selector,
            container : this.canvas,
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
            container : this.canvas,
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

    #setProps (item, index) {
        const node = item.getBoundingClientRect(),
            canvas = this.canvas.getBoundingClientRect(),
            { gap } = this.options;

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
                height : node.height
            }
        });
    }
}

window.Mixer = Mixer;
