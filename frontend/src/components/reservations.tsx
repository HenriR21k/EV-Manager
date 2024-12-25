import React, { useState, useEffect } from 'react';
import { useUser } from "./userContext";
import { API } from "./api/apiRequest";
import { useNavigate } from "react-router-dom";

function Reservations() {
  const { userId } = useUser();
  const [userReservations, setUserReservations] = useState([]);
  const navigate = useNavigate();

  const fetchUserReservations = async () => {
    try {
        const response = await API.get(`/user/${userId}/Reservations`);
        console.log(response.result)
        if (response.result) {
          
            setUserReservations(response.result);
        }
      } catch (error) {
        console.error("Error fetching user reservations:", error);
      }
    };

  useEffect(() => {
    if (userId) {fetchUserReservations();}
  }, [userId]);
  
  const handleReservationClick = (reservation: any) => {
    navigate("/payments", { state: reservation });
  };

  return (
    <div className="payments-container">
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
