import { Router } from 'express';
import { addLocation, getAllLocations, getLocation, updateLocation, deleteLocation, addReservation, getUserReservations, updateEnergyUsed } from '../controllers/locationController.js'

const router = Router();

router.post('/Locations', addLocation);
router.get('/Locations', getAllLocations);
router.get('/Location/:id', getLocation);
router.put('/Location/:id', updateLocation);
router.delete('/Location/:id', deleteLocation);
router.post('/Location/:id/Reservations', addReservation)
router.get('/user/:userId/Reservations', getUserReservations);
router.put('/user/:userId/Energy', updateEnergyUsed);


export const routes = router;