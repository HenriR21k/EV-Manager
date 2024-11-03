import React, { useState } from 'react';
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import { PlaceAutocompleteClassic } from './autocomplete-classic';
import './custom-map-control.css';

type CustomAutocompleteControlProps = {
  controlPosition: ControlPosition;
  onPlaceSelect: (place: any | null) => void;
};

export const CustomMapControl = ({
  controlPosition,
  onPlaceSelect,
}: CustomAutocompleteControlProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organisationName, setOrganisationName] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with place:", selectedPlace);

    if (selectedPlace) {
      onPlaceSelect(selectedPlace); // Pass selected place back to Management only on submit
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <MapControl position={controlPosition}>
        <button onClick={() => setIsModalOpen(true)}>Open Form</button>
      </MapControl>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <form onSubmit={handleSubmit}>
              <label>
                Organisation/Name:
                <input 
                  type="text" 
                  value={organisationName} 
                  onChange={(e) => setOrganisationName(e.target.value)} 
                  required 
                />
              </label>
              <div className="autocomplete-control">
                <PlaceAutocompleteClassic onPlaceSelect={(place) => {
                  setSelectedPlace(place);
                }} />
              </div>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
