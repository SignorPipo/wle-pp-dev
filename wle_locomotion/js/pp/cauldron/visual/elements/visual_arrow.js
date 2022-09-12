/*
let visualParams = new PP.VisualArrowParams();
visualParams.myStart.vec3_copy(start);
visualParams.myDirection.vec3_copy(direction);
visualParams.myLength = 0.2;
visualParams.myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
visualParams.myMaterial.color = [1, 1, 1, 1];
PP.myVisualManager.draw(visualParams);

or

let visualArrow = new PP.VisualArrow(visualParams);
*/

PP.VisualArrowParams = class VisualArrowParams extends PP.VisualLineParams {
    constructor() {
        super();

        this.myType = PP.VisualElementType.ARROW;
    }
};

PP.VisualArrow = class VisualArrow {

    constructor(params = new PP.VisualArrowParams()) {
        this._myParams = params;

        this._myVisible = false;
        this._myAutoRefresh = true;

        this._myDirty = false;

        this._myVisualLine = new PP.VisualLine();
        this._myVisualLine.setAutoRefresh(false);

        this._myArrowRootObject = null;
        this._myArrowObject = null;
        this._myArrowMeshComponent = null;

        this._build();
        this._refresh();

        this.setVisible(true);
    }

    setVisible(visible) {
        if (this._myVisible != visible) {
            this._myVisible = visible;
            this._myVisualLine.setVisible(visible);
            this._myArrowRootObject.pp_setActive(visible);
        }
    }

    setAutoRefresh(autoRefresh) {
        this._myAutoRefresh = autoRefresh;
    }

    getParams() {
        return this._myParams;
    }

    setParams(params) {
        this._myParams = params;
        this._markDirty();
    }

    paramsUpdated() {
        this._markDirty();
    }

    refresh() {
        this.update(0);
    }

    update(dt) {
        if (this._myDirty) {
            this._refresh();
            this._myDirty = false;
        }

        this._myVisualLine.update(dt);
    }

    _build() {
        this._myArrowRootObject = WL.scene.addObject(PP.myVisualData.myRootObject);
        this._myArrowObject = WL.scene.addObject(this._myArrowRootObject);

        this._myArrowMeshComponent = this._myArrowObject.addComponent('mesh');
        this._myArrowMeshComponent.mesh = PP.myDefaultResources.myMeshes.myCone;

        if (this._myParams.myMaterial == null) {
            this._myArrowMeshComponent.material = PP.myVisualData.myDefaultMaterials.myDefaultMeshMaterial;
        } else {
            this._myArrowMeshComponent.material = this._myParams.myMaterial;
        }
    }

    _markDirty() {
        this._myDirty = true;

        if (this._myAutoRefresh) {
            this.update(0);
        }
    }

    clone() {
        let clonedParams = new PP.VisualArrowParams();
        clonedParams.myStart.vec3_copy(this._myParams.myStart);
        clonedParams.myDirection.vec3_copy(this._myParams.myDirection);
        clonedParams.myLength = this._myParams.myLength;
        clonedParams.myThickness = this._myParams.myThickness;

        if (this._myParams.myMaterial != null) {
            clonedParams.myMaterial = this._myParams.myMaterial.clone();
        } else {
            clonedParams.myMaterial = null;
        }

        let clone = new PP.VisualArrow(clonedParams);
        clone.setAutoRefresh(this._myAutoRefresh);
        clone.setVisible(this._myVisible);
        clone._myDirty = this._myDirty;

        return clone;
    }
};

PP.VisualArrow.prototype._refresh = function () {
    let end = PP.vec3_create();
    let translateRoot = PP.vec3_create();
    let scaleArrow = PP.vec3_create();
    let direction = PP.vec3_create();
    return function _refresh() {
        this._myParams.myDirection.vec3_scale(Math.max(0.001, this._myParams.myLength - this._myParams.myThickness * 4), end);
        end.vec3_add(this._myParams.myStart, end);

        this._myArrowRootObject.pp_setPosition(end);
        this._myArrowRootObject.pp_setUp(this._myParams.myDirection);

        translateRoot.vec3_set(0, this._myParams.myThickness * 2 - 0.00001, 0);
        this._myArrowRootObject.pp_translateObject(translateRoot);

        this._myArrowObject.pp_resetScaleLocal();
        scaleArrow.vec3_set(this._myParams.myThickness * 1.25, this._myParams.myThickness * 2, this._myParams.myThickness * 1.25);
        this._myArrowObject.pp_scaleObject(scaleArrow);

        if (this._myParams.myMaterial == null) {
            this._myArrowMeshComponent.material = PP.myVisualData.myDefaultMaterials.myDefaultMeshMaterial;
        } else {
            this._myArrowMeshComponent.material = this._myParams.myMaterial;
        }

        direction = end.vec3_sub(this._myParams.myStart, direction);
        let visualLineParams = this._myVisualLine.getParams();
        visualLineParams.myStart.vec3_copy(this._myParams.myStart);
        visualLineParams.myDirection = direction.vec3_normalize(visualLineParams.myDirection);
        visualLineParams.myLength = direction.vec3_length();
        visualLineParams.myThickness = this._myParams.myThickness;

        if (this._myParams.myMaterial == null) {
            visualLineParams.myMaterial = PP.myVisualData.myDefaultMaterials.myDefaultMeshMaterial;
        } else {
            visualLineParams.myMaterial = this._myParams.myMaterial;
        }

        this._myVisualLine.paramsUpdated();
    };
}();



Object.defineProperty(PP.VisualArrow.prototype, "_refresh", { enumerable: false });