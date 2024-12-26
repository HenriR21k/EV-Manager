import React, { useState, useEffect } from 'react';
import { db2 } from "../config/firebase";
import { ref, onValue, query, orderByKey, equalTo } from 'firebase/database';
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

interface Car {
  model: string;
  energy_capacity: number;
  current_energy: number;
}

function Charging() {
  const location = useLocation();
  const reservation = location.state;

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [car, setCar] = useState<Car>({
    model: "EV Model X",
    energy_capacity: 11,
    current_energy: 5,
  });
  const [chargeTransactionId, setChargeTransactionId] = useState<any | null>(null);

  const [modelInput, setModelInput] = useState<string>(car.model);
  const [energyCapacityInput, setEnergyCapacityInput] = useState<number>(car.energy_capacity);
  const [currentEnergyInput, setCurrentEnergyInput] = useState<number>(car.current_energy);

  const [initialEnergy, setInitialEnergy] = useState<number>(car.current_energy);
  const [energyUsed, setEnergyUsed] = useState<number>(0);


  const initializeWebSocket = (sendNow: boolean = false) => {
    const socket = new WebSocket("ws://localhost:8081");

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);

      if (sendNow) {
        const transactionId = Date.now().toString();
        setChargeTransactionId(transactionId);
        setInitialEnergy(car.current_energy);
        socket.send(JSON.stringify({ type: "charge", car: { ...car, chargeTransaction: transactionId } }));
        console.log("Message sent to server with transaction ID:", transactionId);
        fetchCarData(transactionId);
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
        console.log("Car data updated:", data[transactionId]);
        console.log("Energy used:", carData.energy - initialEnergy, "kWh")
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
      setInitialEnergy(car.current_energy);
      ws.send(JSON.stringify({ type: "charge", car: { ...car, chargeTransaction: transactionId } }));
      console.log("Message sent to server with transaction ID:", transactionId);
      fetchCarData(transactionId);
    } else {
      initializeWebSocket(true);
    }
  };

  const handleDisconnect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "Stop", null: {} }));
      ws.close();
      console.log("Disconnected from WebSocket server");
    }
    setWs(null);
    setIsConnected(false);
    setChargeTransactionId(null);
  };

  const handleConfirm = (e: any) => {
    e.preventDefault();
    setCar({
      model: modelInput,
      energy_capacity: energyCapacityInput,
      current_energy: currentEnergyInput,
    });
    console.log(JSON.stringify(car));
  };

  return (
    <div className="charging-container">
      <div className="auth-wrapper">
        <div className="auth-inner">
        {reservation ? (
            <ul className="reservations-list">
              <li className="reservation-item">
                <strong>Location:</strong>{" "}
                {reservation.evlocation.latitude},{" "}
                {reservation.evlocation.longitude}
              </li>
              <li className="reservation-item">
                <strong>Start:</strong>{" "}
                {new Date(reservation.start).toLocaleString()}
              </li>
              <li className="reservation-item">
                <strong>End:</strong>{" "}
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
        </div>
      </div>
    </div>
  );
}

export default Charging;
