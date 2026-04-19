"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceController = void 0;
class PlaceController {
    placeService;
    constructor(placeService) {
        this.placeService = placeService;
    }
    search = async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'q is required' });
        }
        const results = await this.placeService.search(String(q));
        res.json(results);
    };
}
exports.PlaceController = PlaceController;
