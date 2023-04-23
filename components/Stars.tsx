import { CSSProperties, useState } from "react";

function Stars() {

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
    return (
        <>
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
    );
}

export default Stars
