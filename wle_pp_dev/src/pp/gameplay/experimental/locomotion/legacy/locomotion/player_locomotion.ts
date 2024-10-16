import { Emitter, Material, Object3D, PhysXComponent, WonderlandEngine } from "@wonderlandengine/api";
import { FSM } from "../../../../../cauldron/fsm/fsm.js";
import { PhysicsLayerFlags } from "../../../../../cauldron/physics/physics_layer_flags.js";
import { EasingFunction, MathUtils } from "../../../../../cauldron/utils/math_utils.js";
import { XRUtils } from "../../../../../cauldron/utils/xr_utils.js";
import { Handedness } from "../../../../../input/cauldron/input_types.js";
import { InputUtils } from "../../../../../input/cauldron/input_utils.js";
import { GamepadUtils } from "../../../../../input/gamepad/cauldron/gamepad_utils.js";
import { Gamepad } from "../../../../../input/gamepad/gamepad.js";
import { GamepadButtonID } from "../../../../../input/gamepad/gamepad_buttons.js";
import { vec3_create } from "../../../../../plugin/js/extensions/array/vec_create_extension.js";
import { Globals } from "../../../../../pp/globals.js";
import { CharacterColliderSetupSimplifiedCreationAccuracyLevel, CharacterColliderSetupSimplifiedCreationParams, CharacterColliderSetupUtils } from "../../../character_controller/collision/character_collider_setup_utils.js";
import { CollisionCheckBridge } from "../../../character_controller/collision/collision_check_bridge.js";
import { CollisionCheckParams } from "../../../character_controller/collision/legacy/collision_check/collision_params.js";
import { NonVRReferenceSpaceMode, PlayerHeadManager, PlayerHeadManagerParams } from "./player_head_manager.js";
import { PlayerLocomotionMovementRuntimeParams } from "./player_locomotion_movement.js";
import { PlayerLocomotionRotate, PlayerLocomotionRotateParams } from "./player_locomotion_rotate.js";
import { PlayerLocomotionSmooth, PlayerLocomotionSmoothParams } from "./player_locomotion_smooth.js";
import { PlayerObscureManager, PlayerObscureManagerParams } from "./player_obscure_manager.js";
import { PlayerTransformManager, PlayerTransformManagerParams, PlayerTransformManagerSyncFlag } from "./player_transform_manager.js";
import { PlayerLocomotionTeleport, PlayerLocomotionTeleportParams } from "./teleport/player_locomotion_teleport.js";
import { PlayerLocomotionTeleportTeleportType } from "./teleport/player_locomotion_teleport_teleport_state.js";

export enum PlayerLocomotionDirectionReferenceType {
    HEAD = 0,
    HAND = 1,
    CUSTOM_OBJECT = 2
}

export enum PlayerLocomotionType {
    SMOOTH = 0,
    TELEPORT = 1
}

export class PlayerLocomotionParams {

    public myDefaultLocomotionType: number = PlayerLocomotionType.SMOOTH;
    public myAlwaysSmoothForNonVR: boolean = true;

    /** Double press main hand thumbstick (default: left) to switch */
    public mySwitchLocomotionTypeShortcutEnabled: boolean = true;

    public myPhysicsBlockLayerFlags: Readonly<PhysicsLayerFlags> = new PhysicsLayerFlags();


    public myDefaultHeight: number = 0;
    public myMinHeight: number = 0;
    public myCharacterRadius: number = 0;
    public myForeheadExtraHeight: number = 0;


    public myMaxSpeed: number = 0;
    public myMaxRotationSpeed: number = 0;
    public mySpeedSlowDownPercentageOnWallSlid: number = 1;


    public myGravityAcceleration: number = 0;
    public myMaxGravitySpeed: number = 0;


    public myIsSnapTurn: boolean = false;
    public mySnapTurnOnlyVR: boolean = false;
    public mySnapTurnAngle: number = 0;
    public mySnapTurnSpeedDegrees: number = 0;


    public myFlyEnabled: boolean = false;
    public myStartFlying: boolean = false;
    public myFlyWithButtonsEnabled: boolean = false;
    public myFlyWithViewAngleEnabled: boolean = false;
    public myMinAngleToFlyUpNonVR: number = 0;
    public myMinAngleToFlyDownNonVR: number = 0;
    public myMinAngleToFlyUpVR: number = 0;
    public myMinAngleToFlyDownVR: number = 0;
    public myMinAngleToFlyRight: number = 0;


    public myMainHand: Handedness = Handedness.LEFT;
    public myDirectionInvertForwardWhenUpsideDown: boolean = true;
    public myVRDirectionReferenceType: PlayerLocomotionDirectionReferenceType = PlayerLocomotionDirectionReferenceType.HEAD;
    public myVRDirectionReferenceObject: Readonly<Object3D> | null = null;


