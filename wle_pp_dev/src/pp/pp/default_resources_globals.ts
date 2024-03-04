import { WonderlandEngine } from "@wonderlandengine/api";
import { DefaultResources, DefaultResourcesMaterials, DefaultResourcesMeshes } from "./default_resources.js";
import { Globals } from "./globals.js";

const _myDefaultResourcesContainer: WeakMap<WonderlandEngine, DefaultResources> = new WeakMap();

export function getDefaultResources(engine: WonderlandEngine | null = Globals.getMainEngine()): DefaultResources | null {
    if (engine == null) return null;

    const defaultResources = _myDefaultResourcesContainer.get(engine);
    return defaultResources != null ? defaultResources : null;
}

export function setDefaultResources(defaultResources: DefaultResources, engine: WonderlandEngine | null = Globals.getMainEngine()): void {
    if (engine != null) {
        _myDefaultResourcesContainer.set(engine, defaultResources);
    }
}

export function removeDefaultResources(engine: WonderlandEngine | null = Globals.getMainEngine()): void {
    if (engine != null) {
        _myDefaultResourcesContainer.delete(engine);
    }
}

export function hasDefaultResources(engine: WonderlandEngine | null = Globals.getMainEngine()): boolean {
    return engine != null ? _myDefaultResourcesContainer.has(engine) : false;
}

export function getDefaultMeshes(engine: WonderlandEngine | null = Globals.getMainEngine()): DefaultResourcesMeshes | null {
    const defaultResources = getDefaultResources(engine);

    if (defaultResources != null) {
        return defaultResources.myMeshes;
    }

    return null;
}

export function getDefaultMaterials(engine: WonderlandEngine | null = Globals.getMainEngine()): DefaultResourcesMaterials | null {
    const defaultResources = getDefaultResources(engine);

    if (defaultResources != null) {
        return defaultResources.myMaterials;
    }

    return null;
}