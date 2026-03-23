import { useState, useEffect, useRef } from 'react';

export interface AddressDetails {
  description: string;
  place_id: string;
}

export interface PlaceResult {
  lat: number;
  lng: number;
  zip: string;
  address: string;
}

export function useGoogleAutocomplete(googleLoaded: boolean) {
  const [value, setValue] = useState<PlaceResult | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<readonly AddressDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    let active = true;

    if (!googleLoaded || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    if (!autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }

    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }

    setLoading(true);

    autocompleteService.current.getPlacePredictions(
      { input: inputValue, types: ['address'] },
      (results, status) => {
        if (active) {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setOptions(results);
          } else {
            setOptions([]);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [inputValue, googleLoaded]);

  const handleSelect = (selectedOption: AddressDetails | null) => {
    if (!selectedOption) {
      setValue(null);
      setOptions([]);
      return;
    }

    if (!geocoder.current && window.google) {
      geocoder.current = new window.google.maps.Geocoder();
    }

    if (geocoder.current) {
      geocoder.current.geocode({ placeId: selectedOption.place_id }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          const place = results[0];
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          let zip = '';

          const zipComponent = place.address_components.find(c => c.types.includes('postal_code'));
          if (zipComponent) {
            zip = zipComponent.long_name;
          }

          setValue({
            lat,
            lng,
            zip,
            address: selectedOption.description
          });

          setOptions([{
            description: selectedOption.description,
            place_id: selectedOption.place_id
          }]);
        }
      });
    }
  };

  return { value, setValue, handleSelect, inputValue, setInputValue, options, loading };
}
