import React, { useState } from "react";
import { Marker } from "react-map-gl";

interface LocationMarkerProps {
  onCheckIn: (location: { latitude: number; longitude: number }) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ onCheckIn }) => {
  console.log('Rendering LocationMarker component...');
  const [marker, setMarker] = useState<JSX.Element | null>(null);

  const createMarker = (latitude: number, longitude: number) => {
    console.log("Rendering createMarker Funtion...");
    const newMarker = (
      <Marker
        longitude={longitude}
        latitude={latitude}
        draggable={true}
        onDragEnd={(e) => {
          const newLng = e.lngLat.lng;
          const newLat = e.lngLat.lat;
          setMarker(
            <Marker
              longitude={newLng}
              latitude={newLat}
              draggable={true}
            />
          );
          onCheckIn({ latitude: newLat, longitude: newLng });
        }}
      />
    );
    setMarker(newMarker);
    onCheckIn({ latitude, longitude });
  };

  return <>{marker}</>;
};

export default LocationMarker;
