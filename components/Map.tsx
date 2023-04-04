import React, { useState, useRef, MutableRefObject } from "react";
import Map, { GeolocateControl, NavigationControl, Marker, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { saveCheckInToFirestore, fetchCheckInsFromFirestore, updateCheckInInFirestore, deleteCheckInFromFirestore } from '@/firebase/firebaseHelpers';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { User } from 'firebase/auth';
import { PlayIcon, PauseIcon } from "@heroicons/react/24/outline";
import YouTube from 'react-youtube';
import { Feature, Geometry, Point, FeatureCollection, BBox } from "geojson";
import { CSSProperties } from 'react';
import classNames from "classnames";
import Supercluster from 'supercluster';
import { AnyProps } from "supercluster";
import { interpolate } from 'd3-interpolate';


const categoryOptions = [
    "House",
    "Cafe",
    "Restaurant",
    'Coffee/Tea',
    "Breakfast",
    "Dessert",
    "Shopping Mall",
    "Park",
    "Beach",
    "Lake",
    "Mountain",
    "Forest",
    "Zoo",
    "Aquarium",
    "Trail",
    "Amusement Park",
    "Stadium",
    "Religious Place",
    "Bar",
    "Library",
    "Museum",
    "Movie Theatre",
    "Art Gallery",
    "Music Venue",
    "Casino",
    "Hotel",
    "Gym",
    "Outdoor Sports",
    "Indoor Games",
    "View Point",
    "Birth Place",
    "Other",
];

function getCategoryEmoji(category: any) {
    switch (category) {
        case "House":
            return "🏠";
        case "Cafe":
            return "🍴";
        case "Restaurant":
            return "🍽️";
        case "Coffee/Tea":
            return "☕";
        case "Breakfast":
            return "🥞";
        case "Dessert":
            return "🍮";
        case "Shopping Mall":
            return "🛍️";
        case "Park":
            return "🌳";
        case "Beach":
            return "🏖️";
        case "Lake":
            return "🏞️";
        case "Mountain":
            return "⛰️";
        case "Forest":
            return "🌲";
        case "Zoo":
            return "🦁";
        case "Aquarium":
            return "🐠";
        case "Trail":
            return "🚶";
        case "Amusement Park":
            return "🎢";
        case "Stadium":
            return "🏟️";
        case "Religious Place":
            return "⛪";
        case "Bar":
            return "🍻";
        case "Library":
            return "📚";
        case "Museum":
            return "🏛️";
        case "Movie Theatre":
            return "🍿";
        case "Art Gallery":
            return "🎨";
        case "Music Venue":
            return "🎵";
        case "Casino":
            return "🎰";
        case "Hotel":
            return "🏨";
        case "Gym":
            return "🏋️";
        case "Outdoor Sports":
            return "🚵";
        case "Indoor Games":
            return "🎳";
        case "View Point":
            return "🏞️";
        case "Birth Place":
            return "👶";
        case "Other":
        default:
            return "🙃";
    }
}



//render checkedin places using custom markers
function renderMarkers(data: { features: any[]; }, zoom: number) {
    return data.features.map((feature, index) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        const category = feature.properties.Category;
        const name = feature.properties.Name;

        const emoji = getCategoryEmoji(category);

        const isTextVisible = zoom >= 12 && zoom <= 22;
        const textOpacity = isTextVisible
            ? Math.min(Math.pow((zoom - 12) / 8, 2), 1)
            : 0;
        const scale = interpolate(0.9, 1);
        const interpolatedScale = scale(textOpacity);

        return (
            <Marker key={index} longitude={longitude} latitude={latitude}>
                <div style={{
                    transform: `scale(${interpolatedScale})`,
                    transition: 'transform 1000ms',
                }} >
                    <div
                        className="relative text-sm text-center"
                    >
                        {emoji}
                    </div >
                    <div className="text-xs  mt-1 font-light font-sans"
                        style={{ opacity: textOpacity, visibility: isTextVisible ? 'visible' : 'hidden' }}
                    >{name}
                    </div>
                </div>
            </Marker>

        );
    });
}


