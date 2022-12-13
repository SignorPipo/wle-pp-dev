if (_WL && _WL._componentTypes && _WL._componentTypes[_WL._componentTypeIndices["mouse-look"]]) {

    // Modified Functions

    _WL._componentTypes[_WL._componentTypeIndices["mouse-look"]].prototype.init = function () {
        this.touchID = null;
        this.prevTouch = null;

        document.body.addEventListener('pointermove', this._onMove.bind(this));

        if (this.requireMouseDown) {
            if (this.mouseButtonIndex == 2) {
                WL.canvas.addEventListener("contextmenu", function (event) {
                    event.preventDefault();
                }, false);
            }
            WL.canvas.addEventListener('pointerdown', function (event) {
                if (!event.isPrimary) return;

                if (!this.mouseDown) {
                    if (event.button == this.mouseButtonIndex) {
                        this.mouseDown = true;
                        document.body.style.cursor = "grabbing";
                        if (event.button == 1) {
                            event.preventDefault(); // Prevent scrolling
                            return false;
                        }
                    }
                }
            }.bind(this));
            document.body.addEventListener('pointerup', function (event) {
                if (!event.isPrimary) return;

                if (this.mouseDown) {
                    if (event.button == this.mouseButtonIndex) {
                        this.mouseDown = false;
                        document.body.style.cursor = "initial";
                    }
                }
            }.bind(this));
            document.body.addEventListener('pointerleave', function (event) {
                if (!event.isPrimary) return;

                if (this.mouseDown) {
                    this.mouseDown = false;
                    document.body.style.cursor = "initial";
                }
            }.bind(this));
        }
    };

    _WL._componentTypes[_WL._componentTypeIndices["mouse-look"]].prototype._onMove = function () {
        let viewForward = PP.vec3_create();
        let viewUp = PP.vec3_create();

        let referenceUp = PP.vec3_create();
        let referenceUpNegate = PP.vec3_create();
        let referenceRight = PP.vec3_create();

        let newUp = PP.vec3_create();
        return function (event) {
            if (!event.isPrimary) return;

            if (this.active && (this.mouseDown || !this.requireMouseDown)) {

                viewForward = this.object.pp_getBackward(viewForward); // the view "real" forward is actually the backward
                viewUp = this.object.pp_getUp(viewUp);

                referenceUp.vec3_set(0, 1, 0);
                if (this.object.pp_getParent() != null) {
                    referenceUp = this.object.pp_getParent().pp_getUp(referenceUp);
                }

                referenceRight = viewForward.vec3_cross(referenceUp, referenceRight);

                let minAngle = 1;
                if (viewForward.vec3_angle(referenceUp) < minAngle) {
                    referenceRight = viewUp.vec3_negate(referenceRight).vec3_cross(referenceUp, referenceRight);
                } else if (viewForward.vec3_angle(referenceUp.vec3_negate(referenceUpNegate)) < minAngle) {
                    referenceRight = viewUp.vec3_cross(referenceUp, referenceRight);
                } else if (!viewUp.vec3_isConcordant(referenceUp)) {
                    referenceRight.vec3_negate(referenceRight);
                }
                referenceRight.vec3_normalize(referenceRight);

                this.rotationX = -this.sensitity * event.movementX;
                this.rotationY = -this.sensitity * event.movementY;

                this.object.pp_rotateAxis(this.rotationY, referenceRight);

                let maxVerticalAngle = 90 - 0.001;
                newUp = this.object.pp_getUp(newUp);
                let angleWithUp = Math.pp_angleClamp(newUp.vec3_angleSigned(referenceUp, referenceRight));
                if (Math.abs(angleWithUp) > maxVerticalAngle) {
                    let fixAngle = (Math.abs(angleWithUp) - maxVerticalAngle) * Math.pp_sign(angleWithUp);
                    this.object.pp_rotateAxis(fixAngle, referenceRight);
                }

                this.object.pp_rotateAxis(this.rotationX, referenceUp);
            }
        };
    }();
} else {
    console.error("Wonderland Engine \"mouse-look\" component not found.\n Add the component to your project to avoid any issue with the PP bundle.");
}