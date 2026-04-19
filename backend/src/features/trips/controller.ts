import { Request, Response } from 'express';
import { ITripService } from '../../domain/interfaces/services';
import { IPlacesAdapter } from '../../domain/interfaces/adapters';
import { Place } from '../../domain/models';
import { AuthRequest } from '../../middleware/auth';

export class TripController {
  constructor(
    private readonly tripService: ITripService,
    private readonly placesAdapter: IPlacesAdapter
  ) { }

  generate = async (req: Request, res: Response) => {
    try {
      const { origin, destinationKeywords, days, budget } = req.body;
      const userId = (req as AuthRequest).userId; // Get userId from authenticated request
      console.log('[TripController] ========== GENERATE TRIP REQUEST ==========');
      console.log('[TripController] Generate request:', { origin, destinationKeywords, days, userId, budget });
      console.log('[TripController] userId from JWT:', userId);
      console.log('[TripController] userId type:', typeof userId);
      console.log('[TripController] userId is undefined?', userId === undefined);
      console.log('[TripController] userId is null?', userId === null);

      if (!userId) {
        console.error('[TripController] ❌❌❌ CRITICAL: userId is missing from request!');
        console.error('[TripController] This trip will NOT be associated with any user!');
        console.error('[TripController] Trip will be saved but user will NOT see it after login!');
      }

      if (!origin || !destinationKeywords) {
        return res.status(400).json({ message: 'origin and destinationKeywords are required' });
      }

      try {
        let destinations = await this.placesAdapter.search(destinationKeywords);
        console.log('[TripController] Found destinations:', destinations);
        console.log('[TripController] Destination count:', destinations.length);

        if (!destinations || destinations.length === 0) {
          console.warn('[TripController] No destinations found, creating from keyword');
          // Create a destination from the keyword as fallback
          const fallbackDestination: Place = {
            id: destinationKeywords.toLowerCase().replace(/\s+/g, '-'),
            name: destinationKeywords,
            country: 'India',
            coordinates: { lat: 0, lng: 0 }
          };
          destinations = [fallbackDestination];
          console.log('[TripController] Created fallback destination:', fallbackDestination);
        }

        const trip = await this.tripService.generateTrip(origin, destinations, Number(days) || 3, userId, budget);
        console.log('[TripController] Trip generated successfully:', trip.id);
        console.log('[TripController] Trip title:', trip.title);
        console.log('[TripController] Trip days count:', trip.days.length);

        // Ensure trip is valid before sending
        if (!trip || !trip.id) {
          throw new Error('Generated trip is invalid');
        }

        res.json(trip);
      } catch (serviceError: any) {
        console.error('[TripController] ❌ Service error:', serviceError);
        console.error('[TripController] Error message:', serviceError?.message);
        console.error('[TripController] Error stack:', serviceError?.stack);

        // Provide more helpful error messages
        let errorMessage = serviceError?.message || 'Unknown error';
        let httpStatus = 500;

        // Check for specific error types
        if (errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('API key')) {
          httpStatus = 400;
          errorMessage = 'AI API key issue: ' + errorMessage;
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          httpStatus = 503;
          errorMessage = 'Network error: ' + errorMessage;
        }

        res.status(httpStatus).json({
          message: 'Failed to generate trip',
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? serviceError?.stack : undefined
        });
      }
    } catch (error: any) {
      console.error('[TripController] Unexpected error:', error);
      console.error('[TripController] Error stack:', error?.stack);
      res.status(500).json({
        message: 'Failed to generate trip',
        error: error?.message || 'Unknown error'
      });
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).userId; // Get userId from authenticated request
      console.log('[TripController] ========== LIST TRIPS REQUEST ==========');
      console.log(`[TripController] Listing trips for userId: ${userId}`);
      console.log(`[TripController] userId type: ${typeof userId}`);
      console.log(`[TripController] userId is undefined? ${userId === undefined}`);
      console.log(`[TripController] userId is null? ${userId === null}`);

      if (!userId) {
        console.error('[TripController] ❌❌❌ CRITICAL: userId is missing from request!');
        console.error('[TripController] Will return ALL trips (not filtered by user)');
        console.error('[TripController] This is a security issue - trips should be filtered by userId!');
      }

      const trips = await this.tripService.listTrips(userId);
      console.log(`[TripController] ✅ Returning ${trips.length} trips${userId ? ` for userId: ${userId}` : ' (NO USER FILTER - ALL TRIPS)'}`);

      // Log trip IDs and userIds for debugging
      if (trips.length > 0) {
        console.log(`[TripController] Trip details:`);
        trips.forEach((t, idx) => {
          console.log(`[TripController]   Trip ${idx + 1}: id=${t.id}, userId=${t.userId || 'MISSING'}, title=${t.title}`);
        });
      } else {
        console.log(`[TripController] ⚠️  No trips found${userId ? ` for userId: ${userId}` : ''}`);
      }

      res.json(trips);
    } catch (error: any) {
      console.error('[TripController] ❌ Error listing trips:', error);
      console.error('[TripController] Error stack:', error?.stack?.substring(0, 500));
      res.status(500).json({ message: 'Failed to list trips', error: error?.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as AuthRequest).userId; // Get userId from authenticated request
      const trip = await this.tripService.getTripById(id, userId);
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }
      res.json(trip);
    } catch (error: any) {
      console.error('[TripController] Error getting trip:', error);
      res.status(500).json({ message: 'Failed to get trip', error: error?.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as AuthRequest).userId; // Get userId from authenticated request
      const deleted = await this.tripService.deleteTrip(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: 'Trip not found' });
      }
      res.json({ message: 'Trip deleted successfully', id });
    } catch (error: any) {
      console.error('[TripController] Error deleting trip:', error);
      res.status(500).json({ message: 'Failed to delete trip', error: error?.message });
    }
  };

  save = async (req: Request, res: Response) => {
    try {
      const trip = req.body;
      const userId = (req as AuthRequest).userId; // Get userId from authenticated request
      console.log('[TripController] Save request for trip:', trip.id, 'userId:', userId);
      console.log('[TripController] Trip title:', trip.title);
      console.log('[TripController] Trip days count:', trip.days?.length);

      if (!trip || !trip.id) {
        return res.status(400).json({ message: 'Invalid trip data: missing id' });
      }

      if (!trip.title || !trip.days || trip.days.length === 0) {
        return res.status(400).json({ message: 'Invalid trip data: missing required fields' });
      }

      // Associate trip with user
      trip.userId = userId;

      const savedTrip = await this.tripService.saveTrip(trip);
      console.log('[TripController] Trip saved successfully:', savedTrip.id);
      res.json(savedTrip);
    } catch (error: any) {
      console.error('[TripController] Error saving trip:', error);
      console.error('[TripController] Error stack:', error?.stack);
      res.status(500).json({ message: 'Failed to save trip', error: error?.message });
    }
  };

  estimateBudget = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const trip = await this.tripService.estimateTripBudget(id);
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }
      res.json(trip);
    } catch (error: any) {
      console.error('[TripController] Error estimating budget:', error);
      res.status(500).json({ message: 'Failed to estimate budget', error: error?.message });
    }
  };
}

