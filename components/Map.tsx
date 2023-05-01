import React, { useState, useEffect, useRef, useCallback } from "react";
import Map, {
  GeolocateControl,
  NavigationControl,
  Marker,
  MapRef,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  saveCheckInToFirestore,
  fetchCheckInsFromFirestore,
  updateCheckInInFirestore,
  deleteCheckInFromFirestore,
} from "@/firebase/firebaseHelpers";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { AiOutlineEdit, AiOutlineLogout } from "react-icons/ai";
import { MdEdit, MdDelete, MdOutlineCancel } from "react-icons/md";
import { IoIosArrowUp } from "react-icons/io";

import { categoryOptions, getCategoryEmoji } from "./Category";
import ClusteredMarkers from "./ClusteredMarkers";
import { Timestamp } from "firebase/firestore";
import { handleGoogleSignIn, handleLogout } from "./Auth";
import classNames from "classnames";
import { randomPoints } from "./DefaultMarkers";


function TMap() {
  //Loadmap//////////////////////////////////////////////////////////////////
  const [viewState, setViewState] = useState({
    longitude: 78.4835,
    latitude: 17.408,
    zoom: 1,
  });

  const mapRef = useRef<MapRef>(null);

  const centerMap = useCallback(
    ({
      longitude,
      latitude,
      zoom,
      duration,
    }: {
      longitude: number;
      latitude: number;
      zoom: number;
      duration: number;
    }) => {
      mapRef.current?.flyTo({ center: [longitude, latitude], zoom, duration });
    },
    []
  );

  const [mapLoaded, setMapLoaded] = useState(false);

  //CheckInState//////////////////////////////////////////////////////////////////
  const [CheckIn, setCheckIn] = useState<{
    CheckingIn: boolean;
    Name: string | null;
    Category: string;
    Location: { Latitude: number; Longitude: number } | null;
    LiveLocationAvailability: boolean;
  }>({
    CheckingIn: false,
    Name: null,
    Category: "others",
    Location: { Latitude: 0, Longitude: 0 } || null,
    LiveLocationAvailability: true,
  });

  //EditCheckInState//////////////////////////////////////////////////////////////////
  const [EditCheckIn, setEditCheckIn] = useState<{
    ViewList: boolean;
    ViewCheckIn: boolean;
    Edit: boolean;
    Delete: boolean;
    Name: string | null;
    Location: { Latitude: number; Longitude: number } | null;
    Category: string | null;
    Date: Date | null;
    Id: string | null;
  }>({
    ViewList: true,
    ViewCheckIn: false,
    Edit: false,
    Delete: false,
    Name: null,
    Location: { Latitude: 0, Longitude: 0 } || null,
    Category: null,
    Date: null,
    Id: null,
  });

  //Auth//////////////////////////////////////////////////////////////////
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (loggedInUser) => {
      setUser(loggedInUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  //DiplaycorrectDataonMap//////////////////////////////////////////////////////////////////
  const [geoJSONData, setGeoJSONData] = React.useState<
    Array<{
      Name: string;
      Category: string;
      Time: Timestamp;
      Location: { Latitude: number; Longitude: number };
      Id: string;
    }>
  >([]);

  //getting check ins from firestore
  useEffect(() => {
    if (user) {
      const loadCheckIns = async () => {
        const checkIns = await fetchCheckInsFromFirestore(user.uid);

        const formattedCheckIns = checkIns!.map((checkIn) => ({
          Name: checkIn.name,
          Category: checkIn.category,
          Time: checkIn.time,
          Location: {
            Latitude: checkIn.latitude,
            Longitude: checkIn.longitude,
          },
          Id: checkIn.id,
        }));

        setGeoJSONData(formattedCheckIns);
      };

      loadCheckIns();
    }
  }, [CheckIn.CheckingIn, user, EditCheckIn.Edit, EditCheckIn.Delete]);

  //CheckIn//////////////////////////////////////////////////////////////////

  const handleCheckIn = () => {
    if (!user) {
      handleGoogleSignIn();
    } else if (user && !CheckIn.CheckingIn) {
      setCheckIn((prevState) => ({ ...prevState, CheckingIn: true }));
      setCheckIn((prevState) => ({
        ...prevState,
        Location: {
          Latitude: viewState.latitude,
          Longitude: viewState.longitude,
        },
      }));
      centerMap({
        longitude: viewState.longitude,
        latitude: viewState.latitude,
        zoom: viewState.zoom > 14 ? viewState.zoom : 14,
        duration: 2000,
      });
    } else if (user && CheckIn.CheckingIn) {
      saveCheckIn();
    }
  };
  const saveCheckIn = async () => {
    if (
      CheckIn.Name !== null &&
      CheckIn.Category !== "others" &&
      CheckIn.Location &&
      user
    ) {
      const checkInData = {
        latitude: CheckIn.Location.Latitude,
        longitude: CheckIn.Location.Longitude,
        name: CheckIn.Name,
        category: CheckIn.Category,
        uid: user.uid,
        time: Timestamp.fromDate(new Date()),
      };

      await saveCheckInToFirestore(checkInData);
      setCheckIn((prevState) => ({ ...prevState, CheckingIn: false }));
      setCheckIn((prevState) => ({ ...prevState, Name: null }));
      setCheckIn((prevState) => ({ ...prevState, Category: "others" }));
      setCheckIn((prevState) => ({
        ...prevState,
        Location: { Latitude: 0, Longitude: 0 } || null,
      }));
    }
  };

  //EditCheckIn//////////////////////////////////////////////////////////////////

  const handleViewCheckIn = (Id: string | null) => {
    const checkIn = geoJSONData.find((checkIn) => checkIn.Id === Id);

    if (checkIn) {
      setEditCheckIn((prevState) => ({ ...prevState, ViewCheckIn: true }));
      setEditCheckIn((prevState) => ({ ...prevState, Name: checkIn.Name }));
      setEditCheckIn((prevState) => ({
        ...prevState,
        Category: checkIn.Category,
      }));
      setEditCheckIn((prevState) => ({
        ...prevState,
        Location: checkIn.Location,
      }));
      setEditCheckIn((prevState) => ({ ...prevState, Id: checkIn.Id }));
      if (checkIn.Time) {
        setEditCheckIn((prevState) => ({
          ...prevState,
          Date: checkIn.Time.toDate(),
        }));
      }

      centerMap({
        longitude: checkIn.Location.Longitude,
        latitude: checkIn.Location.Latitude,
        zoom: viewState.zoom,
        duration: 2000,
      });
    }
  };

  const handleBack = (Id: string | null) => {
    if (EditCheckIn.ViewCheckIn && !EditCheckIn.Edit && !EditCheckIn.Delete) {
      setEditCheckIn((prevState) => ({ ...prevState, ViewCheckIn: false }));
    }
    if (EditCheckIn.ViewCheckIn && EditCheckIn.Edit && !EditCheckIn.Delete) {
      const checkIn = geoJSONData.find((checkIn) => checkIn.Id === Id);
      setEditCheckIn((prevState) => ({
        ...prevState,
        Name: checkIn?.Name || null,
      }));
      setEditCheckIn((prevState) => ({
        ...prevState,
        Category: checkIn?.Category || null,
      }));
      setEditCheckIn((prevState) => ({
        ...prevState,
        Location: checkIn?.Location || null,
      }));
      setEditCheckIn((prevState) => ({ ...prevState, Edit: false }));
    }
    if (EditCheckIn.ViewCheckIn && !EditCheckIn.Edit && EditCheckIn.Delete) {
      setEditCheckIn((prevState) => ({ ...prevState, Delete: false }));
    }
  };

  const handleEditCheckIn = async (Id: string | null) => {
    if (!EditCheckIn.Edit) {
      setEditCheckIn((prevState) => ({ ...prevState, Edit: true }));
      centerMap({
        longitude: EditCheckIn.Location?.Longitude || 0,
        latitude: EditCheckIn.Location?.Latitude || 0,
        zoom: viewState.zoom > 14 ? viewState.zoom : 14,
        duration: 2000,
      });
    }
    if (
      EditCheckIn.Edit &&
      EditCheckIn.Name &&
      EditCheckIn.Category &&
      EditCheckIn.Location &&
      EditCheckIn.Date &&
      Id &&
      user
    ) {
      const checkInData = {
        latitude: EditCheckIn.Location.Latitude,
        longitude: EditCheckIn.Location.Longitude,
        name: EditCheckIn.Name,
        category: EditCheckIn.Category,
      };

      await updateCheckInInFirestore(Id, checkInData, user.uid);
      setEditCheckIn((prevState) => ({ ...prevState, Edit: false }));
    }
  };

  const handleDeleteCheckIn = async (Id: string | null) => {
    if (!EditCheckIn.Delete) {
      setEditCheckIn((prevState) => ({ ...prevState, Delete: true }));
    }
    if (EditCheckIn.Delete && Id) {
      await deleteCheckInFromFirestore(Id);
      setEditCheckIn((prevState) => ({ ...prevState, Delete: false }));
      setEditCheckIn((prevState) => ({ ...prevState, ViewCheckIn: false }));
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="relative h-screen w-full z-30">
        <div className="absolute z-10 h-full w-full">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v9"
            projection="globe"
            mapboxAccessToken="pk.eyJ1IjoidGlwcGEyNCIsImEiOiJjbGV1OXl4N2YwaDdtM3hvN2s3dmJmZ3RrIn0.UiNTxwBUS-qZtflxbR0Wpw"
            onLoad={() => setMapLoaded(true)}
          >
            {mapLoaded && (
              <ClusteredMarkers data={user ? geoJSONData : randomPoints} zoom={viewState.zoom} />
            )}

            <div>
              <GeolocateControl
                trackUserLocation={true}
                positionOptions={{ enableHighAccuracy: true }}
                position="bottom-right"
                showUserLocation={true}
                showAccuracyCircle={true}
                showUserHeading={true}
                style={{
                  position: "absolute",
                  bottom: "40px",
                  right: "10px",
                  background: "none",
                  padding: "2",
                }}
              />
              <NavigationControl
                position="bottom-right"
                visualizePitch={true}
                style={{
                  position: "absolute",
                  bottom: "80px",
                  right: "10px",
                  background: "none",
                  border: "none",
                  padding: "2",
                }}
              />
            </div>

            {CheckIn.CheckingIn && CheckIn.Location ? (
              <Marker
                latitude={CheckIn.Location.Latitude}
                longitude={CheckIn.Location.Longitude}
                draggable
                onDragEnd={(e) => {
                  const newLng = e.lngLat.lng;
                  const newLat = e.lngLat.lat;
                  setCheckIn((prevState) => ({
                    ...prevState,
                    Location: { Latitude: newLat, Longitude: newLng },
                  }));
                  centerMap({
                    longitude: newLng,
                    latitude: newLat,
                    zoom: viewState.zoom,
                    duration: 300,
                  });
                }}
                scale={1}
                color="red"
              />
            ) : null}
            {EditCheckIn.Edit && (
              <Marker
                latitude={EditCheckIn.Location?.Latitude || 0}
                longitude={EditCheckIn.Location?.Longitude || 0}
                draggable
                onDragEnd={(e) => {
                  const newLng = e.lngLat.lng;
                  const newLat = e.lngLat.lat;
                  setEditCheckIn((prevState) => ({
                    ...prevState,
                    Location: { Latitude: newLat, Longitude: newLng },
                  }));
                }}
                scale={1}
                color="red"
              >
                <div className="text-3xl">📍</div>
              </Marker>
            )}
          </Map>
        </div>
        <div className="absolute flex-col items-center z-40 bottom-28 left-1/2 -translate-x-1/2 sm:bottom-4 lg:bottom-10">
          {CheckIn.CheckingIn && (
            <div className="flex flex-col items-center">
              <div>
                <input
                  id="CheckInNameInput"
                  className="w-full transform z-10 rounded-md bg-transparent text-center text-gray-700 placeholder-gray-500"
                  placeholder="Enter Check-In Name"
                  type="text"
                  onChange={(e) =>
                    setCheckIn((prevState) => ({
                      ...prevState,
                      Name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="my-2">
                <select
                  id="CheckInCategoryInput"
                  className="bg-gray-100 text-black text-sm rounded-lg focus:ring-white required"
                  value={CheckIn.Category}
                  onChange={(e) =>
                    setCheckIn((prevState) => ({
                      ...prevState,
                      Category: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} ({getCategoryEmoji(option)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="relative flex flex-col items-center justify-center">
            {
              //checkin button
              CheckIn.CheckingIn ? (
                <button
                  className="rounded-lg px-2 py-1 font-semibold hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl bg-black text-white hover:text-black hover:bg-white"
                  onClick={handleCheckIn}
                  disabled={!CheckIn.Name || !CheckIn.Category}
                >
                  Confirm
                </button>
              ) : (
                <button
                  className={classNames(
                    "rounded-lg px-2 py-1 font-semibold active:scale-90 transition duration-100 active:shadow-xl ",
                    {
                      "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:text-gradient-to-r   hover:scale-105 transition duration-200 hover:text-slate-100":
                        !user,
                      "bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500 opacity-80 hover:scale-105 hover:border-2 transition duration-150":
                        user,
                    }
                  )}
                  onClick={() => {
                    handleCheckIn();
                  }}
                >
                  {user ? "Check In" : "Start Your World"}
                </button>
              )
            }
          </div>

          {CheckIn.CheckingIn && (
            <button
              id="CheckInCancelButton"
              className="absolute left-32 bottom-0 mx-4 my-1 p-1  z-10 bg-transparent text-lg text-red-500 rounded-lg px-1 font-semibold hover:bg-red-500 hover:text-white hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
              onClick={() => {
                setCheckIn((prevState) => ({
                  ...prevState,
                  CheckingIn: false,
                }));
              }}
            >
              <MdOutlineCancel />
            </button>
          )}
        </div>

        {user && (
          <button
            className="absolute top-1 right-1 z-10  text-gray-500 opacity-50 text-xl bg-transparent rounded-lg px-2 py-1 font-semibold hover:bg-red-500 hover:text-white  hover:opacity-100 hover:shadow-lg active:scale-90 transition duration-100 active:shadow-xl"
            onClick={() => handleLogout()}
          >
            <AiOutlineLogout />
          </button>
        )}
        <div>
          {user && (
            <button
              className={classNames(
                "absolute bottom-20 sm:bottom-8 left-1 rounded-lg px-2 py-1  z-40 text-2xl",
                {
                  " text-green-500 opacity-70 hover:opacity-100 hover:bg-green-500 hover:text-white ":
                    EditCheckIn.ViewList,
                  "text-gray-500 opacity-50 hover:bg-green-500 hover:opacity-100 hover:text-white":
                    !EditCheckIn.ViewList,
                }
              )}
              onClick={() =>
                setEditCheckIn((prevState) => ({
                  ...prevState,
                  ViewList: !prevState.ViewList,
                }))
              }
            >
              <AiOutlineEdit />
            </button>
          )}

          {user && (
            <div className=" absolute flex max-w-[100vw]  top-14 sm:top-10 z-40 left-1/2 -translate-x-1/2 items-start overflow-x-auto scrollbar-hide">
              {EditCheckIn.ViewList &&
                geoJSONData.map((info) => (
                  <div
                    key={info.Id}
                    className={classNames(
                      "flex whitespace-nowrap",
                      {
                        "  p-1 m-2 hover:scale-105 transition duration-200 bg-gray-100 bg-opacity-25 border-green-500 border  hover:bg-opacity-80 rounded-xl shadow-lg hover:shadow-xl ":
                          EditCheckIn.ViewCheckIn && EditCheckIn.Id === info.Id,
                        "  p-1 m-2  bg-gray-100 shadow-sm rounded-lg hover:shadow-lg hover:bg-green-500 hover:scale-105 active:scale-90 transition-scale duration-100 ease-out":
                          !EditCheckIn.ViewCheckIn,
                        " p-1 m-2  bg-gray-100 scale-90 hover:scale-100 hover:bg-green-200 transition duration-150 rounded-lg":
                          EditCheckIn.ViewCheckIn && EditCheckIn.Id !== info.Id,
                      }
                    )}
                  >
                    {EditCheckIn.ViewCheckIn && EditCheckIn.Id === info.Id ? (
                      <>
                        {EditCheckIn.ViewCheckIn &&
                          EditCheckIn.Name &&
                          EditCheckIn.Category && (
                            <div className="flex-col">
                              {EditCheckIn.Edit ? (
                                <>
                                  <div className="flex m-1 justify-center items-center">
                                    <input
                                      id="CheckInNameInput"
                                      className="rounded-md bg-transparent border-b-2 text-center text-gray-700  placeholder-gray-500 focus:border-0 "
                                      placeholder={EditCheckIn.Name}
                                      type="text"
                                      onChange={(e) =>
                                        setEditCheckIn((prevState) => ({
                                          ...prevState,
                                          Name: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="flex justify-center items-center">
                                    <select
                                      id="CheckInCategoryInput"
                                      className=" bg-gray-100 border-2 border-white text-black text-sm rounded-lg focus:ring-white focus:border-white required"
                                      value={EditCheckIn.Category}
                                      onChange={(e) =>
                                        setEditCheckIn((prevState) => ({
                                          ...prevState,
                                          Category: e.target.value,
                                        }))
                                      }
                                    >
                                      <option value="">Select Category</option>
                                      {categoryOptions.map((option) => (
                                        <option key={option} value={option}>
                                          {option} ({getCategoryEmoji(option)})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex   px-2 mx-1 justify-center items-center">
                                    <div className="font-bold px-1">
                                      {EditCheckIn.Name}
                                    </div>
                                    <div className="font-light text-sm">
                                      {getCategoryEmoji(EditCheckIn.Category!)}
                                    </div>
                                  </div>
                                </>
                              )}
                              <div>
                                <div className="text-sm font-light flex justify-center items-center ">
                                  {EditCheckIn.Edit ? (
                                    <></>
                                  ) : (
                                    <>
                                      {" "}
                                      <div className="px-1 ">
                                        {EditCheckIn.Category}
                                      </div>
                                      <div className="px-1 text-gray-500">
                                        {EditCheckIn.Location!.Latitude.toFixed(
                                          2
                                        )}
                                        ,
                                        {EditCheckIn.Location!.Longitude.toFixed(
                                          2
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div
                                  className={classNames(
                                    "text-xs font-semibold flex  justify-center items-center",
                                    {
                                      "p-2": EditCheckIn.Edit,
                                      "pb-2 px-1": !EditCheckIn.Edit,
                                    }
                                  )}
                                >
                                  <div>
                                    {EditCheckIn.Date
                                      ? EditCheckIn.Date!.toDateString()
                                      : null}
                                  </div>
                                </div>
                                <div className="flex justify-center">
                                  {!EditCheckIn.Delete && (
                                    <button
                                      className={classNames(
                                        "flex justify-center  text-yellow-500 basis-1/3 rounded-xl border-2 border-yellow-500 hover:bg-yellow-500 hover:text-white",
                                        {
                                          "text m-1 px-1 rounded-2xl":
                                            EditCheckIn.Edit,
                                          "text-xl m-1 p-1 rounded-lg":
                                            !EditCheckIn.Edit,
                                        }
                                      )}
                                      onClick={() => {
                                        handleEditCheckIn(EditCheckIn.Id);
                                      }}
                                    >
                                      {EditCheckIn.Edit ? "Save" : <MdEdit />}
                                    </button>
                                  )}
                                  {!EditCheckIn.Edit && (
                                    <button
                                      className={classNames(
                                        "flex justify-center text-red-500 basis-1/3  rounded-xl border-2 border-red-500 hover:bg-red-500 hover:text-white",
                                        {
                                          "text mx-2 my-1 px-3 rounded-2xl ":
                                            EditCheckIn.Delete,
                                          "text-xl m-1 p-1 rounded-lg":
                                            !EditCheckIn.Delete,
                                        }
                                      )}
                                      onClick={() => {
                                        handleDeleteCheckIn(EditCheckIn.Id);
                                      }}
                                    >
                                      {EditCheckIn.Delete ? (
                                        "Sure"
                                      ) : (
                                        <MdDelete />
                                      )}
                                    </button>
                                  )}
                                </div>
                                <div
                                  className={classNames(
                                    "relative top-1 font-extrabold flex mb-1 justify-center rounded-full hover:scale-105 duration-100 ease-out",
                                    {
                                      "bg-green-500 mx-1 hover:scale-105":
                                        EditCheckIn.Delete || EditCheckIn.Edit,
                                    }
                                  )}
                                  onClick={() => {
                                    handleBack(EditCheckIn.Id);
                                  }}
                                >
                                  <button
                                    className={classNames(
                                      "rounded-full hover:text-xl duration-100 ",
                                      {
                                        "text-xl p-1 bg-green-500 rounded-lg hover:text-2xl duration-100 hover:text-white ":
                                          EditCheckIn.Delete ||
                                          EditCheckIn.Edit,
                                      }
                                    )}
                                  >
                                    <IoIosArrowUp />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                      </>
                    ) : (
                      <div
                        className="flex items-center"
                        onClick={() => {
                          handleViewCheckIn(info.Id);
                        }}
                      >
                        <div className="font-bold px-1">{info.Name}</div>
                        <div className="font-light text-sm">
                          {getCategoryEmoji(info.Category)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TMap;
