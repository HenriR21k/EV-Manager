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
import Reservations from "./reservations";

type MarkerLocation = {
  lat: number;
  lng: number;
};

type Reservation = {
  start: string;
  end: string;
};

type Location = {
  id: string;
  evlocation: {
    latitude: number;
    longitude: number;
  };
  reservations: Reservation[];
};

export default function Management() {
  const endpoint = `/Locations`;
  const [locations, setLocations, loadingMessage, loadLocations] = useLoad(endpoint);
  const [selectedPlace, setSelectedPlace] = useState<null>(null);
  const [markers, setMarkers] = useState<MarkerLocation[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerLocation | null>(null);
  const [markerReservations, setMarkerReservations] = useState<Reservation[]>([]);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (locations) {
      const locationData = locations.map((location: Location) => {
        const evlocation = location.evlocation;

        return {
          lat: evlocation.latitude,
          lng: evlocation.longitude,
        };
      });

      setMarkers(locationData);
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
    
    const matchingLocation = locations.find((location: Location) => 
      location.evlocation.latitude === marker.lat && 
      location.evlocation.longitude === marker.lng
    );
  
    if (matchingLocation) {
      const reservations = matchingLocation.reservations.map((reservation: Reservation) => {
        return {
          start: new Date(reservation.start).toLocaleString("en-GB", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          end: new Date(reservation.end).toLocaleString("en-GB", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        };
      });
  
      setMarkerReservations(reservations);
    } else {
      setMarkerReservations([]);
      console.log("No matching location found");
    }
  };
  const handleReservation = async (
    event: React.FormEvent<HTMLFormElement>,
    selectedMarker: MarkerLocation,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string
  ) => {
    event.preventDefault();
    if (!selectedMarker) {
      console.error("No marker selected. ");
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (startDateTime >= endDateTime) {
      console.error("Start time must be before end time.");
      return;
    }

    try {
      const matchingLocation = locations.find((location: Location) =>
        location.evlocation.latitude === selectedMarker.lat &&
        location.evlocation.longitude === selectedMarker.lng
      );

      if (matchingLocation) {
        const reservationsCollectionRef = collection(db, "Locations",matchingLocation.id,"Reservations");
        await addDoc(reservationsCollectionRef, {
          start: startDateTime,
          end: endDateTime,
        });
        
        console.log("Reservation added successfully.");
      } else {
        console.error("No matching location found for this marker.");
      }
    } catch (error) {
      console.error("Error adding reservation:", error);
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
      
      <div className="marker-details">
        {selectedMarker ? (
          <>
          <h2>Selected Location Details</h2>
          <ul className="locations-list">
            <li className="location-item">Latitude: {selectedMarker.lat}</li>
            <li className="location-item">Longitude: {selectedMarker.lng}</li>
          </ul>
          {markerReservations.length > 0 ? (
            <div className="reservations">
              <h2>Current reservations</h2>
              <ul className="reservations-list">
                {markerReservations.map((reservation, index) => (
                  <li key={index} className="reservation-item">
                    {reservation.start} - {reservation.end}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <h2>No current reservations</h2>
          )}
          <form
            className="reservation-form"
            onSubmit={(event) => handleReservation(event,selectedMarker,startDate,startTime,endDate,endTime)}
            >
            <div>
              <div>
                <label>
                  Start Date:
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
              </div>
              <div>
                <label>
                  Start Time:
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}/>
                </label>
              </div>
              <label>
                End Date:
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
              </label>
              <div>
                <label>
                  End Time:
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}/>
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Reserve EV Charging Point
            </button>
          </form>
        </>
        ) : (
          <h2>Select a location</h2>
      )}
      </div>
    </div>
  );
}
