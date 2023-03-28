import React, { useRef } from "react";
import Mapbox, { GeolocateControl, NavigationControl, Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import LocationMarker from "./LocationMarker";

function Map() {
    const [viewState, setViewState] = React.useState({
        longitude: 78.4,
        latitude: 14.4,
        zoom: 1,
    });

    const handleCheckIn = ({ latitude, longitude }: { latitude: number; longitude: number }) => {  console.log("handleCheckIn in Map.tsx called with:", latitude, longitude);
        setLocation({ latitude, longitude });
    };

    React.useEffect(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              setLocation({ latitude, longitude });
            },
            error => {
              console.log(`Error getting location: ${error.message}`);
            }
          );
        } else {
          console.log("Geolocation is not supported.");
        }
      }, []);



    const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);


    return (
        <div className="relative h-screen w-full">
            <div className="absolute z-1 h-full w-full">
                <Mapbox
                    {...viewState}
                    onMove={(evt: { viewState: React.SetStateAction<{ longitude: number; latitude: number; zoom: number }>; }) => setViewState(evt.viewState)}
                    mapStyle="mapbox://styles/tippa24/cletvw35m00jp01ms936eiw8v"
                    projection="globe"
                    mapboxAccessToken="pk.eyJ1IjoidGlwcGEyNCIsImEiOiJjbGV1OXl4N2YwaDdtM3hvN2s3dmJmZ3RrIn0.UiNTxwBUS-qZtflxbR0Wpw"
                >
                    <div>
                        <GeolocateControl
                            trackUserLocation={true}
                            positionOptions={{ enableHighAccuracy: true }}
                            position="bottom-right"
                            showUserLocation={true}
                            showAccuracyCircle={true}
                            showUserHeading={true}
                            style={{ position: "absolute", bottom: "40px", right: "10px", background: 'none', padding: '2' }}

                        />
                    </div>

                    <NavigationControl
                        position="bottom-right"
                        visualizePitch={true}
                        style={{ position: "absolute", bottom: "80px", right: "10px", background: 'none', border: 'none', padding: '2' }}
                    />
                    <LocationMarker onCheckIn={setLocation} />
                    {location && (
                        <Marker
                            latitude={location.latitude}
                            longitude={location.longitude}
                            draggable
                            onDragEnd={(e) => {
                                const newLng = e.lngLat.lng;
                                const newLat = e.lngLat.lat;
                                setLocation({ latitude: newLat, longitude: newLng });
                              }}
                              
                        />
                    )}

                </Mapbox>
            </div >
            <button
                className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg px-2 py-1 font-semibold hover:bg-slate-100"
                onClick={() => location && handleCheckIn(location)}
            >
                Check-In
            </button>


        </div >
    );
}

export default Map;
