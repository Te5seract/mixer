import MixerStyles from "./MixerStyles.js";

export default class MixerEvents {
	constructor (mixer) {
		this.mixer = mixer;
		this.selector = mixer.selector;
		this.elem = mixer.elem;

		// options
		this.context = mixer.context;
		this.boundaries = mixer.boundaries;
		this.elastic = mixer.elastic;
		this.direction = mixer.direction;
		this.gap = mixer.gap;
		this.contextNode = () => {
			if (this.mixer.context) return this.elem;

			return document;
		};
		this.pixelsPerSecond = mixer.effects && mixer.effects.pixelsPerSecond ? 
			mixer.effects.pixelsPerSecond 
			: 
			100;
		this.items = mixer.items;

		// dynamic
		this.pixelsMoved = 0;
		this.currentSpeed = this._getSpeed;
		this.xDir = 0;
		this.yDir = 0;
		this.eventCache = {
			xDir : 0,
			yDir : 0,
		};
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
		this._checkDimensions();

		const { target, x, y } = e;

		// prevent no pointer event items from moving
		if (!target.dataset.mixerMovable) return;

		//this.elem.addEventListener("pointerover", this._over);
		this.contextNode().addEventListener("pointermove", this._move);

		// store info on the currently moved item
		this.grabbed = target;

		this.grabbed.style.cssText += `
			transition: 0s;
		`;

		this._snapPoints(true);

		this.grabbedRef = this.items[target.dataset.nodeRef];

		this.grabbedX = x - this.grabbedRef.xOrigin;
		this.grabbedY = y - this.grabbedRef.yOrigin;

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
		this.grabbedRef.containerWidth = this.elem.clientWidth;
		
		const { target, x, y } = e,
			directions = this._getMovementDirection(x, y);

		if (this.elastic) this._landingPlace(target, x, y);
			
        this.xPos = x - this.grabbedX,
        this.yPos = y - this.grabbedY;

		this.pixelsMoved = this.pixelsMoved + 1;

        this._constrainPosition(this.boundaries);
		this._translateItem(directions);

		this.grabbed.style.cssText += `
			transform: translate(${ this.grabbedRef.x }px, ${ this.grabbedRef.y }px);
			pointer-events: none;
			transition: 0;
		`;

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
		//this.elem.removeEventListener("pointerover", this._over, false)

        if (this.elastic) {
            this.grabbed.style.cssText = `
                position: relative;
                transform: translate(0, 0);
				cursor: grab;
                transition: .3s;
            `;

            this.grabbedRef.x = 0;
            this.grabbedRef.y = 0;

			this._landingPlace(target, x, y, true);
			this._resetPositions();
        } else {
			this.grabbed.style.cssText = `
				transform: translate(${ this.grabbedRef.x }px, ${ this.grabbedRef.y }px);
			`;

			this.grabbedRef.movedAmountX = this.grabbedRef.x;
			this.grabbedRef.xOrigin = this.grabbed.getBoundingClientRect().left - ( this.grabbed.clientWidth + this.grabbedRef.scoutLeft );

			this.grabbedRef.movedAmountY = this.grabbedRef.y;
			this.grabbedRef.yOrigin = this.grabbed.getBoundingClientRect().top - this.grabbedRef.scoutTop;
        }

		this._snapPoints(false);

		this.start();

		this.pixelsMoved = 0;
	}

	_resetPositions () {
		const items = Object.values(this.items);

		items.forEach(item => {
			item.node.style.cssText = `
				transform: translate(0, 0);
				transition: .2s;
			`;
		});
	}

	_landingPlace (target, x, y, place) {
		if (target.dataset.mixerSnap) {
			const ref = target.dataset.nodeRef,
				sibling = this.items[ref],
				{ left, center, right } = sibling;

				if (x > center) {
					target.style.cssText += `
						transform: translate(-5px, 0);
						transition: .2s;
					`;

					if (place) target.after(this.grabbed);
				}
				else if (x < center) {
					target.style.cssText += `
						transform: translate(5px, 0);
						transition: .2s;
					`;

					if (place) this.elem.insertBefore(this.grabbed, target);
				}
		} else {
			this._resetItemPositions();
		}
	}

	_resetItemPositions () {
		const items = Object.values(this.items);

		items.forEach(item => {
			if (item.node !== this.grabbed) {
				item.node.style.cssText += `
					transform: translate(0, 0);
					transition: .2s;
				`;
			}
		});
	}

	_snapPoints (isActive) {
		const items = Object.values(this.items);

		if (isActive) {
			items.forEach(item => {
				item.node !== this.grabbed && item.node.setAttribute("data-mixer-snap", "snap-point");
			});

			return;
		}

		items.forEach(item => {
			item.node !== this.grabbed && item.node.removeAttribute("data-mixer-snap");
		});
	}

	_translateItem ({ xDirection, yDirection }) {
		if (xDirection === "right") {
			this.grabbedRef.x = this.xPos - ( this.grabbedRef.xOrigin - this.grabbedRef.movedAmountX );
		}
		else if (xDirection === "left") {
			this.grabbedRef.x = this.xPos - ( this.grabbedRef.xOrigin - this.grabbedRef.movedAmountX );
		}

		if (yDirection === "up") {
			//this.grabbedRef.y = Math.round(this.yPosA - this.grabbedRef.yOrigin);
			this.grabbedRef.y = this.yPos - ( this.grabbedRef.yOrigin - this.grabbedRef.movedAmountY );
		}
		else if (yDirection === "down") {
			//this.grabbedRef.y = Math.round(this.yPosA - this.grabbedRef.yOrigin);
			this.grabbedRef.y = this.yPos - ( this.grabbedRef.yOrigin - this.grabbedRef.movedAmountY );
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
			const xMax = ( this.grabbedRef.containerWidth + this.grabbedRef.marginLeft ) - ( this.grabbed.clientWidth * 2 ),
				xMin = this.grabbedRef.marginLeft - this.grabbed.clientWidth,
				yMax = this.grabbedRef.containerHeight - this.grabbed.clientHeight;

			this.xPos = this.xPos >= xMax ? xMax : this.xPos;
			this.xPos = this.xPos <= xMin ? xMin : this.xPos;

			this.yPos = this.yPos >= yMax ? yMax : this.yPos;
			this.yPos = this.yPos <= 0 ? 0 : this.yPos;
		}
	}

	_checkDimensions () {
		for (let i in this.items) {
			const item = this.items[i];

			item.yOrigin =  item.node.getBoundingClientRect().top - this.elem.getBoundingClientRect().top,
			item.xOrigin = item.node.getBoundingClientRect().left - ( item.node.clientWidth + item.scoutLeft ),

			item.marginLeft = this.elem.getBoundingClientRect().left - item.scoutLeft;
			item.marginTop = this.elem.getBoundingClientRect().top;

			item.height = item.node.clientHeight;
			item.width = item.node.clientWidth;

			item.top = item.node.getBoundingClientRect().top;
			item.left = item.node.getBoundingClientRect().left;
			item.right = item.node.getBoundingClientRect().left + item.node.clientWidth;
			item.center = ( item.node.getBoundingClientRect().left + ( item.node.getBoundingClientRect().left + item.node.clientWidth )) * .5;
		}
	}

	/////////////////////////////////////
	// -- public methods
	
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
	*
	*/
	move (moveCallback) {
		this.moveCallback = moveCallback;
	}
}
