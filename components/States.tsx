import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import React, {useState, createContext, useContext} from 'react';

const [CheckIn, setCheckIn] = useState<{
    CheckingIn: boolean;
    Name: string | null;
    Location: { Latitude: number, Longitude: number };
    Category: string;
    LiveLocationAvailability: boolean;
}>({
    CheckingIn: false,
    Name: null,
    Location: { Latitude: 0, Longitude: 0 } || null,
    Category: 'others',
    LiveLocationAvailability: true,
});

//create context for CheckIn
export const CheckInContext = createContext<{
    CheckIn: {
        CheckingIn: boolean;
        Name: string | null;
        Location: { Latitude: number, Longitude: number };
        Category: string;
        LiveLocationAvailability: boolean;
    };
    setCheckIn: React.Dispatch<React.SetStateAction<{
        CheckingIn: boolean;
        Name: string | null;
        Location: { Latitude: number, Longitude: number };
        Category: string;
        LiveLocationAvailability: boolean;
    }>>;
}>({
    CheckIn,
    setCheckIn,
});

export const useCheckIn = () => useContext(CheckInContext);

const [EditCheckIn, setEditCheckIn] = useState<{
    View: boolean;
    Edit: boolean;
    Delete: boolean;
    Name: string ;
    Location: { Latitude: number, Longitude: number };
    Category: string;
    Id: string ;
}>({
    View: false,
    Edit: false,
    Delete: false,
    Name: "",
    Location: { Latitude: 0, Longitude: 0 } || null,
    Category: '',
    Id: '',
});

//create context for EditCheckIn
export const EditCheckInContext = createContext<{
    EditCheckIn: {
        View: boolean;
        Edit: boolean;
        Delete: boolean;
        Name: string ;
        Location: { Latitude: number, Longitude: number };
        Category: string;
        Id: string ;
    };
    setEditCheckIn: React.Dispatch<React.SetStateAction<{
        View: boolean;
        Edit: boolean;
        Delete: boolean;
        Name: string ;
        Location: { Latitude: number, Longitude: number };
        Category: string;
        Id: string ;
    }>>;
}>({
    EditCheckIn,
    setEditCheckIn,
});

export const useEditCheckIn = () => useContext(EditCheckInContext);



const [geoJSONData, setGeoJSONData] = React.useState<Array<{
    Name: string;
    Category: string;
    Time: Timestamp;
    Location: { Latitude: number, Longitude: number };
    Id: string;
}>>([]);

//create context for geoJSONData
export const GeoJSONDataContext = createContext<{
    geoJSONData: Array<{
        Name: string;
        Category: string;
        Time: Timestamp;
        Location: { Latitude: number, Longitude: number };
        Id: string;
    }>;
    setGeoJSONData: React.Dispatch<React.SetStateAction<Array<{
        Name: string;
        Category: string;

        Time: Timestamp;
        Location: { Latitude: number, Longitude: number };
        Id: string;
    }>>>;
}>({
    geoJSONData,
    setGeoJSONData,
});

export const useGeoJSONData = () => useContext(GeoJSONDataContext);






