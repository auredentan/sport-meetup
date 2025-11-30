"use client";

import { useEffect, useRef, useState } from "react";

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: LocationData) => void;
  placeholder?: string;
  required?: boolean;
  apiKey: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "e.g., Central Park, New York",
  required = false,
  apiKey,
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (!inputRef.current || !window.google || !apiKey) return;

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode", "establishment"],
        fields: ["formatted_address", "geometry", "name"],
      }
    );

    // Listen for place selection
    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();

      if (place?.geometry?.location) {
        const locationData: LocationData = {
          address: place.formatted_address || place.name || "",
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setInputValue(locationData.address);
        onChange(locationData);
      }
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [onChange, apiKey]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
    />
  );
}
