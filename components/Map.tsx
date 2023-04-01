import React, { useState, useRef } from "react";
import Mapbox, { GeolocateControl, NavigationControl, Marker, Layer, Source, MapLayerMouseEvent } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { saveCheckInToFirestore, fetchCheckInsFromFirestore, updateCheckInInFirestore, deleteCheckInFromFirestore } from '@/firebase/firebaseHelpers';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import firebase from 'firebase/app';
import { PlayIcon, PauseIcon } from "@heroicons/react/24/outline";
import YouTube, { YouTubeProps } from 'react-youtube';




type CheckIn = {
    id: string;
    latitude: any[];
    longitude: any[];
    name: string;
    category: string;
    // ...
};

function Map() {
    const [viewState, setViewState] = React.useState({
        longitude: 78.4835,
        latitude: 17.408,
        zoom: 1,
    });

    const YTLinks =[
        'https://www.youtube.com/watch?v=_vktceH8ZA0',
        'https://www.youtube.com/watch?v=o3YadwGH0ZA',
        'https://www.youtube.com/watch?v=uPhsq1msjl8',
        'https://www.youtube.com/watch?v=m2CdUHRcqo8',
        'https://www.youtube.com/watch?v=OxNU5-iZnm4'
    
    ]
    function getYouTubeVideoID(url: string): string | null {
        const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regex);
        return match && match[2].length === 11 ? match[2] : null;
    }



    const [play, setPlay] = useState(false);

    const [videoUrl, setVideoUrl] = useState(YTLinks[0]);
    const videoId = getYouTubeVideoID(videoUrl);
    const playerRef = useRef<any>(null);

    const opts = {
        height: '1080', // Set height to screen height
        width: '1920', // Set width to '0' to only play audio
        playerVars: {
            autoplay: 0, // Do not auto-play the video
            controls: 0, // Hide controls
            modestbranding: 1, // Hide YouTube logo
            rel: 0, // Disable related videos
            showinfo: 0, // Hide video info
        },
    };

    const onReady = (event: { target: any }) => {
        playerRef.current = event.target;
    };

    

    const handleTogglePlay = () => {
        const randomLink = YTLinks[Math.floor(Math.random() * YTLinks.length)];
        setVideoUrl(randomLink);
    
        if (playerRef.current) {
          if (play) {
            console.log('Pausing video');
            playerRef.current.pauseVideo();
          } else {
            console.log('Playing video');
            playerRef.current.playVideo();
          }
          setPlay(!play);
        }
      };

    //initializing location state
    const [location, setLocation] = React.useState<{ latitude: number, longitude: number }>();

    //decalre a boolean variable to check if the user has checked in
    const [checkedIn, setCheckedIn] = React.useState(false);

    //declare a variable to store the name of the marker
    const [markerName, setMarkerName] = React.useState('null');

    //declare a variable to store the category of the marker
    const [category, setCategory] = React.useState('null');

    //declare a variable to store the user
    const [user, setUser] = useState<firebase.User | null>(null);

    //declare a variable to store the geoJSON data
    const [geoJSONData, setGeoJSONData] = React.useState<{
        type: string;
        features: Array<{
            type: string;
            properties: { Name: string; Category: string };
            geometry: { coordinates: any; type: string };
            id: string;
        }>;
    }>({
        type: "FeatureCollection",
        features: [],
    });


    //declare a variable to check the number of check ins
    const [checkInCount, setCheckInCount] = React.useState(0);

    //declare a boolean variable to check if the user wants to see the details of the check in
    const [showDetails, setShowDetails] = useState(false);

    //declare a variable to see if the user is editing a check in
    const [editingCheckIn, setEditingCheckIn] = useState(null);

    //declare a variable to see if the user is deleting a check in
    const [deleteCheckIn, setDeleteCheckIn] = useState<CheckIn | null>(null);



    const categoryOptions = [
        "House",
        "Cafe",
        "Coffee Shop",
        "Restaurant",
        "Desserts",
        "Patisserie",
        "Breakfast",
        "Shopping Mall",
        "Park",
        "Vibes",
        "Religious Place",
    ];

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


    React.useEffect(() => {
        if (user) {
            const loadCheckIns = async () => {
                const checkIns = await fetchCheckInsFromFirestore(user.uid);

                setGeoJSONData((prevState) => ({
                    ...prevState,
                    features: checkIns || [],
                }));

                setCheckInCount(checkIns!.length);
            };

            loadCheckIns();
        }
    }, [checkedIn, user, editingCheckIn === false, deleteCheckIn]);

    //auth
    React.useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (loggedInUser) => {
            setUser(loggedInUser);
        });

        return () => {
            unsubscribe();
        };
    }, []);



    //function to handle google sign in
    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in:', error);
        }
    };

    //function to handle check in
    const handleCheckIn = () => {
        if (!user) {
            handleGoogleSignIn();
        } else {
            setCheckedIn(true);
        }
    };

    //function to handle logout
    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    //function to save the location to firestore
    const saveCheckIn = async () => {
        if (markerName !== "null" && category !== "null" && location && user) {
            const checkInData = {
                latitude: location.latitude,
                longitude: location.longitude,
                name: markerName,
                category: category,
                uid: user.uid,
            };

            await saveCheckInToFirestore(checkInData);

            // Reset markerName and category
            setMarkerName("null");
            setCategory("null");
        }
    };

    //function to handle edit
    const handleEdit = (checkIn) => {
        if (editingCheckIn && editingCheckIn.id === checkIn.id) {
            // Save the changes to Firebase
            updateCheckInInFirestore(checkIn.id, {
                latitude: checkIn.latitude,
                longitude: checkIn.longitude,
                name: checkIn.name,
                category: checkIn.category,
            }, user.uid);

            // Reset the editing state
            setEditingCheckIn(null);
        } else {
            setEditingCheckIn(checkIn);
            setLocation({ latitude: checkIn.latitude, longitude: checkIn.longitude });
        }
    };

    //function to handle delete
    const handleDelete = (checkIn) => {
        if (deleteCheckIn && deleteCheckIn.id === checkIn.id) {
            // Delete the check in from Firebase
            deleteCheckInFromFirestore(checkIn.id);

            // Reset the delete state
            setDeleteCheckIn(null);
        } else {
            setDeleteCheckIn(checkIn);

        }
    };



    return (
        <div className="relative w-full h-screen overflow-hidden">
            <div className="relative h-screen w-full z-20">
                <div className="absolute z-1 h-full w-full">
                    <Mapbox
                        {...viewState}
                        onMove={(evt: { viewState: React.SetStateAction<{ longitude: number; latitude: number; zoom: number }>; }) => setViewState(evt.viewState)}
                        mapStyle="mapbox://styles/tippa24/cletvw35m00jp01ms936eiw8v"
                        projection="globe"
                        mapboxAccessToken="pk.eyJ1IjoidGlwcGEyNCIsImEiOiJjbGV1OXl4N2YwaDdtM3hvN2s3dmJmZ3RrIn0.UiNTxwBUS-qZtflxbR0Wpw"
                        fog={{
                            "horizon-blend": 0.01,
                            "color": 'white',
                            "space-color": ( play? "transparent" : "black"),
                            "star-intensity": 0.1,
                        }}
                    >
                        {/*<AudioAnalyzer onFrequencyChange={setFogColor} isPlaying={isPlaying} />


                    <button
                        onClick={() => setIsPlaying((prevIsPlaying) => !prevIsPlaying)}
                        className="absolute bottom-1/3 right-0 p-2 m-4 bg-white rounded shadow"
                    >
                        {isPlaying ? "Pause" : "Play"}
                    </button>*/}
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

                        <Source id="checkIns" type="geojson" data={geoJSONData}>
                            <Layer
                                id="checkIns-markers"
                                type="symbol"
                                source="checkIns"
                                layout={{
                                    "icon-image": [
                                        "step",
                                        ["zoom"],
                                        "1F607",
                                        6,
                                        "Fallback",
                                        7,
                                        [
                                            "match",
                                            ["get", "Category"],
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
                                            ["get", "Category"],
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
                                    "text-field": ["get", "Name"],
                                    "text-font": ["Open Sans Condensed Light", "Arial Unicode MS Bold"],
                                    "text-offset": [0, 1.2],
                                    "text-anchor": "top",
                                }}
                                paint={{
                                    "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0, 13, 1],
                                }}
                            />
                        </Source>

                    </Mapbox>
                </div >
                <div className="absolute z-10 bottom-2 left-0 w-full">
                    {   //checkin button
                        checkedIn === false &&
                        (<button
                            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10  text-gray-500 bg-transparent rounded-lg px-2 py-1 font-semibold hover:bg-black hover:text-white hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
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
                                onClick={() => { setCheckedIn(false); saveCheckIn() }}
                            >
                                Confirm
                            </button>)
                    }
                    {
                        checkedIn &&

                        //input field for marker name
                        (
                            <div className="">
                                <input className="absolute bottom-20 inset-x-0 transform  z-10 rounded-md bg-transparent border-b-2 text-center text-gray-700  placeholder-gray-200 " placeholder="Enter Check-In Name" type="text" onChange={(e) => setMarkerName(e.target.value)} />
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

                </div>
                {user &&

                    <button
                        className="absolute top-2 right-2  z-10  text-gray-500 opacity-50 bg-transparent rounded-lg px-2 py-1 font-semibold hover:bg-black hover:text-white  hover:opacity-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                        onClick={() => handleLogout()}
                    >
                        Logout
                    </button>
                }

                {user && checkInCount > 0 &&

                    <button
                        className="absolute top-2 left-2  z-10  text-gray-500 opacity-50 bg-transparent rounded-lg px-2 py-1 font-semibold hover:bg-black hover:text-white  hover:opacity-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                        onClick={() => setShowDetails(true)}
                    >
                        Edit CheckIn
                    </button>
                }

                {
                    showDetails && checkInCount > 0 &&
                    (
                        <div className="flex flex-col absolute top-10 left-10 z-20 bg-white p-2 rounded-lg shadow hover:p-4 transitio duration-200">
                            {geoJSONData.features.map((feature, index) => {
                                const checkIn = {
                                    name: feature.properties.Name,
                                    category: feature.properties.Category,
                                    id: feature.id,
                                };

                                return (
                                    <div key={index} className="flex p-2 mb-2 border-gray-200 border-b-2 rounded shadow-sm hover:shadow-xl hover:scale-105 transform transition duration-100">
                                        {editingCheckIn && editingCheckIn.id === checkIn.id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    placeholder={checkIn.name}
                                                    onChange={(e) => checkIn.name = e.target.value}
                                                    className="flex-auto mb-2"
                                                />
                                                <select
                                                    placeholder={checkIn.category}
                                                    onChange={(e) => checkIn.category = e.target.value}
                                                    className="flex-auto mb-2"
                                                >
                                                    <option value="">Select Category</option>
                                                    {categoryOptions.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex-auto flex flex-col basis-1/2">
                                                    <div className="basis-1/4">
                                                        <h3 className="font-semibold">{checkIn.name}</h3>
                                                    </div>
                                                    <div className="basis-1/4">
                                                        <h4 className="text-gray-500 text-sm text-light">{checkIn.category}</h4>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="flex-auto flex flex-col px-2">
                                            <button
                                                className="px-2 py-1 mb-1 border-gray-100 border-2 hover:bg-gray-500 hover:border-white hover:text-white text-sm rounded-lg font-semibold hover:scale-105 transform translation duration-75"
                                                onClick={() => handleEdit(checkIn)}
                                            >
                                                {editingCheckIn && editingCheckIn.id === checkIn.id ? "Save" : "Edit"}
                                            </button>
                                            <button className="px-2 py-1 mt-1 border-red-300 border-2 hover:bg-red-500 hover:border-white hover:text-white text-sm rounded-lg font-semibold hover:scale-105 transform translation duration-75"
                                                onClick={() => handleDelete(checkIn)}
                                            >
                                                {deleteCheckIn && deleteCheckIn.id === checkIn.id ? "Confrim D" : "Delete"}
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}


                            {!editingCheckIn && !deleteCheckIn && (
                                <button
                                    className="hover:bg-black hover:text-white px-1 py-1 rounded hover:scale-105 hover:transition hover:duration-100 active:scale-90 transition duration-100 active:shadow-xl"
                                    onClick={() => setShowDetails(false)}
                                >
                                    Close
                                </button>
                            )}

                        </div>
                    )
                }

            </div >
            <div>
                <YouTube
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 "
                    videoId={videoId}
                    opts={opts}
                    onReady={onReady}
                />
                <button
                    className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white opacity-25 z-20"
                    onClick={handleTogglePlay}
                >
                    {play ? <PauseIcon className="h-8" /> : <PlayIcon className="h-8" />}
                </button>
            </div>

        </div >

            );
    
}


            export default Map;
