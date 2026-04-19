"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDistanceAdapter = void 0;
class MockDistanceAdapter {
    async estimateDays(count) {
        return Math.max(1, Math.ceil(count / 3));
    }
}
exports.MockDistanceAdapter = MockDistanceAdapter;
