import { collection, addDoc } from 'firebase/firestore';
import { getDocs, query } from "firebase/firestore";
import { db } from './firebaseConfig';

function prepareCheckInData(id: string, data: { name: any; category: any; longitude: any; latitude: any; }) {
    return {
      type: "Feature",
      properties: {
        Name: data.name,
        Category: data.category,
      },
      geometry: {
        coordinates: [data.longitude, data.latitude],
        type: "Point",
      },
      id: id,
    };
  }
  
  export const saveCheckInToFirestore: (arg0: { latitude: number; longitude: number; name: string; category: string; }) => Promise<void> = async (data) => {
    try {
      const checkInCollection = collection(db, 'checkIns');
      const newCheckInRef = await addDoc(checkInCollection, data);
      console.log(`New check-in added with ID: ${newCheckInRef.id}`);
  
      const preparedData = prepareCheckInData(newCheckInRef.id, data);
      // You can now use the preparedData in the desired format
      console.log(preparedData);

       // Return the prepared data
       return preparedData;
    } catch (e) {
      console.error('Error adding check-in: ', e);
    }
  }

  export async function fetchCheckInsFromFirestore() {
    try {
      const checkInCollection = collection(db, "checkIns");
      const q = query(checkInCollection);
      const querySnapshot = await getDocs(q);
      const checkIns: { type: string; properties: { Name: any; Category: any; }; geometry: { coordinates: any[]; type: string; }; id: string; }[] = [];
  
      querySnapshot.forEach((doc) => {
        const preparedData = prepareCheckInData(doc.id, doc.data());
        checkIns.push(preparedData);
      });
  
      return checkIns;
    } catch (e) {
      console.error("Error fetching check-ins: ", e);
    }
  };

  
  
