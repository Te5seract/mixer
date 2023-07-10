/**
* @namespace Styles
*
* author: isaacastley@live.com
*/
export default class MixerStyles {
    constructor ({ options, selector, container, track, items }) {
        // static
        this.options = options;
        this.selector = selector;
        this.container = container;
        this.track = track;
        this.items = items;

        // kickoff
        this.#init();
    }

    /**
    * initializes the mixer styles class
    *
    * @return {void}
    */
    #init () {
        const style = document.createElement("style"),
            styleExisting = document.querySelector(`[data-mixer-role="stylesheet"]`);

        style.dataset.mixerRole = "stylesheet";

        this.style = style;

        this.#rules();

        if (!styleExisting) {
            document.head.append(style);
        }
    }

    /**
    * set basic styling rules for the
    *
    * @return {void}
    */
    #rules () {
        let { gap, direction, pointerEvents, overflow } = this.options;

        const overflowSetting = direction && ["horizontal", "vertical"].indexOf(direction) !== -1 ? { "overflow-x" : "auto" } : { "overflow-y" : "auto" };

        overflow = overflow ? overflowSetting : {};


        this.#setRule("._mixer", {
            "position" : "relative",
            "background-color" : "#ccc",
            ...overflow 
        });

        this.#setRule("._mixer__track", {
            "position" : "relative",
            "display" : "flex",
            "flex-direction" : `${ direction === "horizontal" ?  "row" : "column" }`,
            "gap" : `${ gap ? gap : 15 }px`,
            "user-select" : "none"
        });

        this.#setRule("._mixer__item", {
            "position" : "relative",
            "width" : "150px",
            "height" : "150px",
            "flex-shrink" : "0"
        });

        this.#setRule(`._mixer__item *${ pointerEvents ? pointerEvents.map(not => `:not(${ not })`).join("") : "" }`, {
            "pointer-events" : "none"
        });
    }

    /**
    * provides an interface for adding CSS
    * rules to the mixer library
    *
    * @param {string} selector
    * the css selector to apply rules to
    *
    * @param {object} properties
    * what css properties to apply to the
    * mixer items
    *
    * @return {void}
    */
    #setRule (selector, properties) {
        const propKeys = Object.keys(properties);

        let css = "";

        propKeys.forEach(key => {
            css += `${key}:${properties[key]};`;
        });

        this.style.innerHTML += `${selector}{${ css }}`;
    }
}
