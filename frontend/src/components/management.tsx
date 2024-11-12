import { useEffect, useState } from "react";
import {
  APIProvider,
  ControlPosition,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { CustomMapControl } from "./googlemapcomponents/map-control";
import MapHandler from "./googlemapcomponents/map-handler";
import { db } from "../config/firebase";
import useLoad from "./api/useLoad";
import { collection, getDocs, addDoc, GeoPoint } from "firebase/firestore";
import configuration from "../config/configuration";

type MarkerLocation = {
  lat: number;
  lng: number;
};

export default function Management() {
  const endpoint = `/Locations`;
  const [locations, setLocations, loadingMessage, loadLocations] =
    useLoad(endpoint);
  const [selectedPlace, setSelectedPlace] = useState<null>(null);
  const [markers, setMarkers] = useState<MarkerLocation[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerLocation | null>(
    null
  );

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (locations) {
      const locationData = locations.map((location: any) => {
        const evlocation = location.evlocation;
        return {
          lat: evlocation.latitude,
          lng: evlocation.longitude,
        };
      });
      setMarkers(locationData);
      if (locationData.length > 0) {
        setSelectedMarker(locationData[0]);
      }
    } else console.log(loadingMessage);
  }, [locations]);

  const addMarker = async (place: any) => {
    if (place && place.geometry && place.geometry.location) {
      const newMarker = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      let testevlocation = new GeoPoint(newMarker.lat, newMarker.lng);
      console.log("test: " + JSON.stringify(testevlocation));
      try {
        const locationsCollection = collection(db, "Locations");
        await addDoc(locationsCollection, {
          evlocation: new GeoPoint(newMarker.lat, newMarker.lng),
        });
        console.log("New marker added to Firestore:", newMarker);
      } catch (error) {
        console.error("Error adding marker to Firestore:", error);
      }
    }
  };

  const handleMarkerClick = (marker: MarkerLocation, index: number) => {
    setSelectedMarker(marker);
    console.log("Selected marker:", marker);
  };
  const handleReservation = () => {
    if (selectedMarker) {
    }
  };

  return (
    <div className="management-container">
      <h1>Manage EV points</h1>
      <div className="map-container">
        <APIProvider apiKey={configuration.API.API_KEY}>
          <Map
            className="the-map"
            defaultZoom={3}
            defaultCenter={{ lat: 22.54992, lng: 0 }}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
            mapId={configuration.API.MAP_KEY}
          >
            {markers.map((marker, index) => (
              <AdvancedMarker
                key={index}
                position={marker}
                onClick={() => handleMarkerClick(marker, index)}
              />
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
      </div>
      {selectedMarker && (
        <div className="marker-details">
          <h2>Selected Location Details</h2>
          <p>Latitude: {selectedMarker.lat}</p>
          <p>Longitude: {selectedMarker.lng}</p>
          <button onClick={handleReservation} className="btn btn-primary">
            Reserve EV Charging Point
          </button>
        </div>
      )}
    </div>
  );
}