//main map component
function TippaMap() {
    const [viewState, setViewState] = useState({
        longitude: 78.4835,
        latitude: 17.408,
        zoom: 1,

    });


    const [clientRender, setClientRender] = useState(false);

    React.useEffect(() => {
        setClientRender(true);
    }, []);

    //star background code starts here
    const randomColor = () => {
        const colors = ["#ffffff", "#ffe9c4", "#d4fbff", "#ffd4d4", "#e6e6e6", "tomato", "green", "purple"];
        return colors[Math.floor(Math.random() * colors.length)];
    };



    const randomDuration = () => {
        return (Math.random() * 3 + 5) + "s";
    };

    const randomDelay = () => {
        return (Math.random() * 3) + "s";
    };



    const createStars = (count: number) => {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                color: randomColor(),
                duration: randomDuration(),
                delay: randomDelay(),
            });
        }
        return stars;
    };


    const [stars, setStars] = useState(createStars(200));


    //Youtube video code starts here
    const YTLinks = [
        { url: 'https://www.youtube.com/watch?v=DnrpKMXS1fY', title: 'Alive', starttime: 6, coordinates: [0, 0], emoji: '🌍' },
        { url: 'https://www.youtube.com/watch?v=_vktceH8ZA0', title: 'Naatu', starttime: 0, coordinates: [30.52, 50.45], emoji: '🕺🏼🕺🏼' },
        { url: 'https://www.youtube.com/watch?v=M7xQEdKHtv0', title: 'Disco Maghreb', starttime: 0, coordinates: [1.65, 28.03], emoji: "🇩🇿" },
        { url: 'https://www.youtube.com/watch?v=SS3lIQdKP-A', title: 'Masakali', starttime: 0, coordinates: [77.1025, 28.7], emoji: '🕊️' },
        { url: 'https://www.youtube.com/watch?v=Zv_axdInw_o', title: 'Reboot', starttime: 0, coordinates: [4.9, 52.36], emoji: '🎶' },
        { url: 'https://www.youtube.com/watch?v=op4B9sNGi0k', title: 'Magenta Riddim', starttime: 0, coordinates: [78.4835, 17.408], emoji: '🔥' },
        { url: 'https://www.youtube.com/watch?v=34Na4j8AVgA', title: 'Starboy', starttime: 0, coordinates: [-118.2437, 34.0522], emoji: '⭐️' },
        { url: 'https://www.youtube.com/watch?v=665o5OwV_KU', title: 'Interstellar', starttime: 15, coordinates: [-168.966, 42.444], emoji: '🌌' },
        { url: 'https://www.youtube.com/watch?v=j8GSRFS-8tc', title: 'Boomerang', starttime: 0, coordinates: [4.9, 52.36], emoji: '🪃' },
        { url: 'https://www.youtube.com/watch?v=ApXoWvfEYVU', title: 'Sunflower', starttime: 0, coordinates: [-74.006, 40.708], emoji: '🕷️' },
        { url: 'https://www.youtube.com/watch?v=7HaJArMDKgI', title: 'New York Drive', starttime: 1200, coordinates: [-74.006, 40.708], emoji: '🚘' },
        { url: 'https://www.youtube.com/watch?v=_Wb1ASZ4rBA', title: 'Mumbai Drive', starttime: 1020, coordinates: [72.8777, 19.08], emoji: '🚘' },
        { url: 'https://www.youtube.com/watch?v=m2CdUHRcqo8', title: 'Make You Mine', starttime: 0, coordinates: [4.9, 52.36], emoji: '❤️' },
        { url: 'https://www.youtube.com/watch?v=vBzcVRdDGvc', title: 'Hardwell Miami 23', starttime: 0, coordinates: [-80.20, 25.7617], emoji: '🎉' },

    ]

    const [currentEmoji, setCurrentEmoji] = useState("");



    function getYouTubeVideoID(url: string): string | null {
        const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regex);
        return match && match[2].length === 11 ? match[2] : null;
    }

    const [play, setPlay] = useState(false);

    const [startTime, setStartTime] = useState(0);

    const onVideoEnd = () => {
        setPlay(false);
    };

    const [videoTitle, setVideoTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState(YTLinks[7].url);
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
            start: startTime, // Start video at given time
        },
    };

    const [playerReady, setPlayerReady] = useState(false);

    const setDesiredQuality = () => {
        const availableQualityLevels = playerRef.current.getAvailableQualityLevels();

        // Force the video quality to be 1080p or above
        if (availableQualityLevels.includes("hd2160")) {
            playerRef.current.setPlaybackQuality("hd2160");
        } else if (availableQualityLevels.includes("hd1080")) {
            playerRef.current.setPlaybackQuality("hd1080");
        } else {
            // If 1080p and 2160p are not available, use the highest available quality
            playerRef.current.setPlaybackQuality(availableQualityLevels[0]);
        }
    };

    const [highRes, setHighRes] = useState(false);

    // New function to handle quality change event
    const handleQualityChangeEvent = (event: { target: any }) => {
        const currentQuality = event.target.getPlaybackQuality();
        if (currentQuality === 'hd2160' || currentQuality === 'hd1080') {
            setHighRes(true);
        }
    };

    const onReady = (event: { target: any }) => {
        playerRef.current = event.target;
        setPlayerReady(true);
        setDesiredQuality();
        playerRef.current.pauseVideo();
    };

    const [playerOptions, setPlayerOptions] = useState(opts);

    const [currentCoordinates, setCurrentCoordinates] = useState([-168, 42]);

    const handleTogglePlay = () => {
        if (!playerReady) return;

        if (playerRef.current) {
            if (play === true) {
                console.log("Pausing video");
                let randomVideo = YTLinks[Math.floor(Math.random() * YTLinks.length)];
                setVideoUrl(randomVideo.url);
                setVideoTitle(randomVideo.title);
                setStartTime(randomVideo.starttime);
                setCurrentCoordinates(randomVideo.coordinates);
                setCurrentEmoji(randomVideo.emoji);

                // Update playerOptions with the new startTime
                setPlayerOptions({
                    ...playerOptions,
                    playerVars: {
                        ...playerOptions.playerVars,
                        start: randomVideo.starttime,
                    },
                });
                playerRef.current.pauseVideo();
            } else {

                console.log("Playing video");
                centerMap({ longitude: currentCoordinates[0], latitude: currentCoordinates[1] });
                playerRef.current.playVideo();
            }

        }
        setPlay(!play);
    };


    //handle play/pause button
    React.useEffect(() => {
        const handleKeydown = (event: globalThis.KeyboardEvent) => {
            if (event.code === 'MediaPlayPause') {
                handleTogglePlay();
                event.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    }, [handleTogglePlay]);

    //YouTube Code ends here


    const mapRef = useRef<MapRef>();

    type CenterMapParams = {
        longitude: number;
        latitude: number;
    };

    //centering the map for video

    const centerMap = React.useCallback(({ longitude, latitude }: CenterMapParams) => {
        mapRef.current?.flyTo({ center: [longitude, latitude], duration: 2000 });
    }, [play]);

    //initializing location state
    const [location, setLocation] = React.useState<{ latitude: number, longitude: number }>();

    //initializing a boolean variable to check if location is available
    const [locationAvailable, setLocationAvailable] = React.useState(true);

    //decalre a boolean variable to check if the user has checked in
    const [checkedIn, setCheckedIn] = React.useState(false);

    //declare a variable to store the name of the marker
    const [markerName, setMarkerName] = React.useState('null');

    //declare a variable to store the category of the marker
    const [category, setCategory] = React.useState('null');

    //declare a variable to store the user
    const [user, setUser] = useState<User | null>(null);

    interface CustomGeoJSONFeature extends Feature<Point> {
        properties: {
            Name: string;
            Category: string;
        };
        geometry: Point;
    }


    const [geoJSONData, setGeoJSONData] = React.useState<FeatureCollection<Point> & { features: CustomGeoJSONFeature[] }>({
        type: "FeatureCollection",
        features: [],
    });


    function isPoint(geometry: Geometry): geometry is Point {
        return geometry.type === 'Point';
    }

    //declare a variable to check the number of check ins
    const [checkInCount, setCheckInCount] = React.useState(0);

    //declare a boolean variable to check if the user wants to see the details of the check in
    const [showDetails, setShowDetails] = useState(false);

    //declare a variable to see if the user is editing a check in
    const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);

    //declare a variable to see if the user is deleting a check in
    const [deleteCheckIn, setDeleteCheckIn] = useState<CheckIn | null>(null);


    //getting current location
    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                },
                error => {
                    console.log(`Error getting location: ${error.message}`);
                    setLocationAvailable(false);
                }
            );
        }
    }, [checkedIn]);

    //getting check ins from firestore
    React.useEffect(() => {
        if (user) {
            const loadCheckIns = async () => {
                const checkIns = await fetchCheckInsFromFirestore(user.uid);

                setGeoJSONData((prevState) => ({
                    ...prevState,
                    features: (checkIns || []) as CustomGeoJSONFeature[],
                }));

                setCheckInCount(checkIns!.length);
            };

            loadCheckIns();
        }
    }, [checkedIn, user, editingCheckIn, deleteCheckIn]);

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
        if (locationAvailable) {
            if (!user) {
                handleGoogleSignIn();
            } else {
                setCheckedIn(true);
            }
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

    // Create an interface for CheckIn
    interface CheckIn {
        name: string;
        category: string;
        id: string;
        latitude: number;
        longitude: number;
    }

    //function to handle edit
    const handleEdit = (checkIn: CheckIn) => {
        if (editingCheckIn && editingCheckIn.id === checkIn.id) {
            // Save the changes to Firebase
            if (user) {
                updateCheckInInFirestore(checkIn.id, {
                    latitude: checkIn.latitude,
                    longitude: checkIn.longitude,
                    name: checkIn.name,
                    category: checkIn.category,
                }, user.uid);
            }

            // Reset the editing state
            setEditingCheckIn(null);
        } else {
            setEditingCheckIn(checkIn);
            setLocation({ latitude: checkIn.latitude, longitude: checkIn.longitude });
        }
    };

    //function to handle delete
    const handleDelete = (checkIn: CheckIn) => {
        if (deleteCheckIn && deleteCheckIn.id === checkIn.id) {
            // Delete the check in from Firebase
            deleteCheckInFromFirestore(checkIn.id);

            // Reset the delete state
            setDeleteCheckIn(null);
        } else {
            setDeleteCheckIn(checkIn);

        }
    };

    //funtion to handle clustering of markers 
    function createSuperCluster(data: FeatureCollection<Point, AnyProps>) {
        const index = new Supercluster({
            radius: 15,
            maxZoom: 14,
        });

        index.load(data.features);
        return index;
    }

    function getClusteredData(superCluster: Supercluster, zoom: number) {

        const bbox = [-180, -85, 180, 85] as BBox;
        const clusters = superCluster.getClusters(bbox, zoom);

        return {
            ...geoJSONData,
            features: clusters,
        };
    }

    const [superCluster, setSuperCluster] = useState<Supercluster>();


    React.useEffect(() => {
        if (geoJSONData) {
            const clusterIndex = createSuperCluster(geoJSONData);
            setSuperCluster(clusterIndex);
        }
    }, [geoJSONData]);


    const clusteredData = superCluster ? getClusteredData(superCluster, viewState.zoom) : geoJSONData;

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <div className="relative h-screen w-full z-30">
                <div className="absolute z-1 h-full w-full">
                    <Map
                        ref={mapRef as MutableRefObject<MapRef>}
                        {...viewState}
                        onMove={(evt) => setViewState(evt.viewState)}
                        mapStyle="mapbox://styles/tippa24/cletvw35m00jp01ms936eiw8v"
                        projection="globe"
                        mapboxAccessToken="pk.eyJ1IjoidGlwcGEyNCIsImEiOiJjbGV1OXl4N2YwaDdtM3hvN2s3dmJmZ3RrIn0.UiNTxwBUS-qZtflxbR0Wpw"
                    >
                        {superCluster && renderMarkers(clusteredData, viewState.zoom)}

                        {user && play && (
                            <Marker longitude={currentCoordinates[0]} latitude={currentCoordinates[1]}>
                                <span role="img" aria-label="emoji" style={{ fontSize: '16px' }}>
                                    {currentEmoji}
                                </span>
                            </Marker>
                        )}
                        {!user && 
                            YTLinks.map((video) => (
                                <Marker
                                    key={video.url}
                                    longitude={video.coordinates[0]}
                                    latitude={video.coordinates[1]}
                                >
                                    <span
                                        role="img"
                                        aria-label="emoji"
                                        style={{ fontSize: "12px" }}
                                    >
                                        {video.emoji}
                                    </span>
                                </Marker>
                            ))}



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
                                scale={1}
                                color="red"

                            />
                        )}

                    </Map>
                </div >
                <div className="absolute z-40 bottom-28 left-0 w-full sm:bottom-2">
                    {   //checkin button
                        checkedIn === false &&
                        (<button
                            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10  text-gray-500 bg-transparent rounded-lg px-2 py-1 font-semibold hover:bg-black hover:text-white hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                            onClick={() => handleCheckIn()}
                        >
                            {(locationAvailable) ? "Check In" : "Location Unavailable please try after sometime"}
                        </button>)
                    }
                    {
                        checkedIn && location &&
                        (
                            <button
                                id="CheckInConfirmButton"
                                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg px-2 py-1 font-semibold hover:bg-slate-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                                onClick={() => { setCheckedIn(false); saveCheckIn() }}
                            >
                                Confirm
                            </button>)
                    }
                    {
                        checkedIn &&


                        (
                            <div className="">
                                <input id="CheckInNameInput"
                                    className="absolute bottom-20 inset-x-0 transform  z-10 rounded-md bg-transparent border-b-2 text-center text-gray-700  placeholder-gray-500 focus:border-0 "
                                    placeholder="Enter Check-In Name" type="text" onChange={(e) => setMarkerName(e.target.value)} />
                            </div>
                        )
                    }
                    {


                        checkedIn &&

                        (
                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                                <select
                                    id="CheckInCategoryInput"
                                    className=" bg-gray-100 border-2 border-white text-black text-sm rounded-lg focus:ring-white focus:border-white required"
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
                        className="absolute top-10 sm:top-2 right-2  z-10  text-gray-500 opacity-50 bg-transparent rounded-lg px-2 py-1 font-semibold hover:bg-black hover:text-white  hover:opacity-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                        onClick={() => handleLogout()}
                    >
                        Logout
                    </button>
                }

                {user && checkInCount > 0 &&

                    <button
                        className="absolute top-10 sm:top-2 left-2  z-40  text-gray-500 opacity-50 bg-transparent rounded-lg px-2 py-1 font-semibold hover:bg-black hover:text-white  hover:opacity-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
                        onClick={() => setShowDetails(true)}
                    >
                        Edit CheckIn
                    </button>
                }

                {
                    showDetails && checkInCount > 0 &&
                    (
                        <div className="flex flex-col absolute max-h-[80vh] overflow-y-auto top-12 sm:top-4 left-4 z-50 bg-white p-2 rounded-lg shadow hover:p-4 duration-200">
                            {geoJSONData.features.map((feature, index) => {
                                let checkIn: {
                                    name: string;
                                    category: string;
                                    id: any;
                                    latitude: number;
                                    longitude: number;
                                } | null = null;


                                if (isPoint(feature.geometry)) {
                                    checkIn = {
                                        name: feature.properties!.Name,
                                        category: feature.properties!.Category,
                                        id: feature.id,
                                        latitude: feature.geometry.coordinates[1],
                                        longitude: feature.geometry.coordinates[0],
                                    };
                                } else {
                                    return null; // Return null if geometry is not of type Point
                                }


                                return (
                                    <div key={index} className="flex flex-auto p-2 mb-2 border-gray-200  z-40 rounded shadow-sm hover:shadow-xl hover:scale-105 transform transition duration-100">
                                        {editingCheckIn && editingCheckIn.id === checkIn.id ? (
                                            <div className="flex-col flex basis-1/2">
                                                <>
                                                    <input
                                                        type="text"
                                                        placeholder={checkIn.name}
                                                        onChange={(e) => checkIn!.name = e.target.value}
                                                        className="basis-1/2 mb-2 border-gray-200 border-2 rounded"
                                                    />
                                                    <select
                                                        placeholder={checkIn.category}
                                                        onChange={(e) => checkIn!.category = e.target.value}
                                                        className="text-gray-500 bais-1/2 text-sm font-light"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categoryOptions.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </>
                                            </div>
                                        ) : (


                                            <>
                                                <div className=" flex-col basis-1/2 z-40">
                                                    <div className="basis-1/2">
                                                        <h3 className="font-semibold">{checkIn.name}</h3>
                                                    </div>
                                                    <div className="basis-1/2">
                                                        <h4 className="text-gray-500 text-sm text-light">{checkIn.category}</h4>
                                                    </div>
                                                </div>
                                            </>


                                        )}

                                        <div className="flex-auto flex flex-col px-2 z-40">
                                            <button
                                                className="px-2 py-1 mb-1 border-gray-100 border-2 hover:bg-gray-500 hover:border-white hover:text-white text-sm rounded-lg font-semibold hover:scale-105 transform translation duration-75"
                                                onClick={() => handleEdit(checkIn!)}
                                            >
                                                {editingCheckIn && editingCheckIn.id === checkIn.id ? "Save" : "Edit"}
                                            </button>
                                            <button className="px-2 py-1 mt-1 border-red-300 border-2 hover:bg-red-500 hover:border-white hover:text-white text-sm rounded-lg font-semibold hover:scale-105 transform translation duration-75"
                                                onClick={() => handleDelete(checkIn!)}
                                            >
                                                {deleteCheckIn && deleteCheckIn.id === checkIn.id ? "Confrim" : "Delete"}
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}


                            {!editingCheckIn && !deleteCheckIn && (
                                <button
                                    className="hover:bg-black hover:text-white px-1 py-1 z-40 rounded hover:scale-105 hover:transition hover:duration-100 active:scale-90 transition duration-100 active:shadow-xl"
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
                {
                    <YouTube
                        className={classNames("absolute top-1/2 left-1/2 scale-[110%] -translate-y-[46%] bg-black transform -translate-x-1/2  z-0", {
                            "filter blur-md": !highRes,
                            "sm:blur-none": highRes,
                        }

                        )}
                        videoId={videoId!}
                        opts={opts}
                        onReady={onReady}
                        onEnd={() => {
                            onVideoEnd();
                        }}
                        onPlaybackQualityChange={handleQualityChangeEvent}
                    />
                }
                {clientRender && (
                    <>

                        <div
                            id="blackoverlay"
                            className={classNames("fixed top-0 left-0 w-screen h-screen z-10 bg-black ", {
                                "opacity-0 ": play,
                                "opacity-100 transition-opacity duration-2000 ease-in-out": !play,
                            }
                            )}

                        >
                        </div>
                        <div
                            id="stars"
                            className="fixed top-0 left-0 w-screen h-screen z-20 bg-transparent"
                        >
                            {stars.map((star, index) => (
                                <div
                                    key={index}
                                    className="star"
                                    style={{
                                        top: `${star.y}%`,
                                        left: `${star.x}%`,
                                        backgroundColor: star.color,
                                        '--duration': star.duration,
                                        '--delay': star.delay,

                                    } as CSSProperties}
                                ></div>
                            ))}


                        </div>
                    </>

                )}


                <button
                    className="absolute top-10 rounded-2xl sm:top-2 left-1/2 transform -translate-x-1/2 text-white opacity-50 z-40 text-lg sm:text-base"
                    onClick={handleTogglePlay}
                >
                    {play ? <PauseIcon className="h-8 items-center" /> : <PlayIcon className="glitter-animation h-8" />}
                </button>
                {play &&
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                        <div className="absolute top-20 sm:top-10 left-1/2 -translate-x-1/2 text-white text-lg sm:text-sm opacity-25 contrast-200 font-light z-40">
                            {videoTitle}
                        </div>
                    </a>
                }
            </div>

        </div >

    );

}


export default TippaMap;

