"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrap_1 = require("../bootstrap");
const seed = async () => {
    const { container } = (0, bootstrap_1.createApp)();
    const tripService = container.resolve('TripService');
    const paris = { id: 'paris', name: 'Paris', country: 'France', coordinates: { lat: 48.85, lng: 2.35 } };
    const rome = { id: 'rome', name: 'Rome', country: 'Italy', coordinates: { lat: 41.9, lng: 12.5 } };
    await tripService.generateTrip('London', [paris, rome], 4);
    await tripService.generateTrip('Berlin', [rome], 2);
    console.log('Seed complete with demo trips in memory.');
};
seed();