    public myTeleportType: number = PlayerLocomotionTeleportTeleportType.INSTANT;
    public myTeleportMaxDistance: number = 0;
    public myTeleportMaxHeightDifference: number = 0;
    public myTeleportFloorLayerFlags: Readonly<PhysicsLayerFlags> = new PhysicsLayerFlags();
    public myTeleportRotationOnUpEnabled: boolean = false;
    public myTeleportValidMaterial: Readonly<Material> | null = null;
    public myTeleportInvalidMaterial: Readonly<Material> | null = null;
    public myTeleportPositionObject: Readonly<Object3D> | null = null;
    public myTeleportPositionObjectRotateWithHead: boolean = false;
    public myTeleportParableStartReferenceObject: Readonly<Object3D> | null = null;


    public myResetRealOnStart: boolean = true;

    /**
     * #WARN With `_myResetRealOnStartFramesAmount` at `1` it can happen that you enter the session like 1 frame before the game load
     * and the head pose might have not been properly initialized yet in the WebXR API, so the reset real will not happen has expected  
     * Since this is a sort of edge case (either u enter after the load, or you were already in for more than 2-3 frames), and that
     * setting this to more than `1` can cause a visible (even if very short) stutter after the load (due to resetting the head multiple times),
     * it's better to keep this value at `1`  
     * A possible effect of the edge case is the view being obscured on start because it thinks you are colliding
     * 
     * A value of `3` will make u sure that the head pose will be initialized and the reset real will happen as expected in any case  
     * For example, if u have a total fade at start and nothing can be seen aside the clear color for at least, let's say, 10 frames, 
     * you can set this to `3` safely, since there will be no visible stutter to be seen (beside the clear color)
     */
    public myResetRealOnStartFramesAmount: number = 1;

    /** Can fix some head through floor issues, when you can move your head completely to the other side of the floor  
        If the floors are thick enough that this can't happen, you can leave this to false  */
    public myResetHeadToFeetInsteadOfReal: boolean = false;

    public myResetHeadToRealMinDistance: number = 0;

    public myMaxHeadToRealHeadSteps: number | null = null;


    /** Valid means, for example, that the real player has not moved inside a wall by moving in the real space */
    public mySyncWithRealWorldPositionOnlyIfValid: boolean = true;

    public myViewOcclusionInsideWallsEnabled: boolean = true;
    public myViewOcclusionLayerFlags: Readonly<PhysicsLayerFlags> = new PhysicsLayerFlags();

    public mySyncNonVRHeightWithVROnExitSession: boolean = false;
    public mySyncNonVRVerticalAngleWithVROnExitSession: boolean = false;


    public mySyncHeadWithRealAfterLocomotionUpdateIfNeeded: boolean = false;


    public myColliderAccuracy: number = CharacterColliderSetupSimplifiedCreationAccuracyLevel.VERY_LOW;
    public myColliderCheckOnlyFeet: boolean = false;
    public myColliderSlideAlongWall: boolean = false;
    public myColliderMaxWalkableGroundAngle: number = 0;
    public myColliderMaxTeleportableGroundAngle: number | null = null;
    public myColliderSnapOnGround: boolean = false;
    public myColliderMaxDistanceToSnapOnGround: number = 0;
    public myColliderMaxWalkableGroundStepHeight: number = 0;
    public myColliderPreventFallingFromEdges: boolean = false;
    public myColliderMaxMovementSteps: number | null = null;



    /** Main hand (default: left) select + thumbstick press, auto switch to smooth */
    public myDebugFlyShortcutEnabled: boolean = false;

    public myDebugFlyMaxSpeedMultiplier: number = 5;

    /** Main hand (default: left) thumbstick pressed while moving */
    public myMoveThroughCollisionShortcutEnabled: boolean = false;

    /** Not main hand (default: right) thumbstick pressed while moving */
    public myMoveHeadShortcutEnabled: boolean = false;

    /** Main hand (default: left) select pressed while moving */
    public myTripleSpeedShortcutEnabled: boolean = false;


    public myDebugHorizontalEnabled: boolean = false;
    public myDebugVerticalEnabled: boolean = false;

    public myCollisionCheckDisabled: boolean = false;

    public myEngine: Readonly<WonderlandEngine>;


    constructor(engine: Readonly<WonderlandEngine> = Globals.getMainEngine()!) {
        this.myEngine = engine;
    }
}


// #TODO Add lerped snap on vertical over like half a second to avoid the "snap effect"
// This could be done by detatching the actual vertical position of the player from the collision real one when a snap is detected above a certain threshold
// with a timer, after which the vertical position is just copied, while during the detatching is lerped toward the collision vertical one
export class PlayerLocomotion {

    private readonly _myParams: PlayerLocomotionParams;

    private readonly _myPlayerHeadManager: PlayerHeadManager;
    private readonly _myPlayerTransformManager: PlayerTransformManager;
    private readonly _myPlayerLocomotionRotate: PlayerLocomotionRotate;
    private readonly _myPlayerLocomotionSmooth: PlayerLocomotionSmooth;
    private readonly _myPlayerLocomotionTeleport: PlayerLocomotionTeleport;
    private readonly _myPlayerObscureManager: PlayerObscureManager;

    private readonly _myLocomotionMovementFSM: FSM = new FSM();

