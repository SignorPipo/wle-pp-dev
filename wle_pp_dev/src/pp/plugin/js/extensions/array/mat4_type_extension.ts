/**
 * #WARN this type extension is actually added at runtime only if you call `initMat4Extension`  
 * The `initPP` function, which is automatically called by the `pp-gateway` component, does this for you
 */

import { Matrix4, Quaternion, Vector3 } from "../../../../cauldron/type_definitions/array_type_definitions.js";

export interface Matrix4Extension<MatrixType extends Matrix4> {

    mat4_set<T extends MatrixType>(this: T,
        m00: number, m01: number, m02: number, m03: number,
        m10: number, m11: number, m12: number, m13: number,
        m20: number, m21: number, m22: number, m23: number,
        m30: number, m31: number, m32: number, m33: number): T;
    mat4_set<T extends MatrixType>(this: T, uniformValue: number): T;



    mat4_copy<T extends MatrixType>(this: T, matrix: Readonly<Matrix4>): T;
    mat4_clone<T extends MatrixType>(this: Readonly<T>): T;



    mat4_identity<T extends MatrixType>(this: T): T;

    mat4_invert<T extends MatrixType>(this: Readonly<T>): T;
    mat4_invert<T extends MatrixType, U extends Matrix4>(this: Readonly<T>, out: U): U;

    mat4_mul<T extends MatrixType>(this: Readonly<T>, matrix: Readonly<Matrix4>): T;
    mat4_mul<T extends MatrixType, U extends Matrix4>(this: Readonly<T>, matrix: Readonly<Matrix4>, out: U): U;

    mat4_scale<T extends MatrixType>(this: Readonly<T>, vector: Readonly<Vector3>): T;
    mat4_scale<T extends MatrixType, U extends Matrix4>(this: Readonly<T>, vector: Readonly<Vector3>, out: U): U;



    mat4_getPosition<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getPosition<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;


    mat4_getRotation<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getRotation<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;

    mat4_getRotationDegrees<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getRotationDegrees<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;

    mat4_getRotationRadians<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getRotationRadians<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;

    mat4_getRotationQuat<T extends MatrixType>(this: Readonly<T>): Quaternion;
    mat4_getRotationQuat<T extends MatrixType, U extends Quaternion>(this: Readonly<T>, out: U): U;


    mat4_getScale<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getScale<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;



    mat4_setPosition<T extends MatrixType>(this: T, position: Readonly<Vector3>): T;

    mat4_setRotation<T extends MatrixType>(this: T, rotation: Readonly<Vector3>): T;
    mat4_setRotationDegrees<T extends MatrixType>(this: T, rotation: Readonly<Vector3>): T;
    mat4_setRotationRadians<T extends MatrixType>(this: T, rotation: Readonly<Vector3>): T;
    mat4_setRotationQuat<T extends MatrixType>(this: T, rotation: Readonly<Quaternion>): T;

    mat4_setScale<T extends MatrixType>(this: T, scale: Readonly<Vector3>): T;

    mat4_setPositionRotationScale<T extends MatrixType>(this: T, position: Readonly<Vector3>, rotation: Readonly<Vector3>, scale: Readonly<Vector3>): T;
    mat4_setPositionRotationDegreesScale<T extends MatrixType>(this: T, position: Readonly<Vector3>, rotation: Readonly<Vector3>, scale: Readonly<Vector3>): T;
    mat4_setPositionRotationRadiansScale<T extends MatrixType>(this: T, position: Readonly<Vector3>, rotation: Readonly<Vector3>, scale: Readonly<Vector3>): T;
    mat4_setPositionRotationQuatScale<T extends MatrixType>(this: T, position: Readonly<Vector3>, rotation: Readonly<Quaternion>, scale: Readonly<Vector3>): T;

