import { useRef, useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface Props {
  onPlaceSelect: (place: any | null) => void;
}

export const PlaceAutocompleteClassic = ({ onPlaceSelect }: Props) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address']
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div
      className="autocomplete-container"
    >
      <input
        ref={inputRef}
      />
    </div>
  );
};
