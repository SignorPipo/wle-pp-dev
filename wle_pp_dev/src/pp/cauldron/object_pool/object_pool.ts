export interface PoolObject<PoolObjectType, PoolObjectCloneParamsType = unknown> {
    setActive(active: boolean): void;
    equals(object: PoolObjectType): boolean;

    cloneObject(cloneParams?: Readonly<PoolObjectCloneParamsType>): PoolObjectType | null;

    reserveObjects(size: number): void;
    destroy(): void;
}

export class ObjectPoolParams<PoolObjectType extends (Partial<PoolObject<PoolObjectType, PoolObjectCloneParamsType>> & object), PoolObjectCloneParamsType = unknown> {

    public myInitialPoolSize: number = 0;

    /** If all the objects are busy, this amount will be added to the pool */
    public myAmountToAddWhenEmpty: number = 0;

    /** If all the objects are busy, this percentage of the current pool size will be added to the pool */
    public myPercentageToAddWhenEmpty: number = 0;


    public myCloneParams: Readonly<PoolObjectCloneParamsType> | null = null;

    /** If true it will pre-allocate the memory before adding new objects to the pool */
    public myOptimizeObjectsAllocation = true;


    /** These extra functions can be used if u want to use the pool with objects that are not from WL (WL Object) */

    public myCloneCallback: ((object: Readonly<PoolObjectType>, cloneParams?: Readonly<PoolObjectCloneParamsType>) => PoolObjectType) | null = null;
    public mySetActiveCallback: ((object: PoolObjectType, active: boolean) => void) | null = null;
    public myEqualCallback: ((first: Readonly<PoolObjectType>, second: Readonly<PoolObjectType>) => boolean) | null = null;
    public myDestroyCallback: ((object: PoolObjectType) => void) | null = null;
    public myOptimizeObjectsAllocationCallback: ((object: Readonly<PoolObjectType>, numberOfObjectsToAllocate: number) => void) | null = null;


    public myLogEnabled: boolean = false;
}

export class ObjectPool<PoolObjectType extends (Partial<PoolObject<PoolObjectType, PoolObjectCloneParamsType>> & object), PoolObjectCloneParamsType = unknown> {

    private readonly _myObjectPrototype: Readonly<PoolObjectType>;
    private readonly _myObjectPoolParams: Readonly<ObjectPoolParams<PoolObjectType, PoolObjectCloneParamsType>>;

    private readonly _myAvailableObjects: PoolObjectType[] = [];
    private readonly _myBusyObjects: PoolObjectType[] = [];

    private _myDestroyed: boolean = false;

    constructor(objectPrototype: Readonly<PoolObjectType>, objectPoolParams: Readonly<ObjectPoolParams<PoolObjectType, PoolObjectCloneParamsType>>) {
        this._myObjectPrototype = objectPrototype;
        this._myObjectPoolParams = objectPoolParams;

        this._addToPool(objectPoolParams.myInitialPoolSize, false);
    }

    public get(): PoolObjectType {
        let object = this._myAvailableObjects.shift();

        if (object == null) {
            let amountToAdd = Math.ceil(this._myBusyObjects.length * this._myObjectPoolParams.myPercentageToAddWhenEmpty);
            amountToAdd += this._myObjectPoolParams.myAmountToAddWhenEmpty;
            this._addToPool(amountToAdd, this._myObjectPoolParams.myLogEnabled);
            object = this._myAvailableObjects.shift();
        }

        // Object could still be null if the amountToAdd is 0
        if (object != null) {
            this._myBusyObjects.push(object);
        }

        return object!;
    }

    public has(object: Readonly<PoolObjectType>): boolean {
        let hasObject = false;

        if (this.isBusy(object) || this.isAvailable(object)) {
            hasObject = true;
        }

        return hasObject;
    }

    public isBusy(object: Readonly<PoolObjectType>): boolean {
        return this._myBusyObjects.pp_has(this._equals.bind(this, object));
    }

    public isAvailable(object: Readonly<PoolObjectType>): boolean {
        return this._myAvailableObjects.pp_has(this._equals.bind(this, object));
    }

    public release(object: Readonly<PoolObjectType>): void {
        const released = this._myBusyObjects.pp_remove(this._equals.bind(this, object));
        if (released != null) {
            this._setActive(released, false);
            this._myAvailableObjects.push(released);
        }
    }

