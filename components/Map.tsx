import React from "react";
import Mapbox, { GeolocateControl, NavigationControl, Marker, Layer, Source } from "react-map-gl";
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
    const [markerName, setMarkerName] = React.useState('null');

    //declare a variable to store the category of the marker
    const [category, setCategory] = React.useState('null');

    //declare a boolean variable to check if broswer supports geolocation
    const [geolocationSupported, setGeolocationSupported] = React.useState(false);

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
            //console.log(existingLocations);
            return existingLocations;
        } else {
            return [];
        }
    });

    // geojson object to store the location data
    const checkInGeoJson = {
        type: 'FeatureCollection',
        features: checkedinpoints.map((point: { longitude: number; latitude: number; name: string; category: string; }, index: React.Key) => ({
            id: index,
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [point.longitude, point.latitude],
            },
            properties: {
                name: point.name,
                category: point.category,
            },
        
        })),
    };
    //console.log(checkInGeoJson);

    //checkinlayer

    const checkinLayer = {

        id: 'checkinlayer',
        type: 'symbol',
        layout: {
            "icon-image": [
              "step",
              ["zoom"],
              "1F607",
              6,
              "Fallback",
              7,
              [
                "match",
                ["get", "category"],
                ["Coffee Shop"],
                "CoffeeShop",
                ["Cafe"],
                "Cafe",
                ["Shopping Mall"],
                "Shopping",
                ["House"],
                "House",
                ["Temple"],
                "Temple",
                "Fallback",
              ],
              22,
              [
                "match",
                ["get", "category"],
                ["Coffee Shop"],
                "CoffeeShop",
                ["Cafe"],
                "Cafe",
                ["Shopping Mall"],
                "Shopping",
                ["House"],
                "House",
                ["Temple"],
                "Temple",
                "Fallback",
              ],
            ],
            "icon-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              0.1,
              8,
              0.5,
              22,
              1,
            ],
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Condensed Light", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.2],
            "text-anchor": "top",
          },
          paint: {
            // Data-driven styling based on zoom level
  
            "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0, 13, 1],
          },
    }

    //getting current location
    React.useEffect(() => {
        if (navigator.geolocation && checkedIn) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                    setGeolocationSupported(true);
                },
                error => {
                    console.log(`Error getting location: ${error.message}`);
                }
            );
        }
    }, [checkedIn]);

    //function to handle check in
    const handleCheckIn = () => {
        setCheckedIn(true);
    };
    //function to save the location to localStorage
    const saveCheckIn = () => {


        if (markerName != 'null' && category != 'null') {
            //get existing location data from localStorage or initialize an empty array
            const existingLocations = JSON.parse(localStorage.getItem("locations") || "[]");

            //add new location to the array to save to localStorage
            existingLocations.push({
                latitude: location?.latitude,
                longitude: location?.longitude,
                name: markerName,
                category: category
            });
            //console.log("1", location?.latitude, location?.longitude, markerName, category)


            //save the updated array to localStorage
            localStorage.setItem("locations", JSON.stringify(existingLocations));

            // add new location to the checkedinpoints array to show on map
            setCheckedInPoints((prevPoints: any) => [...prevPoints, {
                latitude: location?.latitude,
                longitude: location?.longitude,
                name: markerName,
                category: category
            },
                //console.log("2", location?.latitude, location?.longitude, markerName, category)
            ]);

        };

        //reset markerName and category
        setMarkerName('null')
        setCategory('null')
    };
    //function to delete marker
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
              
                    <Source id="places" type="geojson" data={checkInGeoJson.features}>
                    <Layer {...checkinLayer} />
                    </Source>


                </Mapbox>
            </div >
            {   //checkin button
                checkedIn === false &&
                (<button
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10  text-white text-opacity-25 bg-transparent rounded-lg px-2 py-1 font-semibold hover:bg-black hover:text-opacity-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                    onClick={() => handleCheckIn()}
                >
                    Check-In
                </button>)
            }
            {   //confirm button
                checkedIn && location &&
                (
                    <button
                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg px-2 py-1 font-semibold hover:bg-slate-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                        onClick={() => { { setCheckedIn(false); saveCheckIn() } }}
                    >
                        Confirm
                    </button>)
            }
            {
                checkedIn &&

                //input field for marker name
                (
                    <div className="">
                        <input className="absolute bottom-20 inset-x-0 transform  z-10 rounded-md bg-transparent border-b-2 text-center text-white  placeholder-gray-500 " placeholder="Enter Check-In Name" type="text" onChange={(e) => setMarkerName(e.target.value)} />
                    </div>
                )
            }
            {

                //select field for marker category
                checkedIn &&

                (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                        <select className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-white focus:border-white"
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
                    </div>
                )
            }        
        </div >
        
    );
}

export default Map;
