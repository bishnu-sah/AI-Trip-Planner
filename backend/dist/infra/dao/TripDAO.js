"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const placeSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    }
}, { _id: false });
const tripDaySchema = new mongoose_1.Schema({
    date: { type: String, required: true },
    places: [placeSchema],
    notes: { type: String }
}, { _id: false });
const tripSchema = new mongoose_1.Schema({
    tripId: {
        type: String,
        unique: true,
        sparse: true // Allow null/undefined
    },
    userId: {
        type: String,
        index: true, // Index for faster queries
        sparse: true // Allow null/undefined for backward compatibility
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    travelerName: {
        type: String,
        required: true,
        default: 'Traveler'
    },
    status: {
        type: String,
        enum: ['draft', 'confirmed'],
        default: 'draft'
    },
    days: [tripDaySchema]
}, {
    timestamps: true
});
// Use the existing id field as _id, or generate one
tripSchema.virtual('id').get(function () {
    return this._id.toString();
});
tripSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        // Use tripId if available, otherwise use _id
        ret.id = ret.tripId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        // Keep tripId for reference but use id as primary
        return ret;
    }
});
// Lazy model creation - only create when needed and MongoDB is connected
let _TripModel = null;
const getTripModel = () => {
    if (_TripModel) {
        return _TripModel;
    }
    // Check if mongoose is connected (1 = connected)
    const currentState = Number(mongoose_1.default.connection.readyState);
    if (currentState !== 1) {
        throw new Error(`Cannot create TripModel: MongoDB not connected (state: ${currentState})`);
    }
    // Use existing model if available, otherwise create new one
    try {
        _TripModel = mongoose_1.default.models.Trip || mongoose_1.default.model('Trip', tripSchema);
    }
    catch (error) {
        throw new Error(`Failed to create TripModel: ${error?.message}`);
    }
    return _TripModel;
};
exports.getTripModel = getTripModel;
// Don't export TripModel directly - it would try to create the model at module load time
// Use getTripModel() instead, which only creates the model when MongoDB is connected
// For any code that needs TripModel, they should use getTripModel()
