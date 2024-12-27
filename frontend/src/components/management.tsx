import { useEffect, useState } from "react";
import { APIProvider, ControlPosition, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {CustomMapControl} from './googlemapcomponents/map-control';
import MapHandler from "./googlemapcomponents/map-handler";
import useLoad from './api/useLoad';
import { API } from "./api/apiRequest";
import configuration from "../config/configuration";
import { useUser } from "./userContext";
import { collection, getDocs, addDoc, GeoPoint } from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-toastify";



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
  const endpoint = `/Locations`
  const [locations, setLocations, loadingMessage, loadLocations] = useLoad(endpoint)

  const [selectedPlace, setSelectedPlace] = useState<null>(null);
  const [markers, setMarkers] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [markerReservations, setMarkerReservations] = useState<Reservation[]>([]);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [address, setAddress] = useState("");

  const { userId } = useUser();

  const API_KEY = configuration.API.API_KEY;
  
  const getAddress = async (latitude:any, longitude:any) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      setAddress('Unable to load address' + error);
    }
  };

  useEffect(() => {loadLocations(endpoint)}, []);

  const addLocation = async (place: any) => {
    
    console.log("does it reach")
    if (place && place.geometry && place.geometry.location) {
      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };


      // setLocations((prevLocation: any) => [...prevLocation, newLocation]);
      
      let locationObj = {
        evlocation: new GeoPoint(newLocation.lat, newLocation.lng),
        createdByuid: userId
        }
     
      handleLocationPost(locationObj)
    }
  };

  const handleLocationPost = async (newLocation: any) => {
    const outcome = await API.post('/Locations', newLocation);
    console.log(outcome.response)
    loadLocations(endpoint)
  }

  const handleMarkerClick = (marker: Location, index: number) => {

    setSelectedMarker(marker.evlocation);
    getAddress(marker.evlocation.latitude,marker.evlocation.longitude)
    
    const matchingLocation = locations.find((location: Location) => 
      location.evlocation.latitude === marker.evlocation.latitude && 
      location.evlocation.longitude === marker.evlocation.longitude
    );

    console.log("This one"+JSON.stringify(matchingLocation))
  
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
          }),          
        };
      });
  
      setMarkerReservations(reservations);
    } else {
      setMarkerReservations([]);
      console.log("No matching location found");
    }
  };

  //must change to use useForm
  const handleReservation = async (
    event: React.FormEvent<HTMLFormElement>,
    selectedMarker: any,
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
    const now = new Date();

    if (startDateTime < now) {
      toast.error("Cannot make reservations in the past", {
        position: "bottom-center",
      });
      return;
    }

    const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    if (duration > 1) {
        toast.error("Maximum reservation time is 1 hour", {
            position: "bottom-center",
        });
        return;
    }

    if (startDateTime >= endDateTime) {
      toast.error("Start time must be before end time.", {
              position: "bottom-center",
            });
      return;
    }

    try {
      const matchingLocation = locations.find((location: Location) =>
        location.evlocation.latitude === selectedMarker.latitude &&
        location.evlocation.longitude === selectedMarker.longitude
      );

      handleReservationPost(startDateTime, endDateTime, matchingLocation.id, userId)
      
    } catch (error) {
      console.error("Error adding reservation:", error);
    }
  };

  const handleReservationPost = async (startDateTime: any, endDateTime:any, matchingLocation: any, userID: any) => {
    let reservationsObj = {
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      matchingLocation: matchingLocation,
      userID: userID
    }
    console.log(JSON.stringify(reservationsObj))

    const outcome = await API.post(`/Location/${matchingLocation}/Reservations`, reservationsObj);
    
    if (outcome.result.success) {
      toast.success(outcome.result.message, {
        position: "bottom-center"
      });
    } else {
      toast.error(outcome.result.message, {
        position: "bottom-center"
      });
    }
    loadLocations(endpoint)
  }

  return (
    <div className="management-container">
      <h1>Manage EV points</h1>
      <div>User ID: {userId}</div>
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
            {locations ? (
              locations.map((location: any, index: number) => (
                <AdvancedMarker
                key={index}
                position={{lat: location.evlocation.latitude, lng: location.evlocation.longitude}}
                onClick={() => handleMarkerClick(location, index)}
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
      </div>
      
      <div className="marker-details">
        {selectedMarker ? (
          <>
          <h2>Selected Location Details</h2>
          <ul className="locations-list">
            <li className="location-item">Latitude: {selectedMarker.latitude} </li>
            <li className="location-item">Longitude: {selectedMarker.longitude} </li>
            <li className="location-item">Address: {address} </li>
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
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </label>
              </div>
              <div>
                <label>
                  Start Time:
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required/>
                </label>
              </div>
              <label>
                End Date:
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required/>
              </label>
              <div>
                <label>
                  End Time:
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required/>
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


