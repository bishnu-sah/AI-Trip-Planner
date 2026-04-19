"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealDistanceAdapter = void 0;
class RealDistanceAdapter {
    apiKey;
    constructor(apiKey = process.env.DISTANCE_API_KEY || '') {
        this.apiKey = apiKey;
    }
    async estimateDays(count) {
        // TODO: perform real distance matrix call.
        console.warn('RealDistanceAdapter not implemented; defaulting to mock estimation.');
        return Math.max(1, Math.ceil(count / 2));
    }
}
exports.RealDistanceAdapter = RealDistanceAdapter;
