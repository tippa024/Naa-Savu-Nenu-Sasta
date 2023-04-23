type CategoryEmojisType = {
    [key: string]: string;
};


export const categoryEmojis: CategoryEmojisType = {
    "Favourite": "❤️",
    "House": "🏠",
    "Cafe": "🍴",
    "Restaurant": "🍽️",
    "Coffee/Tea": "☕️",
    "Breakfast": "🥞",
    "Dessert": "🍮",
    "Shopping Mall": "🛍️",
    "Park": "🌳",
    "Beach": "🏖️",
    "Lake": "🏞️",
    "Mountain": "⛰️",
    "Forest": "🌲",
    "Zoo": "🦁",
    "Airport": "✈️",
    "Aquarium": "🐠",
    "Trail": "🚶",
    "Amusement Park": "🎢",
    "Stadium": "🏟️",
    "Religious Place": "⛪",
    "Bar": "🍻",
    "Party Place": "🎉",
    "Library": "📚",
    "Museum": "🏛️",
    "Movie Theatre": "🍿",
    "Art Gallery": "🎨",
    "Music Venue": "🎵",
    "Casino": "🎰",
    "Hotel": "🏨",
    "Gym": "🏋️",
    "Outdoor Sports": "🚵",
    "Indoor Games": "🎳",
    "View Point": "🏞️",
    "Birth Place": "👶",
    "Other": "🙃",
};

export const categoryOptions = Object.keys(categoryEmojis);

export function getCategoryEmoji(category: string) {
    return categoryEmojis[category] || "😇";
}
