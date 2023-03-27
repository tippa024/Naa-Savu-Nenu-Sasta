import React, { useState, useCallback } from "react";
import { Marker } from "react-map-gl";

interface LocationMarkerProps {
  onClick: (location: { latitude: number; longitude: number }) => void;
}



const LocationMarker: React.FC<LocationMarkerProps> = ({ onClick }) => {
  const [marker, setMarker] = useState<JSX.Element | null>(null);

 
const handleCheckIn = async () => {
  console.log("handleCheckIn called");
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onClick({ latitude, longitude });
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
            }}
          />
        );
        setMarker(newMarker);
      },
      () => {
        console.log("Unable to retrieve your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
      }
    );
  } 

  return <>{marker}</>;
};

export default LocationMarker;
