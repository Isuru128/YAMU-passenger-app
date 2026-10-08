import { useContext } from 'react';
import { RideContext } from '../context/RideContext';

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
