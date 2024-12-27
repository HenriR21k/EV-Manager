import { db } from '../db.js';
import Location from '../models/location.js';
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc, GeoPoint, addDoc } from 'firebase/firestore';


export const addLocation = async (req, res, next) => {
    try {
        const { evlocation, ...otherData } = req.body;
        const geoPoint = new GeoPoint(evlocation.latitude, evlocation.longitude);
        const data = { ...otherData, evlocation: geoPoint };

        await setDoc(doc(collection(db, 'Locations')), data);
        res.send('Record saved successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const addReservation = async (req, res, next) => {

    console.log(req.body.userID)

    
    
    try {
        const { matchingLocation, startDateTime, endDateTime, userID } = req.body;

        const reservationsCollectionRef = collection(db, "Locations", matchingLocation, "Reservations");
        const reservationsSnapshot = await getDocs(reservationsCollectionRef);
        let hasOverlap = false;
        reservationsSnapshot.forEach(reservationDoc => {
            const existingStart = reservationDoc.data().start;
            const existingEnd = reservationDoc.data().end;
            
            if ((startDateTime >= existingStart && startDateTime < existingEnd) ||
                (endDateTime > existingStart && endDateTime <= existingEnd) ||
                (startDateTime <= existingStart && endDateTime >= existingEnd)) {
                hasOverlap = true;
            }
        });

        if (hasOverlap) {
            res.json({
                success: false,
                message: "This time slot is already reserved. Please choose a different time."
            });
            return;
        }

        await addDoc(reservationsCollectionRef, {
            start: startDateTime,
            end: endDateTime,
            userID: userID
        });

        res.json({
            success: true,
            message: "Reservation added successfully."
        });

    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const getUserReservations = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const Locations = collection(db, 'Locations');
        const data = await getDocs(Locations);

        if (data.empty) {
            res.status(404).send('No Location record found');
        } else {
            const userReservations = await Promise.all(
                data.docs.map(async (doc) => {
                    const reservationsRef = collection(doc.ref, 'Reservations');
                    const reservationsSnapshot = await getDocs(reservationsRef);
                    
                    const reservationsArray = [];
                    reservationsSnapshot.forEach(reservationDoc => {
                        if (reservationDoc.data().userID === userId) {
                            reservationsArray.push({
                                id: reservationDoc.id,
                                locationId: doc.id,
                                evlocation: doc.data().evlocation,
                                start: reservationDoc.data().start,
                                end: reservationDoc.data().end,
                                user: reservationDoc.data().userID
                            });
                        }
                    });
                    
                    return reservationsArray;
                })
            );
            // Flatten the array of arrays and remove empty arrays
            const flattenedReservations = userReservations
                .flat()
                .filter(reservation => reservation !== null);

            if (flattenedReservations.length === 0) {
                res.status(404).send('No reservations found for this user');
            } else {
                res.send(flattenedReservations);
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const getAllLocations = async (req, res, next) => {
    try {
        const Locations = collection(db, 'Locations');
        const data = await getDocs(Locations);

        if (data.empty) {
            res.status(404).send('No Location record found');
        } else {
            
            const locationsWithReservations = await Promise.all(
                data.docs.map(async (doc) => {
                    
                    const reservationsRef = collection(doc.ref, 'Reservations');
                    const reservationsSnapshot = await getDocs(reservationsRef);
                    
                    const reservationsArray = [];
                    reservationsSnapshot.forEach(reservationDoc => {
                        reservationsArray.push({
                            id: reservationDoc.id,
                            start: reservationDoc.data().start,
                            end: reservationDoc.data().end,
                            user: reservationDoc.data().userID
                        });
                    });

                    const location = new Location(
                        doc.id,
                        doc.data().evlocation,
                        reservationsArray 
                    );
                    return location;
                })
            );
            
            res.send(locationsWithReservations);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}


export const getLocation = async (req, res, next) => {
    try {
        const id = req.params.id;
        const LocationDoc = doc(db, 'Locations', id);
        const data = await getDoc(LocationDoc);
        if (!data.exists()) {
            res.status(404).send('Location with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const updateLocation = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { evlocation, ...otherData } = req.body;

        let dataToUpdate = { ...otherData };

        if (evlocation) {
            const geoPoint = new GeoPoint(evlocation.latitude, evlocation.longitude);
            dataToUpdate = { ...dataToUpdate, evlocation: geoPoint };
        }

        const LocationDoc = doc(db, 'Locations', id);
        await updateDoc(LocationDoc, dataToUpdate);
        res.send('Location record updated successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const deleteLocation = async (req, res, next) => {
    try {
        const id = req.params.id;
        await deleteDoc(doc(db, 'Locations', id));
        res.send('Record deleted successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const updateEnergyUsed = async (req, res, next) => {
    console.log(req.body)
    try {
        const userId = req.params.userId;
        const { additionalEnergyUsed } = req.body;

        if (!additionalEnergyUsed || additionalEnergyUsed < 0) {
            res.status(400).send("Invalid energy amount");
            return;
        }

        const userDocRef = doc(db, 'Users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            res.status(404).send("User not found");
            return;
        }

        const currentEnergyUsed = userDoc.data().energyUsed || 0;
        const currentCredit = userDoc.data().credit || 0;
        const updatedEnergyUsed = currentEnergyUsed + additionalEnergyUsed;
        const updatedCredit = currentCredit + additionalEnergyUsed;

        await updateDoc(userDocRef, {
            energyUsed: updatedEnergyUsed,
            credit: updatedCredit,
        });

        res.send(`Energy used updated successfully: ${updatedEnergyUsed}`);
    } catch (error) {
        res.status(400).send(error.message);
    }
};