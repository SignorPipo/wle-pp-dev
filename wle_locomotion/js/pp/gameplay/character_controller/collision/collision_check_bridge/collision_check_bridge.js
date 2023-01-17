PP.CollisionCheckBridge = {
    _myCollisionCheck: new CollisionCheck(),

    checkMovement: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkMovement(movement, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            this._myCollisionCheck.move(movement, currentTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults);
        }
    }(),
    checkTeleportToTransform: function () {
        let teleportPosition = PP.vec3_create();
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkTeleportToTransform(teleportTransformQuat, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            teleportPosition = teleportTransformQuat.quat2_getPosition(teleportPosition);
            this._myCollisionCheck.teleport(teleportPosition, teleportTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults);
        }
    }(),
    checkTransform: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkTransform(checkTransformQuat, allowAdjustments, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            this._myCollisionCheck.positionCheck(allowAdjustments, checkTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults);
        }
    }(),
    updateGroundInfo: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function updateGroundInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            collisionCheckParams.myComputeCeilingInfoEnabled = false;
            this._myCollisionCheck.updateSurfaceInfo(currentTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults);
        }
    }(),
    updateCeilingInfo: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function updateCeilingInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            collisionCheckParams.myComputeGroundInfoEnabled = false;
            this._myCollisionCheck.updateSurfaceInfo(currentTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults);
        }
    }(),
    convertCharacterColliderSetupToCollisionCheckParams: function (characterColliderSetup, outCollisionCheckParams) {

    },
    convertCharacterCollisionResultsToCollisionRuntimeParams: function (characterCollisionResults, outCollisionRuntimeParams) {
        outCollisionRuntimeParams.reset();

        characterCollisionResults.myTransformResults.myStartTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myOriginalPosition);
        characterCollisionResults.myTransformResults.myEndTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myNewPosition);

        characterCollisionResults.myTransformResults.myStartTransformQuat.quat2_getForward(outCollisionRuntimeParams.myOriginalForward);
        characterCollisionResults.myTransformResults.myStartTransformQuat.quat2_getUp(outCollisionRuntimeParams.myOriginalUp);

        //outCollisionRuntimeParams.myOriginalHeight = characterCollisionResults.myOriginalHeight;

        outCollisionRuntimeParams.myOriginalMovement.vec3_copy(characterCollisionResults.myMovementResults.myStartMovement);
        outCollisionRuntimeParams.myFixedMovement.vec3_copy(characterCollisionResults.myMovementResults.myEndMovement);

        outCollisionRuntimeParams.myLastValidOriginalHorizontalMovement.vec3_copy(characterCollisionResults.myInternalResults.myLastValidStartHorizontalMovement);
        outCollisionRuntimeParams.myLastValidOriginalVerticalMovement.vec3_copy(characterCollisionResults.myInternalResults.myLastValidStartVerticalMovement);

        outCollisionRuntimeParams.myIsOnGround = characterCollisionResults.myGroundSurfaceInfo.myIsOnSurface;
        outCollisionRuntimeParams.myGroundAngle = characterCollisionResults.myGroundSurfaceInfo.mySurfaceAngle;
        outCollisionRuntimeParams.myGroundPerceivedAngle = characterCollisionResults.myGroundSurfaceInfo.mySurfacePerceivedAngle;
        outCollisionRuntimeParams.myGroundNormal.vec3_copy(characterCollisionResults.myGroundSurfaceInfo.mySurfaceNormal);

        outCollisionRuntimeParams.myIsOnCeiling = characterCollisionResults.myCeilingSurfaceInfo.myIsOnSurface;
        outCollisionRuntimeParams.myCeilingAngle = characterCollisionResults.myCeilingSurfaceInfo.mySurfaceAngle;
        outCollisionRuntimeParams.myCeilingPerceivedAngle = characterCollisionResults.myCeilingSurfaceInfo.mySurfacePerceivedAngle;
        outCollisionRuntimeParams.myCeilingNormal.vec3_copy(characterCollisionResults.myCeilingSurfaceInfo.mySurfaceNormal);

        outCollisionRuntimeParams.myHorizontalMovementCanceled = characterCollisionResults.myHorizontalMovementResults.myMovementFailed;
        outCollisionRuntimeParams.myIsCollidingHorizontally = characterCollisionResults.myHorizontalMovementResults.myIsColliding;
        outCollisionRuntimeParams.myHorizontalCollisionHit.copy(characterCollisionResults.myHorizontalMovementResults.myMainCollisionHit);

        outCollisionRuntimeParams.myVerticalMovementCanceled = characterCollisionResults.myVerticalMovementResults.myMovementFailed;
        outCollisionRuntimeParams.myIsCollidingVertically = characterCollisionResults.myVerticalMovementResults.myIsColliding;
        outCollisionRuntimeParams.myVerticalCollisionHit.copy(characterCollisionResults.myVerticalMovementResults.myMainCollisionHit);

        outCollisionRuntimeParams.myHasSnappedOnGround = characterCollisionResults.myVerticalAdjustmentsResults.myHasSnappedOnGround;
        outCollisionRuntimeParams.myHasSnappedOnCeiling = characterCollisionResults.myVerticalAdjustmentsResults.myHasSnappedOnCeiling;
        outCollisionRuntimeParams.myHasPoppedOutGround = characterCollisionResults.myVerticalAdjustmentsResults.myHasPoppedOutGround;
        outCollisionRuntimeParams.myHasPoppedOutCeiling = characterCollisionResults.myVerticalAdjustmentsResults.myHasPoppedOutCeiling;
        outCollisionRuntimeParams.myHasReducedVerticalMovement = characterCollisionResults.myVerticalAdjustmentsResults.myHasReducedVerticalMovement;
        outCollisionRuntimeParams.myHasAdjustedVerticalMovementWithSurfaceAngle = characterCollisionResults.myVerticalAdjustmentsResults.myHasAddedVerticalMovementBasedOnGroundPerceivedAngle || characterCollisionResults.myVerticalAdjustmentsResults.myHasAddedVerticalMovementBasedOnCeilingPerceivedAngle;

        outCollisionRuntimeParams.myIsSliding = characterCollisionResults.mySlideResults.myHasSlid;
        outCollisionRuntimeParams.mySlidingMovementAngle = characterCollisionResults.mySlideResults.mySlideMovementAngle;
        outCollisionRuntimeParams.mySlidingCollisionAngle = characterCollisionResults.mySlideResults.mySlideSurfaceAngle;
        //outCollisionRuntimeParams.mySlidingCollisionHit.copy(characterCollisionResults.mySlideResults.mySlideSurfaceNormal);

        outCollisionRuntimeParams.myIsSlidingIntoOppositeDirection = characterCollisionResults.myInternalResults.myHasSlidTowardsOppositeDirection;
        outCollisionRuntimeParams.myIsSlidingFlickerPrevented = characterCollisionResults.myInternalResults.mySlideFlickerPrevented;
        outCollisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter = characterCollisionResults.myInternalResults.mySlideFlickerPreventionForceCheckCounter;
        outCollisionRuntimeParams.mySliding90DegreesSign = characterCollisionResults.myInternalResults.mySlide90DegreesSign;
        outCollisionRuntimeParams.mySlidingRecompute90DegreesSign = characterCollisionResults.myInternalResults.mySlideRecompute90DegreesSign;
        outCollisionRuntimeParams.myLastValidIsSliding = characterCollisionResults.myInternalResults.myLastValidHasSlid;
        outCollisionRuntimeParams.mySlidingPreviousHorizontalMovement.vec3_copy(characterCollisionResults.myInternalResults.myLastValidEndHorizontalMovement);

        outCollisionRuntimeParams.myOriginalTeleportPosition.vec3_copy(characterCollisionResults.myTeleportResults.myStartTeleportTransformQuat);
        outCollisionRuntimeParams.myFixedTeleportPosition.vec3_copy(characterCollisionResults.myTeleportResults.myEndTeleportTransformQuat);
        outCollisionRuntimeParams.myTeleportCanceled = characterCollisionResults.myTeleportResults.myTeleportFailed;

        outCollisionRuntimeParams.myIsPositionOk = characterCollisionResults.myCheckTransformResults.myCheckTransformFailed;
        characterCollisionResults.myCheckTransformResults.myStartCheckTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myOriginalPositionCheckPosition);
        characterCollisionResults.myCheckTransformResults.myEndCheckTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myFixedPositionCheckPosition);

        outCollisionRuntimeParams.myIsTeleport = characterCollisionResults.myCheckType == PP.CharacterCollisionCheckType.CHECK_TELEPORT;
        outCollisionRuntimeParams.myIsMove = characterCollisionResults.myCheckType == PP.CharacterCollisionCheckType.CHECK_MOVEMENT;
        outCollisionRuntimeParams.myIsPositionCheck = characterCollisionResults.myCheckType == PP.CharacterCollisionCheckType.CHECK_TRANSFORM;

        outCollisionRuntimeParams.mySplitMovementSteps = characterCollisionResults.mySplitMovementResults.mySplitMovementSteps;
        outCollisionRuntimeParams.mySplitMovementStepsPerformed = characterCollisionResults.mySplitMovementResults.mySplitMovementStepsPerformed;
        outCollisionRuntimeParams.mySplitMovementStop = characterCollisionResults.mySplitMovementResults.mySplitMovementInterrupted;
        outCollisionRuntimeParams.mySplitMovementMovementChecked.vec3_copy(characterCollisionResults.mySplitMovementResults.mySplitMovementMovementChecked);
    },
    convertCollisionRuntimeParamsToCharacterCollisionResults: function () {
        let rotationQuat = PP.quat_create();
        return function convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults) {
            outCharacterCollisionResults.reset();

            if (collisionRuntimeParams.myIsMove) {
                outCharacterCollisionResults.myCheckType = PP.CharacterCollisionCheckType.CHECK_MOVEMENT;
            } else if (collisionRuntimeParams.myIsTeleport) {
                outCharacterCollisionResults.myCheckType = PP.CharacterCollisionCheckType.CHECK_TELEPORT;
            } else if (collisionRuntimeParams.myIsPositionCheck) {
                outCharacterCollisionResults.myCheckType = PP.CharacterCollisionCheckType.CHECK_TRANSFORM;
            }

            rotationQuat.quat_setForward(collisionRuntimeParams.myOriginalForward, collisionRuntimeParams.myOriginalUp);
            outCharacterCollisionResults.myTransformResults.myStartTransformQuat.quat2_setPositionRotationQuat(collisionRuntimeParams.myOriginalPosition, rotationQuat);
            outCharacterCollisionResults.myTransformResults.myEndTransformQuat.quat2_setPositionRotationQuat(collisionRuntimeParams.myNewPosition, rotationQuat);

            outCharacterCollisionResults.myMovementResults.myStartMovement.vec3_copy(collisionRuntimeParams.myOriginalMovement);
            outCharacterCollisionResults.myMovementResults.myEndMovement.vec3_copy(collisionRuntimeParams.myFixedMovement);
            outCharacterCollisionResults.myMovementResults.myMovementFailed = collisionRuntimeParams.myHorizontalMovementCanceled && collisionRuntimeParams.myVerticalMovementCanceled;
            outCharacterCollisionResults.myMovementResults.myIsColliding = collisionRuntimeParams.myIsCollidingHorizontally || collisionRuntimeParams.myIsCollidingVertically;
            if (collisionRuntimeParams.myIsCollidingHorizontally) {
                outCharacterCollisionResults.myMovementResults.myMainCollisionHit.copy(collisionRuntimeParams.myHorizontalCollisionHit);
            } else if (collisionRuntimeParams.myIsCollidingVertically) {
                outCharacterCollisionResults.myMovementResults.myMainCollisionHit.copy(collisionRuntimeParams.myVerticalCollisionHit);
            }

            outCharacterCollisionResults.myHorizontalMovementResults.myMovementFailed = collisionRuntimeParams.myHorizontalMovementCanceled;
            outCharacterCollisionResults.myHorizontalMovementResults.myIsColliding = collisionRuntimeParams.myIsCollidingHorizontally;
            outCharacterCollisionResults.myHorizontalMovementResults.myMainCollisionHit.copy(collisionRuntimeParams.myHorizontalCollisionHit);

            outCharacterCollisionResults.myVerticalMovementResults.myMovementFailed = collisionRuntimeParams.myVerticalMovementCanceled;
            outCharacterCollisionResults.myVerticalMovementResults.myIsColliding = collisionRuntimeParams.myIsCollidingVertically;
            outCharacterCollisionResults.myVerticalMovementResults.myMainCollisionHit.copy(collisionRuntimeParams.myVerticalCollisionHit);

            outCharacterCollisionResults.myTeleportResults.myStartTeleportTransformQuat.quat2_copy(outCharacterCollisionResults.myTransformResults.myStartTransformQuat);
            outCharacterCollisionResults.myTeleportResults.myStartTeleportTransformQuat.quat2_setPosition(collisionRuntimeParams.myOriginalTeleportPosition);
            outCharacterCollisionResults.myTeleportResults.myEndTeleportTransformQuat.quat2_copy(outCharacterCollisionResults.myTransformResults.myEndTransformQuat);
            outCharacterCollisionResults.myTeleportResults.myEndTeleportTransformQuat.quat2_setPosition(collisionRuntimeParams.myFixedTeleportPosition);
            outCharacterCollisionResults.myTeleportResults.myTeleportFailed = collisionRuntimeParams.myTeleportCanceled;

            outCharacterCollisionResults.myCheckTransformResults.myStartCheckTransformQuat.quat2_copy(outCharacterCollisionResults.myTransformResults.myStartTransformQuat);
            outCharacterCollisionResults.myCheckTransformResults.myStartCheckTransformQuat.quat2_setPosition(collisionRuntimeParams.myOriginalPositionCheckPosition);
            outCharacterCollisionResults.myCheckTransformResults.myEndCheckTransformQuat.quat2_copy(outCharacterCollisionResults.myTransformResults.myEndTransformQuat);
            outCharacterCollisionResults.myCheckTransformResults.myEndCheckTransformQuat.quat2_setPosition(collisionRuntimeParams.myFixedPositionCheckPosition);
            outCharacterCollisionResults.myCheckTransformResults.myCheckTransformFailed = !collisionRuntimeParams.myIsPositionOk;

            outCharacterCollisionResults.mySlideResults.myHasSlid = collisionRuntimeParams.myIsSliding;
            outCharacterCollisionResults.mySlideResults.mySlideMovementAngle = collisionRuntimeParams.mySlidingMovementAngle;
            outCharacterCollisionResults.mySlideResults.mySlideSurfaceAngle = collisionRuntimeParams.mySlidingCollisionAngle;
            //outCharacterCollisionResults.mySlideResults.mySlideSurfaceNormal = collisionRuntimeParams.mySlidingCollisionHit;

            outCharacterCollisionResults.myGroundSurfaceInfo.myIsOnSurface = collisionRuntimeParams.myIsOnGround;
            outCharacterCollisionResults.myGroundSurfaceInfo.mySurfaceAngle = collisionRuntimeParams.myGroundAngle;
            outCharacterCollisionResults.myGroundSurfaceInfo.mySurfacePerceivedAngle = collisionRuntimeParams.myGroundPerceivedAngle;
            outCharacterCollisionResults.myGroundSurfaceInfo.mySurfaceNormal.vec3_copy(collisionRuntimeParams.myGroundNormal);

            outCharacterCollisionResults.myCeilingSurfaceInfo.myIsOnSurface = collisionRuntimeParams.myIsOnCeiling;
            outCharacterCollisionResults.myCeilingSurfaceInfo.mySurfaceAngle = collisionRuntimeParams.myCeilingAngle;
            outCharacterCollisionResults.myCeilingSurfaceInfo.mySurfacePerceivedAngle = collisionRuntimeParams.myCeilingPerceivedAngle;
            outCharacterCollisionResults.myCeilingSurfaceInfo.mySurfaceNormal.vec3_copy(collisionRuntimeParams.myCeilingNormal);

            outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasSnappedOnGround = collisionRuntimeParams.myHasSnappedOnGround;
            outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasPoppedOutGround = collisionRuntimeParams.myHasPoppedOutGround;
            outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasSnappedOnCeiling = collisionRuntimeParams.myHasSnappedOnCeiling;
            outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasPoppedOutCeiling = collisionRuntimeParams.myHasPoppedOutCeiling;
            outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasReducedVerticalMovement = collisionRuntimeParams.myHasReducedVerticalMovement;
            //outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasAddedVerticalMovementBasedOnGroundPerceivedAngle = collisionRuntimeParams.myHasAdjustedVerticalMovementWithSurfaceAngle;
            //outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasAddedVerticalMovementBasedOnCeilingPerceivedAngle = collisionRuntimeParams.myHasAdjustedVerticalMovementWithSurfaceAngle;

            outCharacterCollisionResults.mySplitMovementResults.mySplitMovementSteps = collisionRuntimeParams.mySplitMovementSteps;
            outCharacterCollisionResults.mySplitMovementResults.mySplitMovementStepsPerformed = collisionRuntimeParams.mySplitMovementStepsPerformed;
            outCharacterCollisionResults.mySplitMovementResults.mySplitMovementInterrupted = collisionRuntimeParams.mySplitMovementStop;
            outCharacterCollisionResults.mySplitMovementResults.mySplitMovementMovementChecked.vec3_copy(collisionRuntimeParams.mySplitMovementMovementChecked);

            outCharacterCollisionResults.myInternalResults.myLastValidStartHorizontalMovement.vec3_copy(collisionRuntimeParams.myLastValidOriginalHorizontalMovement);
            outCharacterCollisionResults.myInternalResults.myLastValidEndHorizontalMovement.vec3_copy(collisionRuntimeParams.mySlidingPreviousHorizontalMovement);
            outCharacterCollisionResults.myInternalResults.myLastValidStartVerticalMovement.vec3_copy(collisionRuntimeParams.myLastValidOriginalVerticalMovement);
            //outCharacterCollisionResults.myInternalResults.myLastValidEndVerticalMovement.vec3_copy(collisionRuntimeParams.mySplitMovementMovementChecked);

            outCharacterCollisionResults.myInternalResults.myLastValidHasSlid = collisionRuntimeParams.myLastValidIsSliding;
            outCharacterCollisionResults.myInternalResults.myHasSlidTowardsOppositeDirection = collisionRuntimeParams.myIsSlidingIntoOppositeDirection;
            outCharacterCollisionResults.myInternalResults.mySlideFlickerPrevented = collisionRuntimeParams.myIsSlidingFlickerPrevented;
            outCharacterCollisionResults.myInternalResults.mySlideFlickerPreventionForceCheckCounter = collisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter;
            outCharacterCollisionResults.myInternalResults.mySlide90DegreesSign = collisionRuntimeParams.mySliding90DegreesSign;
            outCharacterCollisionResults.myInternalResults.mySlideRecompute90DegreesSign = collisionRuntimeParams.mySlidingRecompute90DegreesSign;

            outCharacterCollisionResults.myTransformResults.myStartTransformQuat.quat2_copy(currentTransformQuat);
        }
    }()
};