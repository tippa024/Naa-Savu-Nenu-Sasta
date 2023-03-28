import React from "react";
import Mapbox, { GeolocateControl, NavigationControl, Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";


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

    //declare a variable to store the name of the marker
    const [markerName, setMarkerName] = React.useState('');

    //declare a variable to store the category of the marker
    const [category, setCategory] = React.useState("");

    const categoryOptions = [
        "House",
        "Cafe",
        "Coffee Shop",
        "Restaurant",
        "Desserts",
        "Patisserie",
        "Breakfast",
        "Park",
        "Vibes",
        "Religious Place",
    ];



    //import locations from localStorage   
    const [checkedinpoints, setCheckedInPoints] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const existingLocations = JSON.parse(localStorage.getItem("locations") || "[]");
            console.log(existingLocations);
            return existingLocations;
        } else {
            return [];
        }
    });


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
        existingLocations.push({
            latitude: location?.latitude,
            longitude: location?.longitude,
            name: markerName,
            category: category
        });

        //save the updated array to localStorage
        localStorage.setItem("locations", JSON.stringify(existingLocations));

        // add new location to the checkedinpoints array
        setCheckedInPoints((prevPoints: any) => [...prevPoints, {
            latitude: existingLocations[existingLocations.length - 1].latitude,
            longitude: existingLocations[existingLocations.length - 1].longitude,
            name: existingLocations[existingLocations.length - 1].name,
            category: existingLocations[existingLocations.length - 1].category
        },
        ]);

    };

    const deleteMarker = (index: number) => {
        // remove marker from checkedinpoints state array
        setCheckedInPoints((prevPoints: any) => {
            const newPoints = [...prevPoints];
            newPoints.splice(index, 1);
            return newPoints;
        });

        // remove marker from local storage
        if (typeof window !== 'undefined') {
            const existingLocations = JSON.parse(localStorage.getItem('locations') || '[]');
            existingLocations.splice(index, 1);
            localStorage.setItem('locations', JSON.stringify(existingLocations));
        }
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
                    {checkedinpoints.map((point: { latitude: number ; longitude: number; name: string; category: string }, index:number) => (
                        <><Marker
                            key={index}
                            latitude={point.latitude}
                            longitude={point.longitude}
                            scale={0.4}
                            color="white"
                            onClick={() => deleteMarker(index)} 
                            />
                            
                            <Popup
                                latitude={point.latitude}
                                longitude={point.longitude}
                                closeButton={true}
                                anchor="bottom"
                            >
                                <div>
                                    <h2>{point.name}</h2>
                                    <p>{point.category}</p>
                                </div>
                            </Popup></>
                    ))}


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
                checkedIn &&
                (
                    <button
                        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg px-2 py-1 font-semibold hover:bg-slate-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                        onClick={() => { { setCheckedIn(false); saveCheckIn() } }}
                    >
                        Confirm
                    </button>)
            }
            {
                checkedIn &&

                (<input className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10 rounded-md bg-white text-black placeholder-gray-500" placeholder="Enter Name" type="text" onChange={(e) => setMarkerName(e.target.value)} />
                )
            }
            {
                checkedIn &&

                (<select className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10 rounded-md bg-white text-black placeholder-gray-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Select Category</option>
                    {categoryOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                )
            }


        </div >
    );
}

export default Map;