    private _mySwitchToTeleportOnEnterSession: boolean = false;

    private _myActive: boolean = false;
    private _myStarted: boolean = false;
    private _myIdle: boolean = false;

    private _myResetRealOnStartCounter: number = 0;

    private readonly _myPreUpdateEmitter: Emitter<[number, PlayerLocomotion]> = new Emitter();
    private readonly _myPostUpdateEmitter: Emitter<[number, PlayerLocomotion]> = new Emitter();

    private _myDestroyed: boolean = false;

    constructor(params: PlayerLocomotionParams) {
        this._myParams = params;

        const collisionCheckParamsMovement = this._setupCollisionCheckParamsMovement();

        const movementRuntimeParams = new PlayerLocomotionMovementRuntimeParams();
        movementRuntimeParams.myIsFlying = this._myParams.myStartFlying;

        {
            const params = new PlayerHeadManagerParams(this._myParams.myEngine as any);

            params.mySessionChangeResyncEnabled = true;

            params.myBlurEndResyncEnabled = true;
            params.myBlurEndResyncRotation = false;

            params.myEnterSessionResyncHeight = false;
            params.myExitSessionResyncHeight = this._myParams.mySyncNonVRHeightWithVROnExitSession;
            params.myExitSessionResyncVerticalAngle = this._myParams.mySyncNonVRVerticalAngleWithVROnExitSession;
            params.myExitSessionRemoveRightTilt = true;
            params.myExitSessionAdjustMaxVerticalAngle = true;
            params.myExitSessionMaxVerticalAngle = 90;

            params.myNonVRFloorBasedMode = NonVRReferenceSpaceMode.FLOOR_THEN_KEEP_VR;

            params.myDefaultHeightNonVR = this._myParams.myDefaultHeight;
            params.myDefaultHeightVRWithoutFloor = this._myParams.myDefaultHeight;
            params.myForeheadExtraHeight = this._myParams.myForeheadExtraHeight;

            params.myFeetRotationKeepUp = true;

            params.myDebugEnabled = false;

            this._myPlayerHeadManager = new PlayerHeadManager(params);
        }

        {
            const params = new PlayerTransformManagerParams(this._myParams.myEngine);

            params.myPlayerHeadManager = this._myPlayerHeadManager;

            params.myMovementCollisionCheckParams = collisionCheckParamsMovement;
            params.myTeleportCollisionCheckParams = null;
            params.myTeleportCollisionCheckParamsCopyFromMovement = true;
            params.myTeleportCollisionCheckParamsCheck360 = true;
            params.myTeleportCollisionCheckParamsGroundAngleToIgnore = this._myParams.myColliderMaxTeleportableGroundAngle;

            params.myHeadCollisionBlockLayerFlags.copy(this._myParams.myViewOcclusionLayerFlags);
            params.myHeadCollisionObjectsToIgnore.pp_copy(params.myMovementCollisionCheckParams.myHorizontalObjectsToIgnore as any);
            const objectsEqualCallback = (first: Readonly<Object3D>, second: Readonly<Object3D>): boolean => first == second;
            for (const objectToIgnore of params.myMovementCollisionCheckParams.myVerticalObjectsToIgnore) {
                params.myHeadCollisionObjectsToIgnore.pp_pushUnique(objectToIgnore, objectsEqualCallback);
            }

            params.myHeadRadius = 0.2;

            if (!this._myParams.mySyncWithRealWorldPositionOnlyIfValid) {
                params.mySyncEnabledFlagMap.set(PlayerTransformManagerSyncFlag.BODY_COLLIDING, false);
                params.mySyncEnabledFlagMap.set(PlayerTransformManagerSyncFlag.FAR, false);
                params.mySyncEnabledFlagMap.set(PlayerTransformManagerSyncFlag.FLOATING, false);

                params.myAlwaysSyncPositionWithReal = true;
            }

            if (!this._myParams.myViewOcclusionInsideWallsEnabled) {
                params.mySyncEnabledFlagMap.set(PlayerTransformManagerSyncFlag.HEAD_COLLIDING, false);

                params.myAlwaysSyncHeadPositionWithReal = true;

                params.myUpdatePositionHeadValid = false;
                params.myUpdateRealPositionHeadValid = false;
            }

            params.myMaxDistanceFromRealToSyncEnabled = true;
            params.myMaxDistanceFromRealToSync = 0.5;
            params.myMaxDistanceFromHeadRealToSyncEnabled = true;
            params.myMaxDistanceFromHeadRealToSync = 0.5;

            params.myIsFloatingValidIfVerticalMovement = false;
            params.myIsFloatingValidIfVerticalMovementAndRealOnGround = false;
            params.myIsFloatingValidIfSteepGround = false;
            params.myIsFloatingValidIfVerticalMovementAndSteepGround = false;
            params.myIsFloatingValidIfRealOnGround = false;
            params.myFloatingSplitCheckEnabled = true;
            params.myFloatingSplitCheckMinLength = collisionCheckParamsMovement.myFeetRadius * 1.5;
            params.myFloatingSplitCheckMaxLength = params.myFloatingSplitCheckMinLength;

            params.myRealMovementAllowVerticalAdjustments = true;
            params.myIgnoreUpwardMovementToRealIfValidOnGround = true;

            params.myUpdateRealPositionValid = false;
            params.myUpdatePositionValid = false;

            params.myMinHeight = this._myParams.myMinHeight;

            params.myIsBodyCollidingWhenHeightBelowValue = null;
            params.myIsBodyCollidingWhenHeightAboveValue = null;

            params.myResetToValidOnEnterSession = true;
            params.myResetToValidOnExitSession = true;
            params.myResetToValidOnSessionHiddenEnd = true;

            params.myAlwaysResetRealPositionNonVR = true;
            params.myAlwaysResetRealRotationNonVR = true;
            params.myAlwaysResetRealHeightNonVR = true;

            params.myAlwaysResetRealPositionVR = false;
            params.myAlwaysResetRealRotationVR = false;
            params.myAlwaysResetRealHeightVR = false;

            params.myNeverResetRealPositionNonVR = false;
            params.myNeverResetRealRotationNonVR = true;
            params.myNeverResetRealHeightNonVR = false;

            params.myResetRealHeightNonVROnExitSession = this._myParams.mySyncNonVRHeightWithVROnExitSession;

            params.myResetHeadToFeetInsteadOfRealOnlyIfRealNotReachable = this._myParams.myResetHeadToFeetInsteadOfReal;
            params.myResetHeadToRealMinDistance = this._myParams.myResetHeadToRealMinDistance;
            params.myMaxHeadToRealHeadSteps = this._myParams.myMaxHeadToRealHeadSteps;

            params.myNeverResetRealPositionVR = false;
            params.myNeverResetRealRotationVR = false;
            params.myNeverResetRealHeightVR = true;

            params.myDebugEnabled = false;

            this._myPlayerTransformManager = new PlayerTransformManager(params);
        }

        {
            const params = new PlayerLocomotionRotateParams(this._myParams.myEngine as any);

            params.myPlayerTransformManager = this._myPlayerTransformManager;

            params.myMaxRotationSpeed = this._myParams.myMaxRotationSpeed;
            params.myIsSnapTurn = this._myParams.myIsSnapTurn;
            params.mySnapTurnOnlyVR = this._myParams.mySnapTurnOnlyVR;
            params.mySnapTurnAngle = this._myParams.mySnapTurnAngle;

            if (this._myParams.mySnapTurnSpeedDegrees > MathUtils.EPSILON) {
                params.mySmoothSnapEnabled = true;
                params.mySmoothSnapSpeedDegrees = this._myParams.mySnapTurnSpeedDegrees;
            } else {
                params.mySmoothSnapEnabled = false;
            }

            params.myRotationMinStickIntensityThreshold = 0.1;
            params.mySnapTurnActivateThreshold = 0.5;
            params.mySnapTurnResetThreshold = 0.4;

            params.myClampVerticalAngle = true;
            params.myMaxVerticalAngle = 89;

            params.myHandedness = InputUtils.getOppositeHandedness(this._myParams.myMainHand)!;

            this._myPlayerLocomotionRotate = new PlayerLocomotionRotate(params);
        }

        {
            {
                const params = new PlayerLocomotionSmoothParams(this._myParams.myEngine as any);

                params.myPlayerTransformManager = this._myPlayerTransformManager;

                params.myHandedness = this._myParams.myMainHand;

                params.myMaxSpeed = this._myParams.myMaxSpeed;
                params.mySpeedSlowDownPercentageOnWallSlid = this._myParams.mySpeedSlowDownPercentageOnWallSlid;

                params.myMovementMinStickIntensityThreshold = 0.1;

                params.myFlyEnabled = this._myParams.myFlyEnabled;
                params.myFlyWithButtonsEnabled = this._myParams.myFlyWithButtonsEnabled;
                params.myFlyWithViewAngleEnabled = this._myParams.myFlyWithViewAngleEnabled;
                params.myMinAngleToFlyUpNonVR = this._myParams.myMinAngleToFlyUpNonVR;
                params.myMinAngleToFlyDownNonVR = this._myParams.myMinAngleToFlyDownNonVR;
                params.myMinAngleToFlyUpVR = this._myParams.myMinAngleToFlyUpVR;
                params.myMinAngleToFlyDownVR = this._myParams.myMinAngleToFlyDownVR;
                params.myMinAngleToFlyRight = this._myParams.myMinAngleToFlyRight;

                params.myGravityAcceleration = this._myParams.myGravityAcceleration;
                params.myMaxGravitySpeed = this._myParams.myMaxGravitySpeed;

                params.myDirectionInvertForwardWhenUpsideDown = this._myParams.myDirectionInvertForwardWhenUpsideDown;
                params.myVRDirectionReferenceType = this._myParams.myVRDirectionReferenceType;
                params.myVRDirectionReferenceObject = this._myParams.myVRDirectionReferenceObject;

                params.myDebugFlyMaxSpeedMultiplier = this._myParams.myDebugFlyMaxSpeedMultiplier;
                params.myMoveThroughCollisionShortcutEnabled = this._myParams.myMoveThroughCollisionShortcutEnabled;
                params.myMoveHeadShortcutEnabled = this._myParams.myMoveHeadShortcutEnabled;
                params.myTripleSpeedShortcutEnabled = this._myParams.myTripleSpeedShortcutEnabled;

                this._myPlayerLocomotionSmooth = new PlayerLocomotionSmooth(params, movementRuntimeParams);
            }

            {
                const params = new PlayerLocomotionTeleportParams(this._myParams.myEngine as any);

                params.myPlayerTransformManager = this._myPlayerTransformManager;

                params.myHandedness = this._myParams.myMainHand;

                params.myDetectionParams.myMaxDistance = this._myParams.myTeleportMaxDistance;
                params.myDetectionParams.myMaxHeightDifference = this._myParams.myTeleportMaxHeightDifference;
                params.myDetectionParams.myGroundAngleToIgnoreUpward = collisionCheckParamsMovement.myGroundAngleToIgnore;
                params.myDetectionParams.myRotationOnUpEnabled = this._myParams.myTeleportRotationOnUpEnabled;
                params.myDetectionParams.myMustBeOnGround = true;
                params.myDetectionParams.myMustBeOnIgnorableGroundAngle = true;

                params.myDetectionParams.myTeleportBlockLayerFlags.copy(this._myParams.myPhysicsBlockLayerFlags);
                params.myDetectionParams.myTeleportFloorLayerFlags.copy(this._myParams.myTeleportFloorLayerFlags);

                params.myDetectionParams.myTeleportFeetPositionMustBeVisible = false;
                params.myDetectionParams.myTeleportHeadPositionMustBeVisible = false;
                params.myDetectionParams.myTeleportHeadOrFeetPositionMustBeVisible = true;

                params.myDetectionParams.myTeleportParableStartReferenceObject = this._myParams.myTeleportParableStartReferenceObject;

                params.myDetectionParams.myVisibilityBlockLayerFlags.copy(params.myDetectionParams.myTeleportBlockLayerFlags);

                params.myDetectionParams.myPlayerTransformManagerMustBeSyncedFlagMap.set(PlayerTransformManagerSyncFlag.HEAD_COLLIDING, false);

                params.myDetectionParams.myPositionRealMaxDistance = 0.4;
                params.myDetectionParams.myPositionHeadRealMaxDistance = 0.03;

                params.myDetectionParams.myPositionHeadMustBeValid = true;

                params.myTeleportParams.myTeleportType = this._myParams.myTeleportType;

                params.myVisualizerParams.myTeleportPositionObject = this._myParams.myTeleportPositionObject;
                params.myVisualizerParams.myTeleportValidMaterial = this._myParams.myTeleportValidMaterial;
                params.myVisualizerParams.myTeleportInvalidMaterial = this._myParams.myTeleportInvalidMaterial;
                params.myVisualizerParams.myTeleportPositionObjectRotateWithHead = this._myParams.myTeleportPositionObjectRotateWithHead;

                params.myPerformTeleportAsMovement = false;
                params.myTeleportAsMovementRemoveVerticalMovement = true;
                params.myTeleportAsMovementExtraVerticalMovementPerMeter = -2;

                params.myGravityAcceleration = this._myParams.myGravityAcceleration;
                params.myMaxGravitySpeed = this._myParams.myMaxGravitySpeed;

                params.myDebugEnabled = false;
                params.myDebugDetectEnabled = true;
                params.myDebugShowEnabled = true;
                params.myDebugVisibilityEnabled = false;

                this._myPlayerLocomotionTeleport = new PlayerLocomotionTeleport(params, movementRuntimeParams);
            }

            this._myPlayerTransformManager.setPlayerLocomotionTeleport(this._myPlayerLocomotionTeleport);

            {
                const params = new PlayerObscureManagerParams(this._myParams.myEngine as any);

                params.myPlayerTransformManager = this._myPlayerTransformManager;
                params.myPlayerLocomotionTeleport = this._myPlayerLocomotionTeleport;

                params.myEnabled = this._myParams.myViewOcclusionInsideWallsEnabled;

                params.myObscureObject = null;
                params.myObscureMaterial = null;
                params.myObscureRadius = 0.5;

                params.myObscureFadeOutSeconds = 0.1;
                params.myObscureFadeInSeconds = 0.25;

                params.myObscureFadeEasingFunction = EasingFunction.linear;
                params.myObscureLevelRelativeDistanceEasingFunction = EasingFunction.linear;

                params.myObscureIfPositionHeadNotValid = true;

                params.myDistanceToStartObscureWhenBodyColliding = 0.75;
                params.myDistanceToStartObscureWhenHeadColliding = 0;
                params.myDistanceToStartObscureWhenFloating = 0.75;
                params.myDistanceToStartObscureWhenFar = 0.75;

                params.myRelativeDistanceToMaxObscureWhenBodyColliding = 0.5;
                params.myRelativeDistanceToMaxObscureWhenHeadColliding = 0.05;
                params.myRelativeDistanceToMaxObscureWhenFloating = 0.5;
                params.myRelativeDistanceToMaxObscureWhenFar = 0.5;

                this._myPlayerObscureManager = new PlayerObscureManager(params);
            }

        }

        this._setupLocomotionMovementFSM();

        this._myResetRealOnStartCounter = this._myParams.myResetRealOnStartFramesAmount;
    }

