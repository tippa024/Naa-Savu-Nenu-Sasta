import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";


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
  
  export const saveCheckInToFirestore = async (
    data: { latitude: number; longitude: number; name: string; category: string },
    uid: string
  ) => {
    try {
      const checkInCollection = collection(db, 'checkIns');
      const newCheckInRef = await addDoc(checkInCollection, { ...data, uid });
      console.log(`New check-in added with ID: ${newCheckInRef.id}`);
  
      const preparedData = prepareCheckInData(newCheckInRef.id, data, uid);
      // You can now use the preparedData in the desired format
      console.log(preparedData);

       // Return the prepared data
       return preparedData;
    } catch (e) {
      console.error('Error adding check-in: ', e);
    }
  }

  export async function fetchCheckInsFromFirestore(uid: string) 
 {
    try {
        const checkInCollection = collection(db, "checkIns");
        const q = query(checkInCollection, where("userId", "==", uid));
        const querySnapshot = await getDocs(q);
        const checkIns: { type: string; properties: { Name: any; Category: any; }; geometry: { coordinates: any[]; type: string; }; id: string; }[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as { name: any; category: any; longitude: any; latitude: any; };
            const preparedData = {
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


  
  
