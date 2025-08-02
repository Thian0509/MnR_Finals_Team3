"use server"

// Mock function - replace the real one during development
export async function getWeatherAtLocation(lat: number, long: number): Promise<any> {
    // Add a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Generate realistic weather data based on location
    const baseTemp = 15 + (lat + 90) / 180 * 30; // Temperature varies by latitude
    const tempVariation = (Math.random() - 0.5) * 20;
    const temp = baseTemp + tempVariation;

    const visibility = 5000 + Math.random() * 5000; // 5-10km visibility
    const precipitation_prob = Math.random() * 0.8; // 0-80% chance

    // Mock the OpenWeatherMap API response structure
    return {
        current: {
            temp: temp,
            visibility: visibility,
            humidity: 40 + Math.random() * 40, // 40-80%
            wind_speed: Math.random() * 15, // 0-15 m/s
            weather: [{
                main: precipitation_prob > 0.6 ? "Rain" : precipitation_prob > 0.3 ? "Clouds" : "Clear",
                description: precipitation_prob > 0.6 ? "light rain" : precipitation_prob > 0.3 ? "scattered clouds" : "clear sky"
            }]
        },
        hourly: [{
            pop: precipitation_prob, // Probability of precipitation
            temp: temp + (Math.random() - 0.5) * 5,
            weather: [{
                main: precipitation_prob > 0.6 ? "Rain" : "Clear"
            }]
        }],
        daily: [{
            temp: {
                min: temp - 5,
                max: temp + 8
            },
            pop: precipitation_prob
        }]
    };
}

// Real API function (commented out for development)
/*
export async function getWeatherAtLocation(lat: number, long: number): Promise<any> {
    const apiKey = "35f01dc1a5b63ec92e4f71773a4d553f";
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
*/
export async function getRiskFromWeather(weather: any) {
    const temp = weather.current.temp
    const visibility = weather.current.visibility
    const precipitation_prob = weather.hourly[0].pop
    const percentage = (temp + 35) / 60 / 3 + (1 - precipitation_prob) / 3 + visibility / 10000 / 3
    return percentage * 100
}