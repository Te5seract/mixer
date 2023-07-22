/**
* @namespace Mechanics
*
* author: isaacastley@live.com
*/
export default class MixerMechanics {
    /**
    * sets boundaries so that mixer items
    * do not break the boundaries of the
    * mixer canvas and returns those x & y
    * coordinates
    *
    * this method expects the x & y coordinates
    * from the #translate() method in the 
    * MixerEvents class
    *
    * @param {int} x
    * the x coordinate of the mixer item
    *
    * @param {int} y
    * the y coordinate of the mixer item
    *
    * @return {object}
    *
    * variable guideline:
    * item = the mixer item
    * canvas = the mixer canvas (prefixed with "c")
    */
    boundaries (x, y) {
        const { contained } = this.options;

        if (!contained) return { x : x, y : y };

        const { item, canvas, boundaries } = this.grabbed,
            { width, height, top, bottom } = item,
            { width : cWidth, height : cHeight, top : cTop, bottom : cBottom } = canvas,
            xMax = item.boundaries.right,
            xMin = item.boundaries.left,
            yMin = item.boundaries.top,
            yMax = item.boundaries.bottom;

        // x axis boundaries
        x = x <= xMin ? xMin : x;
        x = x >= xMax ? xMax : x;
        //console.log(x, xMin);

        // y axis boundaries
        y = y <= yMin ? yMin : y;
        y = y >= yMax ? yMax : y;

        return {
            x : x,
            y : y
        }
    }
}