    public start(): void {
        this._fixAlmostUp();

        this._myPlayerHeadManager.start();
        this._myPlayerTransformManager.start();

        this._myPlayerObscureManager.start();

        this._myPlayerLocomotionRotate.start();

        if (this._myParams.myDefaultLocomotionType == PlayerLocomotionType.SMOOTH) {
            this._myLocomotionMovementFSM.perform("startSmooth");
        } else {
            this._myLocomotionMovementFSM.perform("startTeleport");
        }

        this._myStarted = true;

        const currentActive = this._myActive;
        this._myActive = !this._myActive;
        this.setActive(currentActive);
    }

    /** #WARN Only a few params are actually used by this class after the setup phase, like @myCollisionCheckDisabled
        Params like @myMaxSpeed must be edited directly on the PlayerLocomotionSmooth object*/
    public getParams(): PlayerLocomotionParams {
        return this._myParams;
    }

    public setActive(active: boolean): void {
        if (this._myActive != active) {
            this._myActive = active;

            if (this._myStarted) {
                if (this._myActive) {
                    this._myPlayerObscureManager.start();
                    if (!this._myIdle) {
                        this._myLocomotionMovementFSM.perform("resume");
                    }
                } else {
                    this._myLocomotionMovementFSM.perform("idle");
                    this._myPlayerObscureManager.stop();
                }
            }
        }

        this._myPlayerHeadManager.setActive(this._myActive);
        this._myPlayerTransformManager.setActive(this._myActive);
        this._myPlayerObscureManager.setActive(this._myActive);
        this._myPlayerLocomotionSmooth.setActive(this._myActive);
        this._myPlayerLocomotionTeleport.setActive(this._myActive);
    }

