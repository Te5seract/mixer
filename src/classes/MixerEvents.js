export default class MixerEvents {
	constructor (mixer) {
		this.mixer = mixer;
		this.selector = mixer.selector;
		this.elem = mixer.elem;
		this.context = mixer.context;
		this.containerHeight = this.elem.clientHeight;
		this.containerWidth = this.elem.clientWidth;
		this.boundaries = mixer.boundaries;
		this.elastic = mixer.elastic;
		this.pixelsPerSecond = mixer.effects && mixer.effects.pixelsPerSecond ? 
			mixer.effects.pixelsPerSecond 
			: 
			100;
		this.speed = 0;
		this.items = mixer.items;
		this.contextNode = () => {
			if (this.mixer.context) return this.elem;

			return document;
		}

		// dynamic
		this.pixelsMoved = 0;
		this.currentSpeed = this._getSpeed;
		this.xDir = 0;
		this.yDir = 0;
		this.eventCache = {
			speed : 0,
			second : 0,
			lastSpeed : 0,
			difference : 0,
			xDir : 0,
			yDir : 0,
		};

		this.test = "test";
	}

	/**
	 * initialises the events portion of the library
	 *
	 * return {void}
	 */
	start () {
        const container = this.elem,
            tiles = [ ...container.querySelectorAll(`[data-mixer-movable="true"]`) ];

		tiles.forEach(tile => {
			tile.addEventListener("pointerdown", this._grab);
		});

		document.addEventListener("pointerup", this._letGo);
	}

	/**
	 * this will begin the library's drag and
	 * drop mechanic. This will store the currently
	 * selected drag item within the instance to be 
	 * used in the _move() and _letGo methods.
	 *
	 * return {void}
	 */
    _grab = (e) => {
		const { target, x, y } = e;

		// prevent no pointer event items from moving
		if (!target.dataset.mixerMovable) return;
		//console.log(this.contextNode());
		this.contextNode().addEventListener("pointermove", this._move);

		// store info on the currently moved item
		this.grabbed = target;

        this.grabbedX = x - target.offsetLeft;
        this.grabbedY = y - target.offsetTop;
        //this.grabbedX = x - this.items[target.dataset.nodeRef].xOrigin;
        //this.grabbedY = y - this.items[target.dataset.nodeRef].yOrigin;

		this.grabbedRef = this.items[target.dataset.nodeRef];

		this.originX = this.grabbedRef.xOrigin;
		this.originY = this.grabbedRef.yOrigin;
    }

	/**
	 * this will enable the drag mechanics for the mixer item.
	 *
	 * @return {void}
	 */
	_move = (e) => {
		// the width can change dynamically, keep it updated
		this.containerWidth = this.elem.clientWidth;
		
		const { target, x, y } = e,
			directions = this._getMovementDirection(x, y);
			
        this.xPos = x - this.grabbedX,
        this.yPos = y - this.grabbedY;

		this.pixelsMoved = this.pixelsMoved + 1;

        this._constrainPosition(this.boundaries);
		this._translateItem(directions, x, y);

        console.log(this.grabbedRef.x, this.grabbedRef.y);

		this.grabbed.style.cssText = `
            position: relative;
            left: ${ this.xPos }px;
            top: ${ this.yPos }px;
			transition: 0;
		`;

            //left: ${ this.xPos }px;
            //top: ${ this.yPos }px;
        // transform: translate(${ this.grabbedRef.x }px, ${ this.grabbedRef.y }px);

		if (this.moveCallback) {
			this.moveCallback({
				x : this.xPos,
				y : this.yPos,
				moved : this.pixelsMoved,
				//speed : this.currentSpeed(),
				target : target,
				...directions
			});
		}
	}

	_translateItem ({ xDirection, yDirection }, x, y) {
        if (xDirection === "right") {
            this.grabbedRef.x = -( this.grabbedRef.xOrigin - this.xPos ) + this.grabbedRef.DOMMargin;
        }
        else if (xDirection === "left") {
            this.grabbedRef.x = -( this.grabbedRef.xOrigin - this.xPos ) + this.grabbedRef.DOMMargin;
        }

        if (yDirection === "up") {
            //console.log("yOrigin: " + this.grabbedRef.yOrigin, "yPos: " + this.yPos, "result: " + -(this.grabbedRef.yOrigin - this.yPos));
            //this.grabbedRef.y = -( this.grabbedRef.yOrigin - this.yPos );
            this.grabbedRef.y = -( this.grabbedY - this.yPos );
        }
        else if (yDirection === "down") {
            //console.log("yOrigin: " + this.grabbedRef.yOrigin, "yPos: " + this.yPos, "result: " + -(this.grabbedRef.yOrigin - this.yPos));
            //this.grabbedRef.y = -( this.grabbedRef.yOrigin - this.yPos );
        }
	}

	_getMovementDirection (x, y) {
		// get x direction
		if (this.xDir > x) {
			this.eventCache.xDir = "left";
		} 
		else if (this.xDir < x) {
			this.eventCache.xDir = "right";
		} else {
            this.eventCache.xDir = "none";
        }

		// get y direction
		if (this.yDir > y) {
			this.eventCache.yDir = "up";
		}
		else if (this.yDir < y) {
			this.eventCache.yDir = "down";
        } else {
            this.eventCache.yDir = "none";
        }
		
		this.xDir = x;
		this.yDir = y;

		return {
			xDirection : this.eventCache.xDir,
			yDirection : this.eventCache.yDir,
		};
	}

	_getSpeed () {
		return (() => {
			const date = new Date(),
				second = date.getSeconds();

			this.speed = this.speed + 1;

			if (this.eventCache.second !== second) {
				this.eventCache.second = second;
				this.eventCache.speed = this.speed;

				this.eventCache.lastSpeed = this.speed;
				this.speed = this.eventCache.lastSpeed > this.speed
				//this.speed = 0;
				//return this.eventCache.speed;
			}

			this.eventCache.speed = this.speed;
			return this.eventCache.lastSpeed;
		})();
	}

	/**
	 * this even listens for when the pointer is lifted,
	 * when the pointer is lifted, the move and down events
	 * will be removed.
	 *
	 * return {void}
	 */
	_letGo = (e) => {
		if (!this.grabbed) return;

		const { target, x, y } = e;

		this.grabbed.removeEventListener("pointerdown", this._grab, false);
		this.contextNode().removeEventListener("pointermove", this._move, false);

        if (this.elastic) {
            this.grabbed.style.cssText = `
                position: relative;
                transform: translate(0, 0);
                transition: .3s;
            `;

            this.grabbedRef.x = 0;
            this.grabbedRef.y = 0;
        } else {
            //console.log(this.yPos);
            //this.grabbedRef.xOrigin = this.xPos;
            //this.grabbedRef.yOrigin = this.yPos;
            this.grabbedRef.x = 0;
            this.grabbedRef.y = 0;
        }

		this.start();

		this.pixelsMoved = 0;
		this.speed = 0;
	}

	/**
	 * this prevents the dragged mixer item from breaking out of
	 * the mixer container
	 *
	 * @param {bool} isConstrained
	 * this will determine if the mixer items should be constrained
	 * to its container element or not
	 *
	 * return {void}
	 */
	_constrainPosition (isConstrained) {
		if (isConstrained) {
			const yBoundaries = ( this.containerHeight - this.grabbed.clientHeight ) - this.yPos,
				xBoundaries = ( this.containerWidth - this.grabbed.clientWidth ) - this.xPos,
				containerHeight = this.containerHeight,
				containerWidth = this.containerWidth,
				maxHeight = containerHeight - this.grabbed.clientHeight,
				maxWidth = containerWidth - this.grabbed.clientWidth;

			// prevent the item from breaking the Y boundaries
			this.yPos = yBoundaries <= 0 ? maxHeight : this.yPos;
			this.yPos = yBoundaries >= maxHeight ? 0 : this.yPos;

			// prevent item from breaking the X boundaries
			this.xPos = xBoundaries <= 0 ? maxWidth : this.xPos;
			this.xPos = xBoundaries >= maxWidth ? 0 : this.xPos;
		}
	}

	move (moveCallback) {
		this.moveCallback = moveCallback;
	}
}
