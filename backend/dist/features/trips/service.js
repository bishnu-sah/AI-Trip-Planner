"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripService = void 0;
const uuid_1 = require("uuid");
class TripService {
    tripDao;
    aiAdapter;
    placesAdapter;
    distanceAdapter;
    constructor(tripDao, aiAdapter, placesAdapter, distanceAdapter) {
        this.tripDao = tripDao;
        this.aiAdapter = aiAdapter;
        this.placesAdapter = placesAdapter;
        this.distanceAdapter = distanceAdapter;
    }
    async generateTrip(origin, destinations, days, userId) {
        const adjustedDays = await this.distanceAdapter.estimateDays(destinations.length || 1);
        const finalDays = Math.max(days, adjustedDays);
        // Create detailed prompt for AI to generate real itinerary
        const destinationsList = destinations.map((d) => `${d.name} (${d.country})`).join(', ');
        const startDate = new Date().toISOString().split('T')[0];
        // Build dates for all days
        const dates = Array.from({ length: finalDays }).map((_, idx) => new Date(Date.now() + idx * 86400000).toISOString().split('T')[0]);
        const prompt = `You are an expert travel planner specializing in Indian destinations. Create a detailed ${finalDays}-day travel itinerary.

TRIP DETAILS:
- Starting point: ${origin}
- Destinations to visit: ${destinationsList}
- Number of days: ${finalDays}
- Start date: ${startDate}

CRITICAL REQUIREMENTS:
1. Create a creative, engaging trip title (max 60 characters) that reflects the journey
2. For EACH of the ${finalDays} days, provide:
   - REAL specific places to visit (use actual names of monuments, temples, markets, parks, etc. in ${destinationsList})
   - REAL activities and experiences (be specific: "Visit Taj Mahal at sunrise", "Explore local bazaar", "Try street food")
   - Detailed notes with travel tips, best times to visit, what to expect, cultural insights, and practical advice
   - Make each day unique and realistic

IMPORTANT RULES:
- Use ONLY real place names from Indian destinations
- Be specific about activities (not generic like "Activity 1")
- Include practical details: opening hours, entry fees, travel time between places
- Add cultural context and local insights
- Make it realistic and actionable
- You MUST respond with ONLY valid JSON - no markdown, no code blocks, no explanations

JSON FORMAT - respond with this exact structure:
{
  "title": "Your creative trip title here",
  "days": [
    {
      "day": 1,
      "date": "${dates[0]}",
      "places": ["Real Place Name 1", "Real Place Name 2"],
      "activities": ["Specific Activity 1", "Specific Activity 2"],
      "notes": "Detailed notes for Day 1 with travel tips, best times, cultural insights, and practical advice. Be specific and helpful."
    },
    {
      "day": 2,
      "date": "${dates[1] || dates[0]}",
      "places": ["Real Place Name 3", "Real Place Name 4"],
      "activities": ["Specific Activity 3", "Specific Activity 4"],
      "notes": "Detailed notes for Day 2..."
    }
  ]
}

Generate all ${finalDays} days. Use real Indian place names and specific activities. Make it authentic and detailed.`;
        try {
            console.log(`[TripService] Generating trip: ${origin} -> ${destinationsList}, ${finalDays} days`);
            console.log(`[TripService] Using AI adapter: ${this.aiAdapter.constructor.name}`);
            // Check if using Mock adapter
            if (this.aiAdapter.constructor.name === 'MockAIAdapter') {
                console.warn('[TripService] ⚠️  WARNING: Using MOCK AI adapter - data will be placeholder!');
                console.warn('[TripService] To get real AI data, set AI_ADAPTER=real and GEMINI_API_KEY in .env');
            }
            let aiResponse;
            try {
                console.log('[TripService] Calling AI adapter with prompt...');
                // Add minimum delay to show AI is working (1-2 seconds)
                const startTime = Date.now();
                aiResponse = await this.aiAdapter.complete(prompt);
                const elapsed = Date.now() - startTime;
                // Ensure minimum 1.5 second delay for UX to show AI is working
                if (elapsed < 1500) {
                    await new Promise(resolve => setTimeout(resolve, 1500 - elapsed));
                }
                console.log('[TripService] ✅ AI response received');
                console.log('[TripService] Response length:', aiResponse.length, 'chars');
                console.log('[TripService] Response (first 800 chars):', aiResponse.substring(0, 800));
                if (aiResponse.length > 800) {
                    console.log('[TripService] Response (last 500 chars):', aiResponse.substring(Math.max(0, aiResponse.length - 500)));
                }
            }
            catch (aiError) {
                console.error('[TripService] ❌ AI generation failed:', aiError?.message);
                console.error('[TripService] Error details:', aiError);
                console.error('[TripService] Error stack:', aiError?.stack);
                // Check if it's an API key issue - throw to be handled by controller
                if (aiError?.message?.includes('GEMINI_API_KEY') ||
                    aiError?.message?.includes('API key') ||
                    aiError?.message?.includes('API_KEY_INVALID') ||
                    aiError?.status === 401) {
                    console.error('[TripService] API key error detected - throwing to controller');
                    throw new Error('AI API key is invalid or missing. Please check your GEMINI_API_KEY in .env file and restart the server.');
                }
                // Check if it's a network/API error - throw to be handled by controller
                if (aiError?.message?.includes('Failed to generate') ||
                    aiError?.message?.includes('network') ||
                    aiError?.code === 'ECONNREFUSED') {
                    throw new Error(`AI service error: ${aiError.message}. Please check your internet connection and API key.`);
                }
                // For other errors, use fallback (but don't include error in notes)
                console.warn('[TripService] Using fallback trip structure due to AI error');
                const fallbackTrip = {
                    id: (0, uuid_1.v4)(),
                    userId: userId, // Associate trip with user
                    title: `${days}-Day Trip to ${destinations.map(d => d.name).join(', ')}`,
                    travelerName: 'Traveler',
                    status: 'draft',
                    days: Array.from({ length: finalDays }).map((_, idx) => ({
                        date: dates[idx] || new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
                        places: destinations,
                        notes: `Day ${idx + 1}: Visit ${destinations.map(d => d.name).join(', ')}. Explore the area and enjoy your trip!`
                    })),
                    createdAt: new Date().toISOString()
                };
                await this.tripDao.save(fallbackTrip);
                return fallbackTrip;
            }
            // Try to parse JSON from AI response
            let itineraryData;
            try {
                // Clean the response - remove markdown code blocks if present
                let cleanedResponse = aiResponse.trim();
                if (cleanedResponse.startsWith('```json')) {
                    cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                }
                else if (cleanedResponse.startsWith('```')) {
                    cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }
                // Extract JSON from response (AI might add extra text)
                const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    itineraryData = JSON.parse(jsonMatch[0]);
                    console.log('[TripService] ✅ Successfully parsed AI JSON response');
                    console.log('[TripService] Itinerary title:', itineraryData.title);
                    console.log('[TripService] Number of days in response:', itineraryData.days?.length);
                    // Log first day details to verify real data
                    if (itineraryData.days && itineraryData.days.length > 0) {
                        console.log('[TripService] Day 1 places:', itineraryData.days[0].places);
                        console.log('[TripService] Day 1 activities:', itineraryData.days[0].activities);
                        console.log('[TripService] Day 1 notes preview:', itineraryData.days[0].notes?.substring(0, 100));
                    }
                }
                else {
                    console.error('[TripService] ❌ No JSON found in AI response');
                    console.error('[TripService] Full response:', aiResponse);
                    throw new Error('No JSON found in response');
                }
            }
            catch (parseError) {
                console.warn('[TripService] Failed to parse AI response as JSON:', parseError?.message);
                console.warn('[TripService] Raw response:', aiResponse.substring(0, 500));
                // If parsing fails, create structured itinerary from text
                const lines = aiResponse.split('\n').filter(line => line.trim());
                itineraryData = {
                    title: lines.find(line => line.length < 60 && line.length > 10)?.slice(0, 60) || `Trip to ${destinations.map(d => d.name).join(', ')}`,
                    days: Array.from({ length: finalDays }).map((_, idx) => {
                        const dayLines = lines.slice(idx * 3, (idx + 1) * 3);
                        return {
                            day: idx + 1,
                            date: new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
                            places: destinations.map(d => d.name),
                            activities: [`Explore ${destinations[0]?.name || 'destination'}`],
                            notes: `Day ${idx + 1}: ${dayLines.join(' ').slice(0, 300) || aiResponse.slice(idx * 100, (idx + 1) * 100)}`
                        };
                    })
                };
            }
            // Build the trip with real data from AI
            let tripDays = itineraryData.days || [];
            // Validate AI response has days
            if (!tripDays || tripDays.length === 0) {
                console.warn('[TripService] ⚠️  No days in AI response, creating fallback');
                tripDays = Array.from({ length: finalDays }).map((_, idx) => ({
                    day: idx + 1,
                    date: dates[idx] || new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
                    places: destinations.map(d => d.name),
                    activities: [`Explore ${destinations[0]?.name || 'destination'}`],
                    notes: `Day ${idx + 1}: Visit ${destinations.map(d => d.name).join(', ')}`
                }));
            }
            // Ensure we have exactly finalDays
            while (tripDays.length < finalDays) {
                const lastDay = tripDays[tripDays.length - 1] || {};
                tripDays.push({
                    day: tripDays.length + 1,
                    date: dates[tripDays.length] || new Date(Date.now() + tripDays.length * 86400000).toISOString().split('T')[0],
                    places: lastDay.places || destinations.map(d => d.name),
                    activities: lastDay.activities || [`Explore ${destinations[0]?.name || 'destination'}`],
                    notes: lastDay.notes || `Day ${tripDays.length + 1}: Continue exploring ${destinations.map(d => d.name).join(', ')}`
                });
            }
            // Trim to exact number of days needed
            tripDays = tripDays.slice(0, finalDays);
            console.log('[TripService] Final tripDays count:', tripDays.length);
            console.log('[TripService] First day data:', JSON.stringify(tripDays[0], null, 2));
            const finalTrip = {
                id: (0, uuid_1.v4)(),
                userId: userId, // Associate trip with user
                title: (itineraryData.title || `Trip to ${destinations.map(d => d.name).join(', ')}`).slice(0, 100),
                travelerName: 'Traveler',
                status: 'draft',
                days: tripDays.map((day, idx) => {
                    // Map place names to Place objects - use AI-generated place names
                    const dayPlaces = (day.places || []).map((placeName) => {
                        // Try to find matching destination first
                        const found = destinations.find(d => placeName.toLowerCase().includes(d.name.toLowerCase()) ||
                            d.name.toLowerCase().includes(placeName.toLowerCase()) ||
                            d.name.toLowerCase() === placeName.toLowerCase());
                        if (found) {
                            console.log(`[TripService] Matched "${placeName}" to destination "${found.name}"`);
                            return found;
                        }
                        // If not found, create a new Place object from AI-generated name
                        console.log(`[TripService] Creating new place from AI: "${placeName}"`);
                        return {
                            id: `place-${idx}-${placeName.replace(/\s+/g, '-').toLowerCase()}`,
                            name: placeName,
                            country: destinations[0]?.country || 'India',
                            coordinates: { lat: 0, lng: 0 }
                        };
                    });
                    // If no places from AI, use destinations as fallback
                    const finalPlaces = dayPlaces.length > 0 ? dayPlaces : destinations;
                    // Combine activities and notes from AI
                    const activitiesText = (day.activities && day.activities.length > 0)
                        ? `Activities: ${day.activities.join(', ')}\n\n`
                        : '';
                    const notesText = day.notes || `Day ${idx + 1} itinerary`;
                    const fullNotes = `${activitiesText}${notesText}`.trim();
                    return {
                        date: day.date || dates[idx] || new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
                        places: finalPlaces,
                        notes: fullNotes
                    };
                }),
                createdAt: new Date().toISOString()
            };
            console.log('[TripService] Final trip created:', {
                id: finalTrip.id,
                userId: finalTrip.userId,
                title: finalTrip.title,
                daysCount: finalTrip.days.length
            });
            // Save trip to database (MongoDB if connected, otherwise in-memory)
            console.log('[TripService] Saving trip to database...');
            const savedTrip = await this.tripDao.save(finalTrip);
            console.log('[TripService] ✅ Trip saved successfully:', {
                id: savedTrip.id,
                userId: savedTrip.userId,
                title: savedTrip.title
            });
            return savedTrip;
        }
        catch (error) {
            console.error('[TripService] ❌ Error generating trip with AI:', error);
            console.error('[TripService] Error stack:', error?.stack);
            // If it's an API key error, re-throw it so controller can return proper error
            if (error?.message?.includes('GEMINI_API_KEY') ||
                error?.message?.includes('API key') ||
                error?.message?.includes('API_KEY_INVALID')) {
                throw error; // Re-throw to controller
            }
            // Always return a valid trip object for other errors (but don't include error message in notes)
            const fallbackTrip = {
                id: (0, uuid_1.v4)(),
                userId: userId, // Associate trip with user
                title: `${finalDays}-Day Trip to ${destinations.map(d => d.name).join(', ')}`,
                travelerName: 'Traveler',
                status: 'draft',
                days: Array.from({ length: finalDays }).map((_, idx) => ({
                    date: dates[idx] || new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
                    places: destinations,
                    notes: `Day ${idx + 1}: Visit ${destinations.map(d => d.name).join(', ')}. Explore the area and enjoy your trip!`
                })),
                createdAt: new Date().toISOString()
            };
            try {
                await this.tripDao.save(fallbackTrip);
                console.log('[TripService] Fallback trip saved:', fallbackTrip.id);
            }
            catch (saveError) {
                console.error('[TripService] Failed to save fallback trip:', saveError);
            }
            return fallbackTrip;
        }
    }
    async listTrips(userId) {
        return this.tripDao.list(userId);
    }
    async getTripById(id, userId) {
        return this.tripDao.findById(id, userId);
    }
    async deleteTrip(id, userId) {
        return this.tripDao.delete(id, userId);
    }
    async saveTrip(trip) {
        return this.tripDao.save(trip);
    }
}
exports.TripService = TripService;