    public releaseAll(): void {
        for (const busyObject of this._myBusyObjects) {
            this._setActive(busyObject, false);
            this._myAvailableObjects.push(busyObject);
        }
    }

    public increase(amount: number): void {
        this._addToPool(amount, false);
    }

    public increasePercentage(percentage: number): void {
        const amount = Math.ceil((this.getSize()) * percentage);
        this._addToPool(amount, false);
    }

    public getObjects(): Readonly<PoolObjectType[]> {
        const objects = [];
        objects.push(...this._myAvailableObjects);
        objects.push(...this._myBusyObjects);

        return objects;
    }

    public getSize(): number {
        return this._myBusyObjects.length + this._myAvailableObjects.length;
    }

    public getAvailableObjects(): Readonly<PoolObjectType[]> {
        return this._myAvailableObjects;
    }

    public getAvailableSize(): number {
        return this._myAvailableObjects.length;
    }

    public getBusyObjects(): Readonly<PoolObjectType[]> {
        return this._myBusyObjects;
    }

    public getBusySize(): number {
        return this._myBusyObjects.length;
    }

    private _addToPool(size: number, logEnabled: boolean): void {
        if (size <= 0) {
            return;
        }

        if (this._myObjectPoolParams.myOptimizeObjectsAllocation) {
            if (this._myObjectPoolParams.myOptimizeObjectsAllocationCallback != null) {
                this._myObjectPoolParams.myOptimizeObjectsAllocationCallback(this._myObjectPrototype, size);
            } else if (this._myObjectPrototype.pp_reserveObjects != null) {
                this._myObjectPrototype.pp_reserveObjects(size);
            } else if (this._myObjectPrototype.reserveObjects != null) {
                this._myObjectPrototype.reserveObjects(size);
            }
        }

        for (let i = 0; i < size; i++) {
            this._myAvailableObjects.push(this._clone(this._myObjectPrototype));
        }

        if (logEnabled) {
            console.warn("Added new elements to the pool:", size);
        }
    }

    private _clone(object: Readonly<PoolObjectType>): PoolObjectType {
        let clone: PoolObjectType | null = null;

        const cloneParams = this._myObjectPoolParams.myCloneParams != null ? this._myObjectPoolParams.myCloneParams! : undefined;
        if (this._myObjectPoolParams.myCloneCallback != null) {
            clone = this._myObjectPoolParams.myCloneCallback(object, cloneParams);
        } else if (object.pp_clone != null) {
            clone = object.pp_clone(cloneParams);
        } else if (object.cloneObject != null) {
            clone = object.cloneObject(cloneParams);
        }

        if (clone == null) {
            throw new Error("Object Pool: object type is not cloneable");
        } else {
            this._setActive(clone, false);
        }

        return clone;
    }

    private _setActive(object: PoolObjectType, active: boolean): void {
        if (this._myObjectPoolParams.mySetActiveCallback != null) {
            this._myObjectPoolParams.mySetActiveCallback(object, active);
        } else if (object.pp_setActive != null) {
            object.pp_setActive(active);
        } else if (object.setActive != null) {
            object.setActive(active);
        }
    }

    private _equals(first: Readonly<PoolObjectType>, second: Readonly<PoolObjectType>): boolean {
        let equals = false;

        if (this._myObjectPoolParams.myEqualCallback != null) {
            equals = this._myObjectPoolParams.myEqualCallback(first, second);
        } else if (first.pp_equals != null) {
            equals = first.pp_equals(second);
        } else if (first.equals != null) {
            equals = first.equals(second);
        } else {
            equals = first == second;
        }

        return equals;
    }

    public destroy(): void {
        this._myDestroyed = true;

        for (const object of this._myAvailableObjects) {
            this._destroyObject(object);
        }

        for (const object of this._myBusyObjects) {
            this._destroyObject(object);
        }

        this._destroyObject(this._myObjectPrototype);
    }

    public isDestroyed(): boolean {
        return this._myDestroyed;
    }

    private _destroyObject(object: PoolObjectType): void {
        if (this._myObjectPoolParams.myDestroyCallback != null) {
            this._myObjectPoolParams.myDestroyCallback(object);
        } else if (object.pp_destroy != null) {
            object.pp_destroy();
        } else if (object.destroy != null) {
            object.destroy();
        }
    }
}