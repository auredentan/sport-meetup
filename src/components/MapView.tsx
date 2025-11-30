"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

interface MapViewProps {
  apiKey: string;
  lat: number;
  lng: number;
  location: string;
}

export function MapView({ apiKey, lat, lng, location }: MapViewProps) {
  const position = { lat, lng };

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={position}
          defaultZoom={14}
          mapId="activity-map"
          disableDefaultUI={false}
          gestureHandling="cooperative"
        >
          <Marker position={position} title={location} />
        </Map>
      </APIProvider>
    </div>
  );
}
