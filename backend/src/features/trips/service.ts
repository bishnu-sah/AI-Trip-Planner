import { IDistanceAdapter, IAIAdapter, IPlacesAdapter } from '../../domain/interfaces/adapters';
import { ITripDAO } from '../../domain/interfaces/dao';
import { ITripService } from '../../domain/interfaces/services';
import { Place, Trip } from '../../domain/models';
import { v4 as uuid } from 'uuid';

export class TripService implements ITripService {
  constructor(
    private readonly tripDao: ITripDAO,
    private readonly aiAdapter: IAIAdapter,
    private readonly placesAdapter: IPlacesAdapter,
    private readonly distanceAdapter: IDistanceAdapter
  ) { }

  async generateTrip(origin: string, destinations: Place[], days: number, userId?: string, budget?: string): Promise<Trip> {
    const adjustedDays = await this.distanceAdapter.estimateDays(destinations.length || 1);
    const finalDays = Math.max(days, adjustedDays);

    // Create detailed prompt for AI to generate real itinerary
    const destinationsList = destinations.map((d) => `${d.name} (${d.country})`).join(', ');
    const startDate = new Date().toISOString().split('T')[0];

    // Build dates for all days
    const dates = Array.from({ length: finalDays }).map((_, idx) =>
      new Date(Date.now() + idx * 86400000).toISOString().split('T')[0]
    );

    const budgetInfo = budget ? `- Budget Level: ${budget}` : '';

    const prompt = `You are an expert travel planner specializing in Indian destinations. Create a detailed ${finalDays}-day travel itinerary.
 
 TRIP DETAILS:
 - Starting point (Base): ${origin}
 - Destinations to visit: ${destinationsList}
 - Number of days: ${finalDays}
 - Start date: ${startDate}
 ${budgetInfo}
 
 CRITICAL REQUIREMENTS:
 1. Create a creative, engaging trip title (max 60 characters) that reflects the journey
 2. Provide SPECIFIC travel advice in the Day 1 notes on how to get from ${origin} to the first destination.
 3. Provide an approximate list of expenses (budget breakdown) including travel, stay, and food aligned with a "${budget || 'Standard'}" budget.
 4. For EACH of the ${finalDays} days, provide:
    - REAL specific places to visit (use actual names of monuments, temples, markets, parks, etc. in ${destinationsList})
    - REAL activities and experiences in POINT-WISE format
    - Detailed notes with stay recommendations in POINT-WISE format (bullet points)
    - Performance tips, best times to visit, and cultural insights.
    - Use POINT-WISE information throughout the itinerary for better readability
    - Make each day unique and realistic
 
 IMPORTANT RULES:
 - Use ONLY real place names from Indian destinations
 - Be specific about activities and use POINT-WISE format for readability
 - Include stay recommendations tailored to the "${budget || 'Standard'}" budget
 - Include travel logistics (trains, flights, or local transport names)
 - You MUST respond with ONLY valid JSON - no markdown, no code blocks, no explanations
 
 JSON FORMAT - respond with this exact structure:
 {
   "title": "Your creative trip title here",
   "budgetEstimate": {
     "total": "Approximate total amount (e.g., ₹50,000)",
     "currency": "INR",
     "breakdown": [
       { "category": "Travel", "amount": "₹...", "description": "Flights/Train/Bus from ${origin}" },
       { "category": "Accommodation", "amount": "₹...", "description": "Hotels/Hostels for ${finalDays} nights" },
       { "category": "Activities & Food", "amount": "₹...", "description": "Entry fees and daily meals" }
     ]
   },
   "days": [
     {
       "day": 1,
       "date": "${dates[0]}",
       "places": ["Real Place Name 1", "Real Place Name 2"],
       "activities": ["Specific Activity 1", "Specific Activity 2"],
       "notes": "Detailed notes for Day 1. INCLUDE TRAVEL ADVICE from ${origin} and STAY recommendations for ${budget || 'Standard'} budget."
     },
     {
       "day": 2,
       "date": "${dates[1] || dates[0]}",
       "places": ["Real Place Name 3", "Real Place Name 4"],
       "activities": ["Specific Activity 3", "Specific Activity 4"],
       "notes": "Detailed notes for Day 2. INCLUDE STAY recommendations."
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

      let aiResponse: string;
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
      } catch (aiError: any) {
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
        const fallbackTrip: Trip = {
          id: uuid(),
          userId: userId, // Associate trip with user
          title: `${days}-Day Trip to ${destinations.map(d => d.name).join(', ')}`,
          travelerName: 'Traveler',
          budget: budget,
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

      // 9. Parse AI response
      let itineraryData: any;
      try {
        // Efficiently extract JSON from the response (find the first { and last })
        const firstBrace = aiResponse.indexOf('{');
        const lastBrace = aiResponse.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const putativeJson = aiResponse.substring(firstBrace, lastBrace + 1);
          try {
            itineraryData = JSON.parse(putativeJson);
          } catch (e) {
            // Attempt to clean trailing commas or other common AI JSON errors
            const cleanedJson = putativeJson
              .replace(/,\s*([\}\]])/g, '$1') // remove trailing commas
              .replace(/(\r\n|\n|\r)/gm, " "); // remove newlines if they're causing issues in strings
            try {
              itineraryData = JSON.parse(cleanedJson);
            } catch (innerError) {
              console.error('[TripService] ❌ JSON.parse failed even after cleaning');
              throw innerError;
            }
          }
        } else {
          throw new Error('No JSON structure found in AI response');
        }

        console.log('[TripService] ✅ Successfully parsed AI JSON response');
        console.log('[TripService] Itinerary title:', itineraryData.title);
      } catch (parseError: any) {
        console.warn('[TripService] Failed to parse AI response as JSON:', parseError?.message);
        console.warn('[TripService] Raw response:', aiResponse.substring(0, 500));

        // If parsing fails, create structured itinerary from text
        const lines = aiResponse.split('\n').filter(line => line.trim());
        itineraryData = {
          title: lines.find(line => line.length < 60 && line.length > 10)?.slice(0, 60) || `Trip to ${destinations.map(d => d.name).join(', ')}`,
          days: Array.from({ length: finalDays }).map((_, idx) => {
            // Filter out JSON/code blocks from the fallback text
            const sanitizedText = aiResponse
              .replace(/```[\s\S]*?```/g, '') // Remove code blocks
              .replace(/\{[\s\S]*?\}/g, '')   // Remove JSON-like objects
              .split('\n')
              .filter(l => l.trim().length > 10)
              .join('. ') || 'Plan details missing';

            return {
              day: idx + 1,
              date: new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
              places: destinations.map(d => d.name),
              activities: [`Explore ${destinations[0]?.name || 'destination'}`],
              notes: sanitizedText.slice(idx * 200, (idx + 1) * 200).trim() || 'Enjoy your trip!'
            };
          })
        };
        // Try to regex extract budget if JSON failed
        const budgetMatch = aiResponse.match(/(?:Total|Amount|Cost)[^\d]*([\d,₹]+)/i);
        if (budgetMatch) {
          itineraryData.budgetEstimate = {
            total: budgetMatch[1].startsWith('₹') ? budgetMatch[1] : `₹${budgetMatch[1]}`,
            currency: 'INR',
            breakdown: [
              { category: 'Estimated total', amount: budgetMatch[1], description: 'Extracted from AI response' }
            ]
          };
        }
      }

      // 10. Ensure we have a budget estimate - if missing, try a separate quick call
      if (!itineraryData.budgetEstimate || !itineraryData.budgetEstimate.total) {
        console.log('[TripService] Budget missing or invalid in AI response, attempting dedicated estimation...');
        try {
          const budgetPrompt = `Estimate a detailed travel budget for a ${finalDays}-day trip to ${destinationsList} for a "${budget || 'Standard'}" budget level. 
          Return ONLY JSON in this format: 
          { "total": "₹...", "currency": "INR", "breakdown": [{ "category": "Travel/Stay/Food", "amount": "₹...", "description": "..." }] }
          Ensure the response is valid JSON.`;
          const budgetResponse = await this.aiAdapter.complete(budgetPrompt);
          console.log('[TripService] Budget fallback response:', budgetResponse);
          const jsonMatch = budgetResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const budgetData = JSON.parse(jsonMatch[0]);
            itineraryData.budgetEstimate = budgetData;
            console.log('[TripService] Successfully estimated budget in secondary call');
          }
        } catch (e) {
          console.warn('[TripService] Failed to generate fallback budget estimate:', e);
          // Last resort fallback
          itineraryData.budgetEstimate = {
            total: budget === 'Luxury' ? '₹75,000' : (budget === 'Budget' ? '₹15,000' : '₹35,000'),
            currency: 'INR',
            breakdown: [
              { category: 'Estimated Total', amount: budget === 'Luxury' ? '₹75,000' : (budget === 'Budget' ? '₹15,000' : '₹35,000'), description: `Default ${budget || 'Standard'} estimate` }
            ]
          };
        }
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

      const finalTrip: Trip = {
        id: uuid(),
        userId: userId, // Associate trip with user
        title: (itineraryData.title || `Trip to ${destinations.map(d => d.name).join(', ')}`).slice(0, 100),
        travelerName: 'Traveler',
        budget: budget,
        budgetEstimate: itineraryData.budgetEstimate || itineraryData.budget_estimate || itineraryData.budget,
        status: 'draft',
        days: tripDays.map((day: any, idx: number) => {
          // Map place names to Place objects - use AI-generated place names
          const dayPlaces = (day.places || []).map((placeName: string) => {
            // Try to find matching destination first
            const found = destinations.find(d =>
              placeName.toLowerCase().includes(d.name.toLowerCase()) ||
              d.name.toLowerCase().includes(placeName.toLowerCase()) ||
              d.name.toLowerCase() === placeName.toLowerCase()
            );
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
            ? `Activities:\n${day.activities.map((a: string) => `• ${a}`).join('\n')}\n\n`
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
    } catch (error: any) {
      console.error('[TripService] ❌ Error generating trip with AI:', error);
      console.error('[TripService] Error stack:', error?.stack);

      // If it's an API key error, re-throw it so controller can return proper error
      if (error?.message?.includes('GEMINI_API_KEY') ||
        error?.message?.includes('API key') ||
        error?.message?.includes('API_KEY_INVALID')) {
        throw error; // Re-throw to controller
      }

      // Always return a valid trip object for other errors (but don't include error message in notes)
      const fallbackTrip: Trip = {
        id: uuid(),
        userId: userId, // Associate trip with user
        title: `${finalDays}-Day Trip to ${destinations.map(d => d.name).join(', ')}`,
        travelerName: 'Traveler',
        budget: budget,
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
      } catch (saveError) {
        console.error('[TripService] Failed to save fallback trip:', saveError);
      }

      return fallbackTrip;
    }
  }

  async listTrips(userId?: string): Promise<Trip[]> {
    return this.tripDao.list(userId);
  }

  async getTripById(id: string, userId?: string): Promise<Trip | null> {
    return this.tripDao.findById(id, userId);
  }

  async deleteTrip(id: string, userId?: string): Promise<boolean> {
    return this.tripDao.delete(id, userId);
  }

  async saveTrip(trip: Trip): Promise<Trip> {
    return this.tripDao.save(trip);
  }

  async estimateTripBudget(tripId: string): Promise<Trip | null> {
    const trip = await this.tripDao.findById(tripId);
    if (!trip || trip.budgetEstimate) return trip;

    console.log(`[TripService] Manually estimating budget for trip: ${tripId}`);
    try {
      const destinationsList = trip.days[0]?.places.map(p => p.name).join(', ') || 'selected destinations';
      const prompt = `Estimate a detailed travel budget for a ${trip.days.length}-day trip to ${destinationsList} for a "${trip.budget || 'Standard'}" budget level. 
      Return ONLY JSON in this format: 
      { "total": "₹...", "currency": "INR", "breakdown": [{ "category": "Travel/Stay/Food", "amount": "₹...", "description": "..." }] }`;

      const response = await this.aiAdapter.complete(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        trip.budgetEstimate = JSON.parse(jsonMatch[0]);
        return await this.tripDao.save(trip);
      }
    } catch (error) {
      console.error('[TripService] Error estimating budget for existing trip:', error);
    }
    return trip;
  }
}
