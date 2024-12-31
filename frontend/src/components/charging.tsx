import React, { useState, useEffect } from 'react';
import { db2 } from "../config/firebase";
import { ref, onValue, query, orderByKey, equalTo } from 'firebase/database';
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "./api/apiRequest";
import { useUser } from "./userContext";
import { getAnalytics, logEvent } from 'firebase/analytics';
import { useNavigate } from 'react-router-dom';

interface Car {
  model: string;
  energy_capacity: number;
  current_energy: number;
}

function Charging() {
  const navigate = useNavigate();

  const location = useLocation();
  const reservation = location.state;
  
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [car, setCar] = useState<Car>({
    model: "EV Model",
    energy_capacity: 0,
    current_energy: 0,
  });
  const [chargeTransactionId, setChargeTransactionId] = useState<any | null>(null);

  const [modelInput, setModelInput] = useState<string>(car.model);
  const [energyCapacityInput, setEnergyCapacityInput] = useState<number>(car.energy_capacity);
  const [currentEnergyInput, setCurrentEnergyInput] = useState<number>(car.current_energy);

  const [initialEnergy, setInitialEnergy] = useState<number>(car.current_energy);
  const [energyUsed, setEnergyUsed] = useState<number>(0);

  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const { userId } = useUser();

  const analytics = getAnalytics();

  const initializeWebSocket = (sendNow: boolean = false) => {
    const socket = new WebSocket("wss://ev-manager-websocket.onrender.com");

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);

      if (sendNow) {
        let temp = Date.now()
        const transactionId = temp.toString();
        const timestamp = new Date(temp).toISOString();
        setChargeTransactionId(transactionId);
        socket.send(JSON.stringify({ type: "charge", car: { ...car, chargeTransaction: transactionId } }));
        console.log("Message sent to server with transaction ID:", transactionId);
        fetchCarData(transactionId);

        logEvent(analytics, "charging_session_started", {
          car_model: car.model,
          energy_capacity: car.energy_capacity,
          initial_energy: car.current_energy,
          transaction_id: transactionId,
          timestamp: timestamp,
        });
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };
    setWs(socket);
  };

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  const fetchCarData = (transactionId: any) => {
    const carRef = query(
      ref(db2, 'chargeTransaction'),
      orderByKey(),
      equalTo(transactionId)
    );

    onValue(carRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data[transactionId]) {
        const carData = data[transactionId]
        setCar({
          model: carData.model,
          energy_capacity: carData.capacity,
          current_energy: carData.energy,
        });
        setEnergyUsed(carData.energy - initialEnergy)
        console.log(carData.energy - initialEnergy)
        console.log("Car data updated:", data[transactionId]);
      }
    });
  };

  const handleConnectAndSend = () => {
    const now = new Date();
    const reservationStart = new Date(reservation.start);
    const reservationEnd = new Date(reservation.end);
    console.log(reservationStart,reservationEnd,now);
    if (now < reservationStart || now > reservationEnd) {
      toast.error("You can only connect and send within the reservation time", {
        position: "bottom-center",
      });
      return;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      const transactionId = Date.now().toString();
      setChargeTransactionId(transactionId);
      
      ws.send(JSON.stringify({ type: "charge", car: { ...car, chargeTransaction: transactionId } }));
      console.log("Message sent to server with transaction ID:", transactionId);
      fetchCarData(transactionId);
    } else {
      initializeWebSocket(true);
    }
  };

  const handleEnergyUpdate = async () => {
    try {
      const energyData = {
        additionalEnergyUsed: energyUsed
      };

      await API.put(`/user/${userId}/Energy`, energyData);
      

    } catch (error) {
      console.log(error)
    }
  };


  const handleDisconnect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "Stop", null: {} }));
      ws.close();
      console.log("Disconnected from WebSocket server");
      console.log("energy used: "+energyUsed)

      const disconnectTime = new Date();

      if (energyUsed>0) {
        handleEnergyUpdate();
      }
      logEvent(analytics, "charging_session_ended", {
        car_model: car.model,
        energy_capacity: car.energy_capacity,
        initial_energy: initialEnergy,
        final_energy: car.current_energy,
        energy_used: energyUsed,
        transaction_id: chargeTransactionId,
        timestamp: disconnectTime.toISOString(),
      });
    }

    console.log("ReservationPart2"+reservation)
    navigate("/Checkout", { state: { energyUsed, reservation }});
    
    setEnergyUsed(0);
    setInitialEnergy(car.current_energy)
    setWs(null);
    setIsConnected(false);
    setChargeTransactionId(null);

    
  };

  const handleConfirm = (e: any) => {
    e.preventDefault();

    if (currentEnergyInput>=energyCapacityInput){
      toast.error("Current energy must be smaller than capacity", {
        position: "bottom-center",
      });
      return
    }
    setCar({
      model: modelInput,
      energy_capacity: energyCapacityInput,
      current_energy: currentEnergyInput,
    });
    console.log(JSON.stringify(car));
    setInitialEnergy(currentEnergyInput);
    setIsConfirmed(true);
  };

  return (
    <div className="charging-container">
      <div className="auth-wrapper">
        <div className="auth-inner">
        {reservation ? (
            <ul className="reservations-list">
              <li className="reservation-item">
                Location:{" "}
                {reservation.evlocation.latitude},{" "}
                {reservation.evlocation.longitude}
              </li>
              <li className="reservation-item">
                Location:{" "}
                {reservation.address},{" "}
                
              </li>
              <li className="reservation-item">
                Start:{" "}
                {new Date(reservation.start).toLocaleString()}
              </li>
              <li className="reservation-item">
                End:{" "}
                {new Date(reservation.end).toLocaleString()}
              </li>
            </ul>
          ) : (
            <p>No reservation details provided.</p>
          )}

          <form className="mb-3" onSubmit={handleConfirm}>
            <h3> Input Car Details</h3>

            <div className="mb-3">
              <label>Model Name</label>
              <input
                type="text"
                className="form-control"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label>Energy Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  value={energyCapacityInput}
                  onChange={(e) => setEnergyCapacityInput(Number(e.target.value))}
                />
            </div>

            <div className="mb-3">
            <label>Current Energy</label>
              <input
                type="number"
                className="form-control"
                value={currentEnergyInput}
                onChange={(e) => setCurrentEnergyInput(Number(e.target.value))}
              />
            </div>
            <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                  Confirm
                </button>
            </div>
          </form>
          {isConfirmed ? (
            <div className="car-details">
              <h3>Car Details</h3>
              <ul className="car-list">
                <li className="car-item">Model: {car.model}</li>
                <li className="car-item">Energy Capacity: {car.energy_capacity} kWh</li>
                <li className="car-item">Current Energy: {car.current_energy} kWh</li>
              </ul>
              <div className="d-grid">
                {!isConnected && (
                <button type="submit" className="btn btn-primary" onClick={handleConnectAndSend}>Connect and Send</button>
                )}

                {isConnected && (
                  <button type="submit" className="btn btn-primary" onClick={handleDisconnect}>Disconnect</button>
                )}
              </div>
            </div>
            ) : (
              <p></p>
            )}
        </div>
      </div>
    </div>
  );
}

export default Charging;
