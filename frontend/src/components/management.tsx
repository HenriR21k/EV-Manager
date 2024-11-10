import { useEffect, useState } from "react";
import { APIProvider, ControlPosition, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {CustomMapControl} from './googlemapcomponents/map-control';
import MapHandler from "./googlemapcomponents/map-handler";
import { db } from '../config/firebase';
import useLoad from './api/useLoad';
import { collection, getDocs, addDoc, GeoPoint } from 'firebase/firestore';
import configuration from "../config/configuration";


export default function Management() {


  const {API_KEY, MAP_KEY} = process.env;

  const endpoint = `/Locations`
  const [locations, setLocations, loadingMessage, loadLocations] = useLoad(endpoint)
  const [selectedPlace, setSelectedPlace] = useState<null>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const locationsCollection = collection(db, 'Locations');
        const locationSnapshot = await getDocs(locationsCollection);
        
        const locationData = locationSnapshot.docs.map(doc => {
          const evlocation = doc.data().evlocation;
          
          return {
            lat: evlocation._lat,
            lng: evlocation._long
          };
        });
        
        console.log("Fetched locations:", locationData);
        setMarkers(locationData);
        
      } catch (error) {
        console.error("Error fetching locations: ", error);
      }
    };

    fetchMarkers();
  }, []);
  
  const addMarker = async (place: any) => {
    if (place && place.geometry && place.geometry.location) {
      const newMarker = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      let testevlocation = new GeoPoint(newMarker.lat, newMarker.lng)
      console.log("test: "+ JSON.stringify(testevlocation))
      try {
        const locationsCollection = collection(db, 'Locations');
        await addDoc(locationsCollection, {
          evlocation: new GeoPoint(newMarker.lat, newMarker.lng),
          
        });
        console.log("New marker added to Firestore:", newMarker);
      } catch (error) {
        console.error("Error adding marker to Firestore:", error);
      }
    }
  };

  return (
    <APIProvider apiKey={configuration.API.API_KEY}>
    <Map
        style={{width: '100vw', height: '100vh'}}
        defaultZoom={3}
        defaultCenter={{lat: 22.54992, lng: 0}}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId={configuration.API.MAP_KEY}
        >
        {markers.map((marker, index) => (
          <AdvancedMarker key={index} position={marker} />
        ))}
      </Map>
    <CustomMapControl
        controlPosition={ControlPosition.TOP}
        onPlaceSelect={(place) => {
          setSelectedPlace(place);
          addMarker(place);
        }}
        
      />
    <MapHandler place={selectedPlace} />
    </APIProvider>
  );
}


