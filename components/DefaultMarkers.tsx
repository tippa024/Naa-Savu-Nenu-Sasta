import { categoryEmojis } from "./Category";

const numPoints = 20;
export const randomPoints = generateRandomPoints(numPoints);



function generateRandomPoints(numPoints: number) {
  const categories = Object.keys(categoryEmojis);
  const randomPoints = [];

  for (let i = 0; i < numPoints; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomLatitude = (Math.random() * 180) - 90;
    const randomLongitude = (Math.random() * 360) - 180;
    const randomId = Math.random().toString(36).substr(2, 9);
    const randomTime = new Date();

    randomPoints.push({
      Name: "",
      Category: randomCategory,
      Time: randomTime,
      Location: { Latitude: randomLatitude, Longitude: randomLongitude },
      Id: randomId,
    });
  }

  return randomPoints;
}
