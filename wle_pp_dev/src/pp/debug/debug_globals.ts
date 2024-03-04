import { WonderlandEngine } from "@wonderlandengine/api";
import { Globals } from "../pp/globals.js";
import { DebugManager } from "./debug_manager.js";
import { DebugVisualManager } from "./debug_visual_manager.js";

const _myDebugManagers: WeakMap<WonderlandEngine, DebugManager> = new WeakMap();
const _myDebugEnableds: WeakMap<WonderlandEngine, boolean> = new WeakMap();

export function getDebugManager(engine: WonderlandEngine | null = Globals.getMainEngine()): DebugManager | null {
    if (engine == null) return null;

    const debugManager = _myDebugManagers.get(engine);
    return debugManager != null ? debugManager : null;
}

export function setDebugManager(debugManager: DebugManager, engine: WonderlandEngine | null = Globals.getMainEngine()): void {
    if (engine != null) {
        _myDebugManagers.set(engine, debugManager);
    }
}

export function removeDebugManager(engine: WonderlandEngine | null = Globals.getMainEngine()): void {
    if (engine != null) {
        _myDebugManagers.delete(engine);
    }
}

export function hasDebugManager(engine: WonderlandEngine | null = Globals.getMainEngine()): boolean {
    return engine != null ? _myDebugManagers.has(engine) : false;
}

export function getDebugVisualManager(engine: WonderlandEngine | null = Globals.getMainEngine()): DebugVisualManager | null {
    const debugManager = getDebugManager(engine);

    if (debugManager != null) {
        return debugManager.getDebugVisualManager();
    }

    return null;
}

export function isDebugEnabled(engine: WonderlandEngine | null = Globals.getMainEngine()): boolean {
    return engine != null ? !!_myDebugEnableds.get(engine) : false;
}

export function setDebugEnabled(debugEnabled: boolean, engine: WonderlandEngine | null = Globals.getMainEngine()): void {
    if (engine != null) {
        _myDebugEnableds.set(engine, debugEnabled);
    }
}

export function removeDebugEnabled(engine: WonderlandEngine | null = Globals.getMainEngine()): void {
    if (engine != null) {
        _myDebugEnableds.delete(engine);
    }
}

export function hasDebugEnabled(engine: WonderlandEngine | null = Globals.getMainEngine()): boolean {
    return engine != null ? _myDebugEnableds.has(engine) : false;
}