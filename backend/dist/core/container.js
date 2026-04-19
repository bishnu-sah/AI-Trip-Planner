"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.Container = void 0;
// Lightweight DI container to support swap-able implementations per interface key.
class Container {
    registry = new Map();
    register(token, instance) {
        this.registry.set(token, instance);
    }
    resolve(token) {
        if (!this.registry.has(token)) {
            throw new Error(`No provider registered for token ${token}`);
        }
        return this.registry.get(token);
    }
}
exports.Container = Container;
exports.container = new Container();
