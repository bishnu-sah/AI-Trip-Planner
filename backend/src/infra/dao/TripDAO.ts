import mongoose, { Schema, Model } from 'mongoose';
import { Trip, TripDay, Place } from '../../domain/models';

export interface ITripDocument extends mongoose.Document {
  tripId?: string;
  userId?: string; // Associate trip with user
  title: string;
  travelerName: string;
  budget?: string;
  budgetEstimate?: {
    total: string;
    currency: string;
    breakdown: Array<{ category: string; amount: string; description: string }>;
  };
  status: 'draft' | 'confirmed';
  days: Array<{
    date: string;
    places: Array<{
      id: string;
      name: string;
      country: string;
      coordinates: { lat: number; lng: number };
    }>;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const placeSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  }
}, { _id: false });

const tripDaySchema = new Schema({
  date: { type: String, required: true },
  places: [placeSchema],
  notes: { type: String }
}, { _id: false });

const tripSchema = new Schema<ITripDocument>(
  {
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
    budget: {
      type: String,
      trim: true
    },
    budgetEstimate: {
      total: String,
      currency: String,
      breakdown: [{
        category: String,
        amount: String,
        description: String
      }]
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed'],
      default: 'draft'
    },
    days: [tripDaySchema]
  },
  {
    timestamps: true
  }
);

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
let _TripModel: Model<ITripDocument> | null = null;

export const getTripModel = (): Model<ITripDocument> => {
  if (_TripModel) {
    return _TripModel;
  }

  // Check if mongoose is connected (1 = connected)
  const currentState = Number(mongoose.connection.readyState);
  if (currentState !== 1) {
    throw new Error(`Cannot create TripModel: MongoDB not connected (state: ${currentState})`);
  }

  // Use existing model if available, otherwise create new one
  try {
    _TripModel = mongoose.models.Trip || mongoose.model<ITripDocument>('Trip', tripSchema);
  } catch (error: any) {
    throw new Error(`Failed to create TripModel: ${error?.message}`);
  }

  return _TripModel;
};

// Don't export TripModel directly - it would try to create the model at module load time
// Use getTripModel() instead, which only creates the model when MongoDB is connected
// For any code that needs TripModel, they should use getTripModel()

