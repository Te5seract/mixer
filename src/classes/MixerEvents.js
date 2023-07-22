import MixerMechanics from "./extensions/MixerMechanics.js";

/**
* @namespace Events
*
* author: isaacastley@live.com
*/
export default class MixerEvents extends MixerMechanics {
    constructor ({ options, selector, canvas, track, items, meta }) {
        super();

        // static
        this.options = options;
        this.selector = selector;
        this.canvas = canvas;
        this.track = track;
        this.items = items;
        this.meta = meta;

        // dynamic
        this.moved = false;

        // kickoff
        this.#init();
    }

    #init () {
        this.items.forEach(item => {
            item.addEventListener("pointerdown", this.#grab);
        });
    }

    /**
    * when the mixr item has been grabbed
    *
    * @return {void}
    */
    #grab = (e) => {
        const { target, x, y } = e;

        if (!target.dataset.mixerId) return;

        // set props
        this.id = target.dataset.mixerId;
        this.grabbed = this.meta[this.id];
        this.grabbedX = x;
        this.grabbedY = y;
        this.eventProps = { target : this.grabbed };

        document.addEventListener("pointermove", this.#move);
        document.addEventListener("pointerup", this.#release);
    }

    /**
    * moves the mixer item
    *
    * @return {void}
    */
    #move = (e) => {
        let { x, y } = this.#translate(e);

        if (x > 0 || y > 0) this.moved = true;

        // provide the move event to the public methods
        this.#passMoveListener(x, y);

        this.grabbed.item.node.style.cssText = `
            transform: translate(${ x }px, ${ y }px);
        `;
    }

    /**
    * lets go of the mixer item and stops
    * the mixer move event
    *
    * @return {void}
    */
    #release = (e) => {
        const { target, x, y } = e;

        document.removeEventListener("pointermove", this.#move, false);

        if (!this.moved || this.grabbedX === x) return;

        this.#translate(e, true);
        this.moved = false;
    }

    /**
    * translates the position of the mixer item
    *
    * @param {object} e
    * the event object from any pointer
    * based event to extract x & y coordinates
    *
    * @param {bool} set
    * sets the coordinates for the mixer
    * item's last move position for when it's
    * interacted with again
    *
    * variable guideline: 
    * ex and ey = event object x & y
    * bx and by = boundaries x & y
    *
    * @return {object}
    */
    #translate (e, set) {
        const { x, y } = this.meta[this.id],
            { x : ex, y : ey } = e;

        // start from a position of 0 
        this.x = ex - this.grabbedX;
        this.y = ey - this.grabbedY;

        /**
        * set up boundaries to prevent the
        * mixer items from breaching the mixer
        * canvas
        */
        const { x : bx, y : by } = super.boundaries(x + this.x, y + this.y);

        if (set) {
            this.meta[this.id].x = bx;
            this.meta[this.id].y = by;
        }

        return {
            x :  bx,
            y :  by
        }
    }

    /**
    * this method passes information back
    * to the instantiated Mixer class if
    * the event() method has been called
    * and send back the movement data
    *
    * @param {int} x
    * the mixer item's translated x position
    *
    * @param {int} y
    * the mixer item's translated y position
    *
    * @return {void}
    */
    #passMoveListener (x, y) {
        if (this.moveListen && this.moved) {
            this.eventProps.x = x;
            this.eventProps.y = y;
            this.eventProps.type = "move";

            this.moveListen(this.eventProps);
        }
    }

    // -- public methods

    /**
    * sets a moveListen property so that
    * the event() method provided to the 
    * main Mixer class can return data 
    * to the developer
    *
    * @return {void}
    */
    move (callback) {
        this.moveListen = callback;
    }
}