    mat4_setPositionRotation<T extends MatrixType>(this: T, position: Readonly<Vector3>, rotation: Readonly<Vector3>): T;
    mat4_setPositionRotationDegrees<T extends MatrixType>(this: T, position: Readonly<Vector3>, rotation: Readonly<Vector3>): T;
    mat4_setPositionRotationRadians<T extends MatrixType>(this: T, position: Readonly<Vector3>, rotation: Readonly<Vector3>): T;
    mat4_setPositionRotationQuat<T extends MatrixType>(this: T, position: Readonly<Vector3>, rotation: Readonly<Quaternion>): T;



    mat4_getAxes<T extends MatrixType>(this: Readonly<T>): [Vector3, Vector3, Vector3];
    mat4_getAxes<T extends Vector3, U extends Vector3, V extends Vector3>(this: Readonly<T>, out: [T, U, V]): [T, U, V];

    mat4_getForward<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getForward<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;

    mat4_getBackward<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getBackward<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;

    mat4_getLeft<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getLeft<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;

    mat4_getRight<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getRight<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;

    mat4_getUp<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getUp<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;

    mat4_getDown<T extends MatrixType>(this: Readonly<T>): Vector3;
    mat4_getDown<T extends MatrixType, U extends Vector3>(this: Readonly<T>, out: U): U;



    mat4_toWorld<T extends MatrixType>(this: Readonly<T>, parentTransformMatrix: Readonly<Matrix4>): T;
    mat4_toWorld<T extends MatrixType, U extends Matrix4>(this: Readonly<T>, parentTransformMatrix: Readonly<Matrix4>, out: U): U;

    mat4_toLocal<T extends MatrixType>(this: Readonly<T>, parentTransformMatrix: Readonly<Matrix4>): T;
    mat4_toLocal<T extends MatrixType, U extends Matrix4>(this: Readonly<T>, parentTransformMatrix: Readonly<Matrix4>, out: U): U;



    mat4_hasUniformScale<T extends MatrixType>(this: Readonly<T>): boolean;



    mat4_toQuat<T extends MatrixType>(this: Readonly<T>): Quaternion;
    mat4_toQuat<T extends MatrixType, U extends Quaternion>(this: Readonly<T>, out: U): U;

    mat4_fromQuat<T extends MatrixType>(this: T, quat: Readonly<Quaternion>): T;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Array<T> extends Matrix4Extension<Array<number>> { }
}

declare global {
    interface Uint8ClampedArray extends Matrix4Extension<Uint8ClampedArray> { }
}

declare global {
    interface Uint8Array extends Matrix4Extension<Uint8Array> { }
}

declare global {
    interface Uint16Array extends Matrix4Extension<Uint16Array> { }
}

declare global {
    interface Uint32Array extends Matrix4Extension<Uint32Array> { }
}

declare global {
    interface Int8Array extends Matrix4Extension<Int8Array> { }
}

declare global {
    interface Int16Array extends Matrix4Extension<Int16Array> { }
}

declare global {
    interface Int32Array extends Matrix4Extension<Int32Array> { }
}

declare global {
    interface Float32Array extends Matrix4Extension<Float32Array> { }
}

declare global {
    interface Float64Array extends Matrix4Extension<Float64Array> { }
}

declare module "../../../../cauldron/type_definitions/array_type_definitions.js" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ArrayLike<T> extends Matrix4Extension<ArrayLike<number>> { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface DynamicArrayLike<T> extends Matrix4Extension<DynamicArrayLike<number>> { }

    interface Vector extends Matrix4Extension<Vector> { }

    interface Vector2 extends Matrix4Extension<Vector2> { }

    interface Vector3 extends Matrix4Extension<Vector3> { }

    interface Vector4 extends Matrix4Extension<Vector4> { }

    interface Quaternion extends Matrix4Extension<Quaternion> { }

    interface Quaternion2 extends Matrix4Extension<Quaternion2> { }

    interface Matrix2 extends Matrix4Extension<Matrix2> { }

    interface Matrix3 extends Matrix4Extension<Matrix3> { }

    interface Matrix4 extends Matrix4Extension<Matrix4> { }
}