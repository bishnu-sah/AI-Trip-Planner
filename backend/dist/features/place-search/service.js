"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceService = void 0;
class PlaceService {
    placesAdapter;
    constructor(placesAdapter) {
        this.placesAdapter = placesAdapter;
    }
    async search(keyword) {
        return this.placesAdapter.search(keyword);
    }
}
exports.PlaceService = PlaceService;
