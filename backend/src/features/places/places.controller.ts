import { Request, Response } from 'express';
import { PlaceModel } from './place.model';
import { IAIAdapter } from '../../domain/interfaces/adapters';

export class PlacesController {
    constructor(private readonly aiAdapter: IAIAdapter) { }

    searchPlaces = async (req: Request, res: Response) => {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.status(400).json({ message: 'Query parameter "q" is required' });
            }

            const searchTerm = q.trim().toLowerCase();

            // 1. Check Cache (Database)
            try {
                const place = await PlaceModel.findOne({ searchQuery: searchTerm });
                if (place) {
                    console.log(`[Cache Hit] Place: ${searchTerm}`);
                    return res.json(place);
                }
            } catch (dbError: any) {
                console.warn('DB Error accessing PlaceModel (continuing to generate):', dbError.message);
            }

            console.log(`[Cache Miss] Generating for: ${searchTerm}`);

            // 2. Generate content with AI Adapter
            const prompt = `
        User searches for a place named "${q}".
        Provide a JSON object with the following fields:
        - name: Formal name of the place (e.g. "Paris", "Eiffel Tower").
        - country: Country name (or "N/A" if not applicable).
        - description: A captivating 4-5 sentence description enticing a tourist.
        - nearbyPlaces: An array of 5 popular tourist spots or hidden gems near this location.
        - hotels: An array of 5 recommended hotels near this place. Each hotel should have:
          - name
          - rating (e.g. "4.8/5")
          - priceLevel (e.g. "$$$")
          - description (1-2 helpful sentences)
        
        Output ONLY raw JSON. No markdown formatting. No code blocks.
      `;

            const responseText = await this.aiAdapter.complete(prompt);

            // Clean up potential markdown code blocks (```json ... ```)
            let cleanedText = responseText.trim();
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            let generatedData;
            try {
                generatedData = JSON.parse(cleanedText);
            } catch (e) {
                // Fallback for messy JSON
                const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    generatedData = JSON.parse(jsonMatch[0]);
                } else {
                    console.error('Failed to parse AI response:', responseText);
                    return res.status(500).json({ message: 'Failed to generate place info due to AI format error', details: responseText });
                }
            }

            const imageUrl = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(generatedData.name)},travel`;

            // 4. Save to DB
            try {
                const newPlace = new PlaceModel({
                    searchQuery: searchTerm,
                    name: generatedData.name,
                    country: generatedData.country,
                    description: generatedData.description,
                    imageUrl: imageUrl,
                    nearbyPlaces: generatedData.nearbyPlaces || [],
                    hotels: generatedData.hotels
                });

                await newPlace.save();
                return res.json(newPlace);
            } catch (saveError: any) {
                console.error('Failed to save place to DB:', saveError);
                return res.json({
                    ...generatedData,
                    imageUrl,
                    _warning: 'Not saved to database'
                });
            }

        } catch (error: any) {
            console.error('Error in searchPlaces:', error);
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    };
}
