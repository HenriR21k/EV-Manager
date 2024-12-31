import { db } from '../db.js';
import Location from '../models/location.js';
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc, GeoPoint, addDoc } from 'firebase/firestore';


export const addLocation = async (req, res, next) => {

    console.log("test"+JSON.stringify(req.body))
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

export const addExtraUserDetails = async (req, res, next) => {
    try {
        const userID = req.body.userId;
        const paypalEmail = req.body.paypalEmail;
        const merchantId = req.body.merchantId
        const data = {userID, paypalEmail, merchantId};

        await setDoc(doc(collection(db, "ExtraUserDetails")), data)
        res.json("Paypal successfully added")
    } catch (error) {
        res.status(400).send(error.message)
    }
}

export const getExtraUserDetails = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const extraUserDetailsRef = collection(db, 'ExtraUserDetails');
        const data = await getDocs(extraUserDetailsRef);
        
        if (data.empty) {
            res.status(404).send('No extra user details found');
            return;
        }

        let userDetails = null;
        data.forEach(doc => {
            if (doc.data().userID === userId) {
                userDetails = {
                    id: doc.id,
                    ...doc.data()
                };
            }
        });

        if (!userDetails) {
            res.status(404).send('No extra details found for this user');
            return;
        }

        res.send(userDetails);
    } catch (error) {
        res.status(400).send(error.message);
    }

   //fetch id that passed into the url.
   //now call api to fetch the list of extrauserdetails.
   //now we only want the extra user detail that belongs to the user.
   //so we filter by the current users id that matches each objects userId attribute.
   //(The filter part is probably the most challenging aspect).
   //So realistically, it should only retrieve one object.
   //So in the frontend, you can access the paypal email by doing something like:
   //extraUserDetails.paypalEmail.
    //In the frontend you need only observe extraUserDetails which should display extraUserDetails object that be
}

/*
export const getUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const UserDoc = doc(db, 'Users', id);
        const data = await getDoc(UserDoc);
        if (!data.exists()) {
            res.status(404).send('User with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}
*/


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
                                createdByuid: doc.data().createdByuid,
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
                        doc.data(),
                        reservationsArray,
                        
                         
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