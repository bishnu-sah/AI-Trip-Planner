"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelController = void 0;
class HotelController {
    hotelService;
    constructor(hotelService) {
        this.hotelService = hotelService;
    }
    sample = async (_req, res) => {
        try {
            const results = await this.hotelService.recommendHotels('Delhi', 'Near Taj Mahal');
            res.json(results);
        }
        catch (error) {
            console.error('[HotelController] Error in sample:', error);
            res.status(500).json({ message: 'Failed to get hotel recommendations', error: error?.message });
        }
    };
    recommend = async (req, res) => {
        try {
            const { city, location } = req.query;
            if (!city) {
                return res.status(400).json({ message: 'city query parameter required' });
            }
            const results = await this.hotelService.recommendHotels(String(city), location ? String(location) : undefined);
            res.json(results);
        }
        catch (error) {
            console.error('[HotelController] Error in recommend:', error);
            res.status(500).json({ message: 'Failed to get hotel recommendations', error: error?.message });
        }
    };
}
exports.HotelController = HotelController;
