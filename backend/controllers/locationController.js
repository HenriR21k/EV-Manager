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

export const getAllLocations = async (req, res, next) => {
    try {
        const Locations = collection(db, 'Locations');
        const data = await getDocs(Locations);
        const LocationsArray = [];
        if (data.empty) {
            res.status(404).send('No Location record found');
        } else {
            data.forEach(doc => {
                const location = new Location(
                    doc.id,
                    doc.data(),
                );
                LocationsArray.push(location);
            });
            res.send(LocationsArray);
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
