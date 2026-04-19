import mongoose, { Schema, Document } from 'mongoose';

export interface IHotel {
    name: string;
    rating?: string;
    priceLevel?: string;
    description?: string;
    externalLink?: string;
}

export interface IPlace extends Document {
    name: string;
    searchQuery: string;
    description: string;
    country: string;
    imageUrl?: string;
    nearbyPlaces: string[];
    hotels: IHotel[];
    createdAt: Date;
    updatedAt: Date;
}

const HotelSchema = new Schema<IHotel>({
    name: { type: String, required: true },
    rating: { type: String },
    priceLevel: { type: String },
    description: { type: String },
    externalLink: { type: String }
});

const PlaceSchema = new Schema<IPlace>(
    {
        name: { type: String, required: true },
        searchQuery: { type: String, required: true, unique: true, index: true },
        description: { type: String, required: true },
        country: { type: String },
        imageUrl: { type: String },
        nearbyPlaces: [{ type: String }],
        hotels: [HotelSchema]
    },
    { timestamps: true }
);

export const PlaceModel = mongoose.model<IPlace>('Place', PlaceSchema);
