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
    // Receive object
    // Receive object ID
    // 
    console.log(req.body.userID)
    
    try {
        
        const reservationsCollectionRef = collection(db, "Locations",req.body.matchingLocation,"Reservations");
        await addDoc(reservationsCollectionRef, {
        start: req.body.startDateTime,
        end: req.body.endDateTime,
        userID: req.body.userID
        });

        res.send("Reservation added successfully.");

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