    public isStarted(): boolean {
        return this._myStarted;
    }

    public canStop(): boolean {
        let canStop = false;

        if (this._myLocomotionMovementFSM.isInState("smooth") && this._myPlayerLocomotionSmooth.canStop()) {
            canStop = true;
        } else if (this._myLocomotionMovementFSM.isInState("teleport") && this._myPlayerLocomotionTeleport.canStop()) {
            canStop = true;
        }

        return canStop;
    }

    public update(dt: number): void {
        if (!this._myActive) return;

        this._myPreUpdateEmitter.notify(dt, this);

        let collisionCheckEnabledBackup = false;
        let maxGravitySpeedBackup = 0;
        if (this._myParams.myCollisionCheckDisabled && Globals.isDebugEnabled(this._myParams.myEngine)) {
            collisionCheckEnabledBackup = CollisionCheckBridge.isCollisionCheckDisabled();
            maxGravitySpeedBackup = this.getPlayerLocomotionSmooth().getParams().myMaxGravitySpeed;
            CollisionCheckBridge.setCollisionCheckDisabled(true);
            this.getPlayerLocomotionSmooth().getParams().myMaxGravitySpeed = 0;
        }

        this._myPlayerHeadManager.update(dt);

        if (this._myParams.myResetRealOnStart && this._myResetRealOnStartCounter > 0) {
            this._myResetRealOnStartCounter--;

            this._myPlayerTransformManager.resetReal(true, true, undefined, undefined, undefined, true);
            this._myPlayerTransformManager.update(dt);
        } else {
            this._myPlayerTransformManager.update(dt);

            if (!this._myPlayerLocomotionSmooth.isDebugFlyEnabled() || !Globals.isDebugEnabled(this._myParams.myEngine)) {
                if (!this._myParams.myAlwaysSmoothForNonVR || XRUtils.isSessionActive(this._myParams.myEngine)) {
                    if (this._myParams.mySwitchLocomotionTypeShortcutEnabled &&
                        this._getMainHandGamepad().getButtonInfo(GamepadButtonID.THUMBSTICK).isPressEnd(2)) {
                        if (this._myLocomotionMovementFSM.isInState("smooth") && this._myPlayerLocomotionSmooth.canStop()) {
                            this._myLocomotionMovementFSM.perform("next");
                        } else if (this._myLocomotionMovementFSM.isInState("teleport") && this._myPlayerLocomotionTeleport.canStop()) {
                            this._myLocomotionMovementFSM.perform("next");
                        }
                    }
                }

                if (this._myParams.myAlwaysSmoothForNonVR && !XRUtils.isSessionActive(this._myParams.myEngine)) {
                    if (this._myLocomotionMovementFSM.isInState("teleport") && this._myPlayerLocomotionTeleport.canStop()) {
                        this._mySwitchToTeleportOnEnterSession = true;
                        this._myLocomotionMovementFSM.perform("next");
                    }
                } else if (this._mySwitchToTeleportOnEnterSession && XRUtils.isSessionActive(this._myParams.myEngine)) {
                    if (this._myLocomotionMovementFSM.isInState("smooth") && this._myPlayerLocomotionSmooth.canStop()) {
                        this._mySwitchToTeleportOnEnterSession = false;
                        this._myLocomotionMovementFSM.perform("next");
                    }
                }
            }

            if (this._myParams.myDebugFlyShortcutEnabled && Globals.isDebugEnabled(this._myParams.myEngine)) {
                if (GamepadUtils.areButtonsPressEnd([this._getMainHandGamepad(), GamepadButtonID.SELECT, GamepadButtonID.THUMBSTICK])) {
                    if (this._myLocomotionMovementFSM.isInState("teleport") && this._myPlayerLocomotionTeleport.canStop()) {
                        this._myLocomotionMovementFSM.perform("next");
                    }

                    if (this._myLocomotionMovementFSM.isInState("smooth")) {
                        this._myPlayerLocomotionSmooth.setDebugFlyEnabled(!this._myPlayerLocomotionSmooth.isDebugFlyEnabled());
                        this._mySwitchToTeleportOnEnterSession = false;
                    }
                }
            }

            if (this._myPlayerHeadManager.isSynced()) {
                if (!this._myIdle) {
                    this._myPlayerLocomotionRotate.update(dt);
                    this._myLocomotionMovementFSM.update(dt);
                }
            }
        }

        if (this._myParams.mySyncHeadWithRealAfterLocomotionUpdateIfNeeded) {
            this._myPlayerTransformManager.updateValidHeadToRealHeadIfNeeded();
        }

        this._myPlayerObscureManager.update(dt);

        if (this._myParams.myCollisionCheckDisabled && Globals.isDebugEnabled(this._myParams.myEngine)) {
            CollisionCheckBridge.setCollisionCheckDisabled(collisionCheckEnabledBackup);
            this.getPlayerLocomotionSmooth().getParams().myMaxGravitySpeed = maxGravitySpeedBackup;
        }

        this._myPostUpdateEmitter.notify(dt, this);
    }

