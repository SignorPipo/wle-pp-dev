CollisionCheck.prototype.test = function () {
    let basePosition = PP.vec3_create();
    return function (objectsToIgnore, outIgnoredObjects, isGround, up, collisionCheckParams, hit, ignoreHitsInsideCollisionIfObjectToIgnore) {
    };
}();
Object.defineProperty(CollisionCheck.prototype, "test", { enumerable: false });

CollisionCheck.prototype._horizontalPositionCheck = function () {
    let checkPositions = [];
    let cachedCheckPositions = [];
    let currentCachedCheckPositionIndex = 0;
    let _localGetCachedCheckPosition = function () {
        let item = null;
        while (cachedCheckPositions.length <= currentCachedCheckPositionIndex) {
            cachedCheckPositions.push(PP.vec3_create());
        }

        item = cachedCheckPositions[currentCachedCheckPositionIndex];
        currentCachedCheckPositionIndex++;
    };

    let _localGroundObjectsToIgnore = [];
    let _localCeilingObjectsToIgnore = [];
    let _localGroundCeilingObjectsToIgnore = [];

    let objectEqualsCallback = (first, second) => first.pp_equals(second);

    let heightOffset = PP.vec3_create();
    let heightStep = PP.vec3_create();
    let currentHeightOffset = PP.vec3_create();
    let hitHeightOffset = PP.vec3_create();
    let downwardHeightOffset = PP.vec3_create();
    let downwardHeightStep = PP.vec3_create();

    return function (feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        this._myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugHorizontalPositionActive;

        checkPositions.length = 0;
        currentCachedCheckPositionIndex = 0;

        let halfConeAngle = Math.min(collisionCheckParams.myHalfConeAngle, 180);
        let sliceAngle = halfConeAngle / collisionCheckParams.myHalfConeSliceAmount;
        let tempCheckPosition = _localGetCachedCheckPosition();
        checkPositions.push(feetPosition.vec3_add(forward.vec3_scale(collisionCheckParams.myRadius, tempCheckPosition), tempCheckPosition));
        for (let i = 1; i <= collisionCheckParams.myHalfConeSliceAmount; i++) {
            let currentAngle = i * sliceAngle;

            tempCheckPosition = _localGetCachedCheckPosition();
            let radialDirection = forward.vec3_rotateAxis(-currentAngle, up, tempCheckPosition);
            checkPositions.push(feetPosition.vec3_add(radialDirection.vec3_scale(collisionCheckParams.myRadius, radialDirection), radialDirection));

            if (currentAngle != 180) {
                tempCheckPosition = _localGetCachedCheckPosition();
                radialDirection = forward.vec3_rotateAxis(currentAngle, up, tempCheckPosition);
                checkPositions.push(feetPosition.vec3_add(radialDirection.vec3_scale(collisionCheckParams.myRadius, radialDirection), radialDirection));
            }
        }

        let groundObjectsToIgnore = null;
        let ceilingObjectsToIgnore = null;
        let groundCeilingObjectsToIgnore = null;

        if (collisionCheckParams.myGroundAngleToIgnore > 0) {
            // gather ground objects to ignore
            groundObjectsToIgnore = _localGroundObjectsToIgnore;
            groundObjectsToIgnore.length = 0;
            groundCeilingObjectsToIgnore = _localGroundCeilingObjectsToIgnore;
            groundCeilingObjectsToIgnore.length = 0;

            let ignoreGroundAngleCallback = this._ignoreSurfaceAngle.bind(this, null, groundObjectsToIgnore, true, up, collisionCheckParams);

            let ignoreCeilingAngleCallback = null;
            if (collisionCheckParams.myCeilingAngleToIgnore > 0) {
                ignoreCeilingAngleCallback = this._ignoreSurfaceAngle.bind(this, null, groundCeilingObjectsToIgnore, false, up, collisionCheckParams);
            }

            heightOffset.vec3_zero();
            this._horizontalPositionHorizontalCheck(feetPosition, checkPositions, heightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);
        }

        if (collisionCheckParams.myCeilingAngleToIgnore > 0) {
            // gather ceiling objects to ignore
            if (!collisionRuntimeParams.myIsCollidingHorizontally && collisionCheckParams.myCheckHeight) {
                ceilingObjectsToIgnore = _localCeilingObjectsToIgnore;
                ceilingObjectsToIgnore.length = 0;

                let ignoreGroundAngleCallback = null;
                if (collisionCheckParams.myGroundAngleToIgnore > 0) {
                    ignoreGroundAngleCallback = this._ignoreSurfaceAngle.bind(this, groundObjectsToIgnore, null, true, up, collisionCheckParams);
                }

                let ignoreCeilingAngleCallback = this._ignoreSurfaceAngle.bind(this, null, ceilingObjectsToIgnore, false, up, collisionCheckParams);

                heightOffset = up.vec3_scale(height, heightOffset);
                this._horizontalPositionHorizontalCheck(feetPosition, checkPositions, heightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);
            }
        }

        if (!collisionRuntimeParams.myIsCollidingHorizontally) {

            let groundCeilingCheckIsFine = true;

            if (groundCeilingObjectsToIgnore != null) {
                // check that the ceiling objects ignored by the ground are the correct ones, that is the one ignored by the upper check
                for (let object of groundCeilingObjectsToIgnore) {
                    if (!ceilingObjectsToIgnore.pp_hasEqual(object, objectEqualsCallback)) {
                        groundCeilingCheckIsFine = false;
                        break;
                    }
                }
            }

            let ignoreGroundAngleCallback = null;
            let ignoreCeilingAngleCallback = null;

            if (collisionCheckParams.myGroundAngleToIgnore > 0) {
                ignoreGroundAngleCallback = this._ignoreSurfaceAngle.bind(this, groundObjectsToIgnore, null, true, up, collisionCheckParams);
            }

            if (collisionCheckParams.myCeilingAngleToIgnore > 0) {
                ignoreCeilingAngleCallback = this._ignoreSurfaceAngle.bind(this, ceilingObjectsToIgnore, null, false, up, collisionCheckParams);
            }

            let heightStepAmount = 0;
            if (collisionCheckParams.myCheckHeight && collisionCheckParams.myHeightCheckStepAmount > 0 && height > 0) {
                heightStepAmount = collisionCheckParams.myHeightCheckStepAmount;
                up.vec3_scale(height / heightStepAmount, heightStep);
            }

            for (let i = 0; i <= heightStepAmount; i++) {
                currentHeightOffset = heightStep.vec3_scale(i, currentHeightOffset);

                // we can skip the ground check since we have already done that, but if there was an error do it again with the proper set of objects to ignore
                // the ceiling check can always be ignored, it used the proper ground objects already
                if ((i != 0 && i != heightStepAmount) ||
                    (i == 0 && !groundCeilingCheckIsFine) ||
                    (i == 0 && collisionCheckParams.myGroundAngleToIgnore == 0) ||
                    (i == heightStepAmount && collisionCheckParams.myCeilingAngleToIgnore == 0)) {
                    this._horizontalPositionHorizontalCheck(feetPosition, checkPositions, currentHeightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);

                    if (collisionRuntimeParams.myIsCollidingHorizontally) {
                        break;
                    }
                }

                if (i > 0) {
                    if (collisionCheckParams.myHorizontalPositionCheckVerticalDirectionType == 0 || collisionCheckParams.myHorizontalPositionCheckVerticalDirectionType == 2) {
                        this._horizontalPositionVerticalCheck(feetPosition, checkPositions, currentHeightOffset, heightStep, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);

                        if (collisionRuntimeParams.myIsCollidingHorizontally) {
                            hitHeightOffset = collisionRuntimeParams.myHorizontalCollisionHit.myPosition.vec3_sub(feetPosition, hitHeightOffset).vec3_componentAlongAxis(up, hitHeightOffset);

                            collisionRuntimeParams.myIsCollidingHorizontally = false;
                            collisionRuntimeParams.myHorizontalCollisionHit.reset();
                            this._horizontalPositionHorizontalCheck(feetPosition, checkPositions, hitHeightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);

                            if (collisionRuntimeParams.myIsCollidingHorizontally) {
                                break;
                            }
                        }
                    }

                    if (!collisionRuntimeParams.myIsCollidingHorizontally) {
                        if (collisionCheckParams.myHorizontalPositionCheckVerticalDirectionType == 1 || collisionCheckParams.myHorizontalPositionCheckVerticalDirectionType == 2) {
                            downwardHeightOffset = currentHeightOffset.vec3_sub(heightStep, downwardHeightOffset);
                            downwardHeightStep = heightStep.vec3_negate(downwardHeightStep);
                            this._horizontalPositionVerticalCheck(feetPosition, checkPositions, downwardHeightOffset, downwardHeightStep, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);
                        }

                        if (collisionRuntimeParams.myIsCollidingHorizontally) {
                            hitHeightOffset = collisionRuntimeParams.myHorizontalCollisionHit.myPosition.vec3_sub(feetPosition, hitHeightOffset).vec3_componentAlongAxis(up, hitHeightOffset);

                            collisionRuntimeParams.myIsCollidingHorizontally = false;
                            collisionRuntimeParams.myHorizontalCollisionHit.reset();
                            this._horizontalPositionHorizontalCheck(feetPosition, checkPositions, hitHeightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);

                            if (collisionRuntimeParams.myIsCollidingHorizontally) {
                                break;
                            }
                        }
                    }
                }
            }
        }

        return !collisionRuntimeParams.myIsCollidingHorizontally;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalPositionCheck", { enumerable: false });

CollisionCheck.prototype._horizontalPositionHorizontalCheck = function () {
    let basePosition = PP.vec3_create();
    let currentRadialPosition = PP.vec3_create();
    let previousRadialPosition = PP.vec3_create();
    return function (feetPosition, checkPositions, heightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams) {
        let isHorizontalCheckOk = true;

        basePosition = feetPosition.vec3_add(heightOffset, basePosition);

        let halfRadialPositions = Math.floor(checkPositions.length / 2) + 1;
        for (let j = 0; j < halfRadialPositions; j++) {
            if (j > 0) {
                let leftIndex = Math.max(0, j * 2);
                let rightIndex = Math.max(0, (j * 2 - 1));

                if (collisionCheckParams.myCheckConeBorder) {
                    for (let r = 0; r < 2; r++) {
                        let currentIndex = r == 0 ? leftIndex : rightIndex;

                        currentRadialPosition = checkPositions[currentIndex].vec3_add(heightOffset, currentRadialPosition);

                        let previousIndex = Math.max(0, currentIndex - 2);
                        previousRadialPosition = checkPositions[previousIndex].vec3_add(heightOffset, previousRadialPosition);

                        isHorizontalCheckOk = this._horizontalCheckRaycast(previousRadialPosition, currentRadialPosition, forward.vec3_negate(), up,
                            true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, true,
                            collisionCheckParams, collisionRuntimeParams);

                        if (!isHorizontalCheckOk) break;
                    }
                }

                if (collisionCheckParams.myCheckConeRay && isHorizontalCheckOk) {
                    for (let r = 0; r < 2; r++) {
                        let currentIndex = r == 0 ? leftIndex : rightIndex;

                        currentRadialPosition = checkPositions[currentIndex].vec3_add(heightOffset, currentRadialPosition);

                        isHorizontalCheckOk = this._horizontalCheckRaycast(basePosition, currentRadialPosition, null, up,
                            false, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, false,
                            collisionCheckParams, collisionRuntimeParams);

                        if (!isHorizontalCheckOk) break;
                    }
                }
            } else {
                if (collisionCheckParams.myCheckConeRay) {
                    currentRadialPosition = checkPositions[j].vec3_add(heightOffset, currentRadialPosition);

                    isHorizontalCheckOk = this._horizontalCheckRaycast(basePosition, currentRadialPosition, null, up,
                        false, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                        feetPosition, false,
                        collisionCheckParams, collisionRuntimeParams);

                    if (!isHorizontalCheckOk) break;
                }
            }

            if (!isHorizontalCheckOk) {
                break;
            }
        }

        if (!isHorizontalCheckOk) {
            collisionRuntimeParams.myIsCollidingHorizontally = true;
            collisionRuntimeParams.myHorizontalCollisionHit.copy(this._myRaycastResult.myHits[0]);
        }

        return isHorizontalCheckOk;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalPositionHorizontalCheck", { enumerable: false });

CollisionCheck.prototype._horizontalPositionVerticalCheck = function () {
    let basePosition = PP.vec3_create();
    let previousBasePosition = PP.vec3_create();
    let currentRadialPosition = PP.vec3_create();
    let previousRadialPosition = PP.vec3_create();
    let previousCurrentRadialPosition = PP.vec3_create();
    let previousPreviousRadialPosition = PP.vec3_create();
    return function (feetPosition, checkPositions, heightOffset, heightStep, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams) {
        let isHorizontalCheckOk = true;

        basePosition = feetPosition.vec3_add(heightOffset, basePosition);
        previousBasePosition = basePosition.vec3_sub(heightStep, previousBasePosition);

        for (let j = 0; j <= checkPositions.length; j++) {
            if (j == checkPositions.length) {
                currentRadialPosition.vec3_copy(basePosition);
                previousRadialPosition.vec3_copy(previousBasePosition);
            } else {
                currentRadialPosition = checkPositions[j].vec3_add(heightOffset, currentRadialPosition);
                previousRadialPosition = currentRadialPosition.vec3_sub(heightStep, previousRadialPosition);
            }

            if (collisionCheckParams.myCheckVerticalStraight) {
                isHorizontalCheckOk = this._horizontalCheckRaycast(previousRadialPosition, currentRadialPosition, null, up,
                    collisionCheckParams.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                    feetPosition, false,
                    collisionCheckParams, collisionRuntimeParams, true, true);

                if (!isHorizontalCheckOk) break;
            }

            if (j < checkPositions.length) {
                if (collisionCheckParams.myCheckVerticalDiagonalRay ||
                    (collisionCheckParams.myCheckVerticalDiagonalBorderRay && (j == 0 || j == checkPositions.length - 1))) {
                    {
                        isHorizontalCheckOk = this._horizontalCheckRaycast(previousBasePosition, currentRadialPosition, null, up,
                            collisionCheckParams.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, false,
                            collisionCheckParams, collisionRuntimeParams, true, true);

                        if (!isHorizontalCheckOk) break;
                    }

                    {
                        isHorizontalCheckOk = this._horizontalCheckRaycast(previousRadialPosition, basePosition, null, up,
                            collisionCheckParams.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, false,
                            collisionCheckParams, collisionRuntimeParams, true, true);

                        if (!isHorizontalCheckOk) break;
                    }
                }

                if (j > 0) {
                    if (collisionCheckParams.myCheckVerticalDiagonalBorder) {
                        let previousIndex = Math.max(0, j - 2);
                        previousCurrentRadialPosition = checkPositions[previousIndex].vec3_add(heightOffset, previousCurrentRadialPosition);
                        previousPreviousRadialPosition = previousCurrentRadialPosition.vec3_sub(heightStep, previousPreviousRadialPosition);

                        {
                            isHorizontalCheckOk = this._horizontalCheckRaycast(previousPreviousRadialPosition, currentRadialPosition, null, up,
                                collisionCheckParams.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, false,
                                collisionCheckParams, collisionRuntimeParams, true, true);

                            if (!isHorizontalCheckOk) break;
                        }

                        {
                            isHorizontalCheckOk = this._horizontalCheckRaycast(previousRadialPosition, previousCurrentRadialPosition, null, up,
                                collisionCheckParams.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, false,
                                collisionCheckParams, collisionRuntimeParams, true, true);

                            if (!isHorizontalCheckOk) break;
                        }
                    }
                }
            }
        }

        if (!isHorizontalCheckOk) {
            collisionRuntimeParams.myIsCollidingHorizontally = true;
            collisionRuntimeParams.myHorizontalCollisionHit.copy(this._myRaycastResult.myHits[0]);
        }

        return isHorizontalCheckOk;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalPositionVerticalCheck", { enumerable: false });