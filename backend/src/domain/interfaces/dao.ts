import { Trip } from '../models';

export interface ITripDAO {
  save(trip: Trip): Promise<Trip>;
  list(userId?: string): Promise<Trip[]>; // Filter by userId if provided
  findById(id: string, userId?: string): Promise<Trip | null>; // Filter by userId if provided
  delete(id: string, userId?: string): Promise<boolean>; // Filter by userId if provided
}