    public setIdle(idle: boolean): void {
        this._myIdle = idle;

        if (idle) {
            this._myLocomotionMovementFSM.perform("idle");
        } else {
            this._myLocomotionMovementFSM.perform("resume");
        }
    }

    public getPlayerLocomotionSmooth(): PlayerLocomotionSmooth {
        return this._myPlayerLocomotionSmooth;
    }

    public getPlayerLocomotionTeleport(): PlayerLocomotionTeleport {
        return this._myPlayerLocomotionTeleport;
    }

    public getPlayerTransformManager(): PlayerTransformManager {
        return this._myPlayerTransformManager;
    }

    public getPlayerLocomotionRotate(): PlayerLocomotionRotate {
        return this._myPlayerLocomotionRotate;
    }

    public getPlayerHeadManager(): PlayerHeadManager {
        return this._myPlayerHeadManager;
    }

    public getPlayerObscureManager(): PlayerObscureManager {
        return this._myPlayerObscureManager;
    }

    public registerPreUpdateCallback(id: unknown, callback: (dt: number, playerLocomotion: PlayerLocomotion) => void): void {
        this._myPreUpdateEmitter.add(callback, { id: id });
    }

    public unregisterPreUpdateCallback(id: unknown): void {
        this._myPreUpdateEmitter.remove(id);
    }

