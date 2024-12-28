import React, { useState } from "react";
import { ControlPosition, MapControl } from "@vis.gl/react-google-maps";
import { PlaceAutocompleteClassic } from "./autocomplete-classic";
import "./custom-map-control.css";
import { useUser } from "../userContext";

type CustomAutocompleteControlProps = {
  controlPosition: ControlPosition;
  onPlaceSelect: (place: any | null) => void;
  userLocations: any;
  onDeleteLocation: (locationId: string) => void;
};

export const CustomMapControl = ({controlPosition,onPlaceSelect, userLocations, onDeleteLocation,}: CustomAutocompleteControlProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [organisationName, setOrganisationName] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  const { userId } = useUser();

  const handleSubmit = (e: React.FormEvent, modalType: "add" | "manage") => {
    e.preventDefault();
    console.log(`Form submitted in ${modalType} modal with place:`, selectedPlace);

    if (selectedPlace) {
      onPlaceSelect(selectedPlace); // Pass selected place back to Management only on submit
    }

    if (modalType === "add") {
      setIsAddModalOpen(false);
    } else if (modalType === "manage") {
      setIsManageModalOpen(false);
    }
  };

  return (
    <div>
      <MapControl position={controlPosition}>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          Add Charging Point
        </button>
        <button className="btn btn-primary" onClick={() => setIsManageModalOpen(true)}>
          Manage Charging Point
        </button>
      </MapControl>

      {/* Add Charging Point Modal */}
      {isAddModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsAddModalOpen(false)}>
              &times;
            </span>
            <form onSubmit={(e) => handleSubmit(e, "add")}>
              <label className="org-label">Organisation/Name:</label>
              <input
                type="text"
                value={organisationName}
                onChange={(e) => setOrganisationName(e.target.value)}
                required
              />
              <div className="autocomplete-control">
                <PlaceAutocompleteClassic
                  onPlaceSelect={(place) => {
                    setSelectedPlace(place);
                  }}
                />
              </div>
              <button className="btn btn-primary" type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Charging Point Modal */}
      {isManageModalOpen && (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => setIsManageModalOpen(false)}>
            &times;
          </span>
          <h2>Your Locations</h2>
          <ul>
          {userLocations && userLocations.length > 0 ? (
                userLocations
                  .filter((location: any) => location.evlocation.createdByuid === userId)
                  .map((location: any) => (
                <li key={location.id}>
                    <p>
                      Latitude: {location.evlocation.evlocation.latitude}, Longitude:{" "}
                      {location.evlocation.evlocation.longitude}
                    </p>
                  <button
                    className="btn btn-danger"
                    onClick={() => onDeleteLocation(location.id)}
                  >
                   Delete
                  </button>
                  </li>
                    ))
                  ) : (
                    <p>No locations available.</p>
                    )}
                  </ul>
                  </div>
                  </div>
                  )}
                  </div>
                );
};
