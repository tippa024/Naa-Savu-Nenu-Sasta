import React, { useState } from "react";
import Mapbox, { GeolocateControl, NavigationControl, Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import LocationMarker from "./LocationMarker";

function Map() {
    const [viewState, setViewState] = React.useState({
        longitude: 78.4835,
        latitude: 17.408,
        zoom: 1,
    });

    //initializing location state
    const [location, setLocation] = React.useState<{ latitude: number, longitude: number }>();

    //decalre a boolean variable to check if the user has checked in
    const [checkedIn, setCheckedIn] = React.useState(false);

    React.useEffect(() => {
        //get saved location data from localStorage or initialize an empty array
        const savedLocations = JSON.parse(localStorage.getItem("locations") || "[]");

        //map through saved locations to render markers
        const markers = savedLocations.map((savedLocation: { latitude: number; longitude: number }, index: number) => (
            <Marker key={index} latitude={savedLocation.latitude} longitude={savedLocation.longitude}>
                <img src="https://img.icons8.com/ios/50/000000/marker.png" alt="marker" />
            </Marker>
             //render the markers on the map
        setMarkers(markers);
        ));
    }, [])

      //initialize markers state
  const [markers, setMarkers] = React.useState<JSX.Element[]>([]);

    //getting current location
    React.useEffect(() => {
        if (navigator.geolocation && checkedIn) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                },
                error => {
                    console.log(`Error getting location: ${error.message}`);
                }
            );
        }
    }, [checkedIn]);

    //function to handle check in
    const handleCheckIn = (location: { latitude: number; longitude: number }) => {
        console.log(location);
        setCheckedIn(true);
    };
    //function to save the location to localStorage
    const saveCheckIn = () => {
        //get existing location data from localStorage or initialize an empty array
        const existingLocations = JSON.parse(localStorage.getItem("locations") || "[]");

        //add new location to the array
        existingLocations.push(location);

        //save the updated array to localStorage
        localStorage.setItem("locations", JSON.stringify(existingLocations));

    };

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
                    {checkedIn && location && (
                        <Marker

                            latitude={location.latitude}
                            longitude={location.longitude}
                            draggable
                            onDragEnd={(e) => {
                                const newLng = e.lngLat.lng;
                                const newLat = e.lngLat.lat;
                                setLocation({ latitude: newLat, longitude: newLng });
                            }}
                            //style={{backgroundImage: "url('https://img.icons8.com/ios/50/000000/marker.png')", backgroundSize: 'cover', backgroundRepeat: 'no-repeat', width: '50px', height: '50px'}}
                            scale={1}
                            color="red"

                        />
                    )}

                </Mapbox>
            </div >
            {
                checkedIn === false &&
                (<button
                    className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10  text-white text-opacity-25 bg-transparent rounded-lg px-2 py-1 font-semibold hover:bg-black hover:text-opacity-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                    onClick={() => handleCheckIn(location!)}
                >
                    Check-In
                </button>)
            }
            {
                checkedIn && (<button
                    className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg px-2 py-1 font-semibold hover:bg-slate-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                    onClick={() => { { setCheckedIn(false); saveCheckIn() } }}
                >
                    Confirm
                </button>)
            }


        </div >
    );
}

export default Map;
