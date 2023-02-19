export default class Mixer {
    constructor (elem) {
        this.selector = elem.match(/data-.*('|`|")/igm) ? elem.replace(/(^data-.*('|`|"))/igm, "[$1]") : elem;
        this.elem = elem instanceof HTMLElement ? elem : document.querySelector(this.selector);

        this._setup();
    }

    _setup () {
        const container = this.elem,
            tiles = container.children;

        tiles.forEach(tile => {
            tile.addEventListener("pointerdown", this._grab.bind(this));
        });
    }

    _grab ({ target }) {
        console.log("grabbed");
    }
}
