import { useEffect, useState } from "react";
import { APIProvider, ControlPosition, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {CustomMapControl} from './googlemapcomponents/map-control';
import MapHandler from "./googlemapcomponents/map-handler";
import useLoad from './api/useLoad';
import { API } from "./api/apiRequest";
import { GeoPoint } from 'firebase/firestore';
import configuration from "../config/configuration";
import { useUser } from "./userContext";


export default function Management() {
  const endpoint = `/Locations`
  const [locations, setLocations, loadingMessage, loadLocations] = useLoad(endpoint)
  const [selectedPlace, setSelectedPlace] = useState<null>(null);
  const { userId } = useUser();

  useEffect(() => {loadLocations(endpoint)}, []);

  const handleLocationPost = async (newLocation: any) => {
    const outcome = await API.post('Locations', newLocation);
    console.log(outcome.response)
    loadLocations(endpoint)
  }
  
  const addLocation = async (place: any) => {
    if (place && place.geometry && place.geometry.location) {
      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setLocations((prevLocation: any) => [...prevLocation, newLocation]);
      let locationObj = {
        evlocation: new GeoPoint(newLocation.lat, newLocation.lng),
        createdByuid: userId
        }
      handleLocationPost(locationObj)
    }
  };

  return (
    <>
      <div>User ID: {userId}</div>
      <APIProvider apiKey={configuration.API.API_KEY}>
      <Map
          style={{width: '100vw', height: '100vh'}}
          defaultZoom={3}
          defaultCenter={{lat: 22.54992, lng: 0}}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId={configuration.API.MAP_KEY}
          >
        {locations && locations.length > 0 ? (
          locations.map((location: any, index: number) => (
            <AdvancedMarker key={index} 
            position={{ 
              lat: location.evlocation.evlocation.latitude, 
              lng: location.evlocation.evlocation.longitude 
            }}
            />
          ))
          ) : (
            <AdvancedMarker position={{ lat: 0, lng: 0 }} />
          )}
      </Map>
      <CustomMapControl
          controlPosition={ControlPosition.TOP}
          onPlaceSelect={(place) => {
            setSelectedPlace(place);
            addLocation(place);
          }}
          
        />
      <MapHandler place={selectedPlace} />
      </APIProvider>
    </>
  );
}


