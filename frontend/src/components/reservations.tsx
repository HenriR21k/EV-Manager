import React, { useState, useEffect } from 'react';
import { useUser } from "./userContext";
import { API } from "./api/apiRequest";
import { useNavigate } from "react-router-dom";
import configuration from "../config/configuration";

function Reservations() {
  const { userId } = useUser();
  const [userReservations, setUserReservations] = useState([]);
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
    if (userId) {fetchUserReservations();}
  }, [userId]);
  
  const handleReservationClick = (reservation: any) => {
    navigate("/charging", { state: reservation });
  };

  return (
    <div className="reservations-container">
      <div className="auth-wrapper">
        <div className="auth-inner">
          {userReservations.length > 0 ? (
            <div className="user-reservations">
                <h3>Your Reservations</h3>
                <ul className="reservations-list">
                    {userReservations.map((reservation: any) => (
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
            <p>No reservations found</p>
        )}  
        </div>
      </div>
    </div>
  );
}

export default Reservations;
