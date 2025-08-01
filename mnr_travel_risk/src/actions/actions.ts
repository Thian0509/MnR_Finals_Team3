"use server"
export async function getWeatherAtLocation(lat: number, long: number): Promise<any> {
    const apiKey = "35f01dc1a5b63ec92e4f71773a4d553f" // process.env.NEXT_PUBLIC_MAPS_API_KEY as string;
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${apiKey}&units=metric`;

    return fetch(url)
        .then(response => response.json())
        .then(async data => {
            return data;
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            return null;
        });
}
export async function getRiskFromWeather(weather: any) {
    const temp = weather.current.temp
    const visibility = weather.current.visibility
    const precipitation_prob = weather.hourly[0].pop
    const percentage = (temp + 35)/60/3 + (1 - precipitation_prob) / 3 + visibility / 10000 / 3
    return percentage * 100
}