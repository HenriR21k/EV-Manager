import { db } from './firebase.js';
import { ref, set } from 'firebase/database';
import { WebSocketServer } from 'ws';

// Create WebSocket server
const port = process.env.PORT || 8081; // Default to 8081 if PORT is not defined
const wss = new WebSocketServer({ port });

// Track client states
const clientStates = new Map();

wss.on('connection', (ws) => {
  console.log("New client connected");

  // Initialize state for this client
  const clientState = {
    model: null,
    energy: 0,
    capacity: 0,
    interval: null,
  };
  clientStates.set(ws, clientState);

  // Send a connection message
  ws.send(JSON.stringify({ message: "Connected to WebSocket server" }));

  // Handle incoming messages
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === "charge" && data.car) {
      console.log("Charging started for:", data.car);

      // Start incrementing energy if not already running
      if (!clientState.interval) {
        const chargeID= data.car.chargeTransaction;
        clientState.model = data.car.model;
        clientState.energy = data.car.current_energy; // Start with the current energy level
        clientState.capacity = data.car.energy_capacity; // Set the max capacity

        clientState.interval = setInterval(() => {
          if (clientState.energy < clientState.capacity) {
            clientState.energy += 1;
            
            WriteCarData(chargeID, clientState.model, clientState.energy, clientState.capacity);
            console.log(`Client car model: ${clientState.model}`)
            console.log(`Client energy: ${clientState.energy}`);
          } else {
            console.log(`Energy capacity reached: ${clientState.energy}/${clientState.capacity}`);
            clearInterval(clientState.interval); // Stop incrementing when capacity is reached
            clientState.interval = null;
          }
        }, 4000); // Increment every second
      }
    } else if (data.type === "Stop") {
      console.log("Stopping for client");
      if (clientState.interval) {
        clearInterval(clientState.interval);
        clientState.interval = null;
        console.log("Client counter stopped");
      }
    }
  });

  // Handle WebSocket close event
  ws.on('close', () => {
    console.log("Client disconnected");
    // Clear any interval associated with the client
    if (clientState.interval) {
      clearInterval(clientState.interval);
    }
    clientStates.delete(ws);
  });

  // Handle WebSocket errors
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
});

function WriteCarData(chargeID, model, energy, capacity) {
  const reference = ref(db, 'chargeTransaction/' + chargeID)

  set(reference, {
    model: model,
    energy: energy,
    capacity: capacity
  })
}

console.log('WebSocket server is running on ws://localhost:8081');