    public registerPostUpdateCallback(id: unknown, callback: (dt: number, playerLocomotion: PlayerLocomotion) => void): void {
        this._myPostUpdateEmitter.add(callback, { id: id });
    }

    public unregisterPostUpdateCallback(id: unknown): void {
        this._myPostUpdateEmitter.remove(id);
    }

    private _setupCollisionCheckParamsMovement(): CollisionCheckParams {
        const simplifiedParams = new CharacterColliderSetupSimplifiedCreationParams();

        simplifiedParams.myHeight = this._myParams.myDefaultHeight;
        simplifiedParams.myRadius = this._myParams.myCharacterRadius;

        simplifiedParams.myAccuracyLevel = this._myParams.myColliderAccuracy;

        simplifiedParams.myIsPlayer = true;

        simplifiedParams.myCheckOnlyFeet = this._myParams.myColliderCheckOnlyFeet;

        simplifiedParams.myCanFly = this._myParams.myFlyEnabled;

        simplifiedParams.myShouldSlideAlongWall = this._myParams.myColliderSlideAlongWall;

        simplifiedParams.myCollectGroundInfo = true;
        simplifiedParams.myMaxWalkableGroundAngle = this._myParams.myColliderMaxWalkableGroundAngle;
        simplifiedParams.myShouldSnapOnGround = this._myParams.myColliderSnapOnGround;
        simplifiedParams.myMaxDistanceToSnapOnGround = this._myParams.myColliderMaxDistanceToSnapOnGround;
        simplifiedParams.myMaxWalkableGroundStepHeight = this._myParams.myColliderMaxWalkableGroundStepHeight;
        simplifiedParams.myShouldNotFallFromEdges = this._myParams.myColliderPreventFallingFromEdges;
        simplifiedParams.myMaxMovementSteps = this._myParams.myColliderMaxMovementSteps;

        simplifiedParams.myHorizontalCheckBlockLayerFlags.copy(this._myParams.myPhysicsBlockLayerFlags);
        const physXComponents = Globals.getPlayerObjects(this._myParams.myEngine)!.myPlayer!.pp_getComponents(PhysXComponent);
        for (const physXComponent of physXComponents) {
            simplifiedParams.myHorizontalCheckObjectsToIgnore.pp_pushUnique(physXComponent.object, (first, second) => first == second);
        }
        simplifiedParams.myVerticalCheckBlockLayerFlags.copy(simplifiedParams.myHorizontalCheckBlockLayerFlags);
        simplifiedParams.myVerticalCheckObjectsToIgnore.pp_copy(simplifiedParams.myHorizontalCheckObjectsToIgnore);

        simplifiedParams.myHorizontalCheckDebugEnabled = this._myParams.myDebugHorizontalEnabled;
        simplifiedParams.myVerticalCheckDebugEnabled = this._myParams.myDebugVerticalEnabled;

        const colliderSetup = CharacterColliderSetupUtils.createSimplified(simplifiedParams);

        return CollisionCheckBridge.convertCharacterColliderSetupToCollisionCheckParams(colliderSetup);
    }

