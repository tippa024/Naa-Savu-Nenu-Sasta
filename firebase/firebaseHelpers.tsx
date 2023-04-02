import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { GeoJSON, Feature, Geometry, Point } from "geojson";

interface CustomGeoJSONFeature extends Feature {
  properties: {
    Name: string;
    Category: string;
  };
  geometry: Geometry;
}


function prepareCheckInData(id: string, data: { name: string; category: string; longitude: number; latitude: number; }): CustomGeoJSONFeature {
  return {
    type: "Feature",
    properties: {
      Name: data.name,
      Category: data.category,
    },
    geometry: {
      coordinates: [data.longitude, data.latitude],
      type: "Point",
    } as Point,
    id: id,
  };
}
  
  export const saveCheckInToFirestore = async (
    data: { latitude: number; longitude: number; name: string; category: string, uid: string }
  ) => {
    try {
      const checkInCollection = collection(db, 'checkIns');
      const newCheckInRef = await addDoc(checkInCollection, { ...data});
      console.log(`New check-in added with ID: ${newCheckInRef.id}`);
  
      const preparedData = prepareCheckInData(newCheckInRef.id, data);

       // Return the prepared data
       return preparedData;
    } catch (e) {
      console.error('Error adding check-in: ', e);
    }
  }

  export async function fetchCheckInsFromFirestore(uid: string) {
    try {
      const checkInCollection = collection(db, "checkIns");
      const q = query(checkInCollection, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      const checkIns: CustomGeoJSONFeature[] = [];
  
      querySnapshot.forEach((doc) => {
        const data = doc.data() as { name: string; category: string; longitude: number; latitude: number; };
        const preparedData: CustomGeoJSONFeature = {
          type: 'Feature',
          properties: {
            Name: data.name,
            Category: data.category,
          },
          geometry: {
            coordinates: [data.longitude, data.latitude],
            type: 'Point',
          },
          id: doc.id,
        };
        checkIns.push(preparedData);
      });
  
      return checkIns;
    } catch (e) {
      console.error("Error fetching check-ins: ", e);
    }
  }
  


export const updateCheckInInFirestore = async (id: string, updatedData: { latitude: number; longitude: number; name: string; category: string }, uid: string) => {
    try {
        const checkInDoc = doc(db, 'checkIns', id);
        await updateDoc(checkInDoc, { ...updatedData, uid });
        console.log(`Check-in updated with ID: ${id}`);
    } catch (e) {
        console.error('Error updating check-in: ', e);
    }
};

export const deleteCheckInFromFirestore = async (id: string) => {
    try {
        const checkInDoc = doc(db, 'checkIns', id);
        await deleteDoc(checkInDoc);
        console.log(`Check-in deleted with ID: ${id}`);
    } catch (e) {
        console.error('Error deleting check-in: ', e);
    }
};


  
  
