import React, { useState, useEffect } from 'react';
import { useUser } from "./userContext";
import { API } from "./api/apiRequest";
import { useNavigate } from "react-router-dom";
import configuration from "../config/configuration";

function Reservations() {
  const { userId } = useUser();
  const [userReservations, setUserReservations] = useState([]);
  const [showPastReservations, setShowPastReservations] = useState(false);
  const navigate = useNavigate();

  const API_KEY = configuration.API.API_KEY;
  
  const getAddress = async (latitude:any, longitude:any) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        return (data.results[0].formatted_address);
      } else {
        return ('Address not found');
      }
    } catch (error) {
      return ('Unable to load address' + error);
    }
  };

  const fetchUserReservations = async () => {
    try {
        const response = await API.get(`/user/${userId}/Reservations`);
        console.log(response.result)
        if (response.result) {
            const reservationsWithAdresses = await Promise.all(
              response.result.map(async (reservation: any) => {
            const address = await getAddress(reservation.evlocation.latitude,reservation.evlocation.longitude)
            return {...reservation, address}
          })
        )
          setUserReservations(reservationsWithAdresses);
        }
      } catch (error) {
        console.error("Error fetching user reservations:", error);
      }
    };

  useEffect(() => {
    if (userId) {
      fetchUserReservations();
    }
  }, [userId]);
  
  const handleReservationClick = (reservation: any) => {
    console.log("ReserveTest: "+ JSON.stringify(reservation));
    navigate("/charging", { state: reservation });
  };
  const now = new Date();
  const futureReservations = userReservations.filter(
    (reservation: any) => new Date(reservation.end) > now
  );
  const pastReservations = userReservations.filter(
    (reservation: any) => new Date(reservation.end) <= now
  );

  return (
    <div className="reservations-container">
      <div className="auth-wrapper">
        <div className="auth-inner">
          {futureReservations.length > 0 ? (
            <div className="user-reservations">
                <h3>Your Reservations</h3>
                <ul className="reservations-list">
                    {futureReservations.map((reservation: any) => (
                        <li 
                          key={reservation.id}
                          className="reservation-item"
                          onClick={() => handleReservationClick(reservation)}
                          style={{ cursor: "pointer" }}
                        >
                            <div>Location: {reservation.evlocation.latitude}, {reservation.evlocation.longitude}</div>
                            <div>Address: {reservation.address}</div>
                            <div>Start: {new Date(reservation.start).toLocaleString()}</div>
                            <div>End: {new Date(reservation.end).toLocaleString()}</div>
                        </li>
                    ))}
                </ul>

            </div>
          ) : (
              <h3>No current reservations</h3>
          )}  
          {showPastReservations ? (
            <button type="submit"
            className="btn btn-primary mb-3"
            onClick={() => setShowPastReservations(false)}
            style={{ cursor: "pointer"}}
            >
              Hide Past Reservations
            </button>
          ) : (
            <button type="submit"
            className="btn btn-primary mb-3"
            onClick={() => setShowPastReservations(true)}
            style={{ cursor: "pointer" }}
            >
              Show Past Reservations
            </button>
          )}
          {pastReservations.length > 0 && showPastReservations ? (
            <div className="user-reservations">
                <h3>Your past reservations</h3>
                <ul className="reservations-list">
                    {pastReservations.map((reservation: any) => (
                        <li 
                          key={reservation.id}
                          className="reservation-item"
                        >
                            <div>Location: {reservation.evlocation.latitude}, {reservation.evlocation.longitude}</div>
                            <div>Address: {reservation.address}</div>
                            <div>Start: {new Date(reservation.start).toLocaleString()}</div>
                            <div>End: {new Date(reservation.end).toLocaleString()}</div>
                        </li>
                    ))}
                </ul>
            </div>
          ) : (
            <h3></h3>
          )}  
        </div>
      </div>
    </div>
  );
}

export default Reservations;