    private _fixAlmostUp(): void {
        // Get rotation on y and adjust if it's slightly tilted when it's almsot 0,1,0

        const defaultUp = vec3_create(0, 1, 0);
        const angleWithDefaultUp = (Globals.getPlayerObjects(this._myParams.myEngine)!.myPlayer!.pp_getUp()).vec3_angle(defaultUp);
        if (angleWithDefaultUp < 1) {
            const forward = Globals.getPlayerObjects(this._myParams.myEngine)!.myPlayer!.pp_getForward();
            const flatForward = forward.vec3_clone();
            flatForward[1] = 0;

            const defaultForward = vec3_create(0, 0, 1);
            const angleWithDefaultForward = defaultForward.vec3_angleSigned(flatForward, defaultUp);

            Globals.getPlayerObjects(this._myParams.myEngine)!.myPlayer!.pp_resetRotation();
            Globals.getPlayerObjects(this._myParams.myEngine)!.myPlayer!.pp_rotateAxis(angleWithDefaultForward, defaultUp);
        }
    }

    private _setupLocomotionMovementFSM(): void {
        //this._myLocomotionMovementFSM.setLogEnabled(true, "Locomotion Movement");

        this._myLocomotionMovementFSM.addState("init");
        this._myLocomotionMovementFSM.addState("smooth", (dt: number) => this._myPlayerLocomotionSmooth.update(dt));
        this._myLocomotionMovementFSM.addState("teleport", (dt: number) => this._myPlayerLocomotionTeleport.update(dt));
        this._myLocomotionMovementFSM.addState("idleSmooth");
        this._myLocomotionMovementFSM.addState("idleTeleport");

        this._myLocomotionMovementFSM.addTransition("init", "smooth", "startSmooth", function (this: PlayerLocomotion) {
            this._myPlayerLocomotionTeleport.stop();
            this._myPlayerLocomotionSmooth.start();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("init", "teleport", "startTeleport", function (this: PlayerLocomotion) {
            this._myPlayerLocomotionSmooth.stop();
            this._myPlayerLocomotionTeleport.start();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("smooth", "teleport", "next", function (this: PlayerLocomotion) {
            this._myPlayerLocomotionSmooth.stop();
            this._myPlayerLocomotionTeleport.start();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("teleport", "smooth", "next", function (this: PlayerLocomotion) {
            this._myPlayerLocomotionTeleport.stop();
            this._myPlayerLocomotionSmooth.start();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("smooth", "idleSmooth", "idle", function (this: PlayerLocomotion) {
            this._myPlayerLocomotionSmooth.stop();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("teleport", "idleTeleport", "idle", function (this: PlayerLocomotion) {
            this._myPlayerLocomotionTeleport.stop();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("idleSmooth", "smooth", "resume", function (this: PlayerLocomotion) {
            this._myPlayerLocomotionSmooth.start();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("idleTeleport", "teleport", "resume", function (this: PlayerLocomotion) {
            this._myPlayerLocomotionTeleport.start();
        }.bind(this));

        this._myLocomotionMovementFSM.init("init");
    }

    private _getMainHandGamepad(): Gamepad {
        return Globals.getGamepads(this._myParams.myEngine)![this._myParams.myMainHand];
    }

    public destroy(): void {
        this._myDestroyed = true;

        this._myPlayerHeadManager.destroy();
        this._myPlayerLocomotionSmooth.destroy();
        this._myPlayerTransformManager.destroy();
        this._myPlayerObscureManager.destroy();
        this._myPlayerLocomotionTeleport.destroy();
    }

    public isDestroyed(): boolean {
        return this._myDestroyed;
    }
}