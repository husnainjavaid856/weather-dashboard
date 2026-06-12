const Url = "https://api.openweathermap.org/data/2.5/weather";
const apiKey = "a5b7e772835b055a097761979e8830be";

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

searchButton.addEventListener("click", async (event) => {
    console.log("Search Button Clicked");
    const city = searchInput.value.trim();
    
    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    const safeCity = encodeURIComponent(city);
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${safeCity}&limit=1&appid=${apiKey}`;

    try {
        const response = await fetch(geoUrl);
        const geoData = await response.json();

        if (geoData && geoData.length > 0) {
            const exactLat = geoData[0].lat;
            const exactLon = geoData[0].lon;
            
            console.log(`Geocoding successfully resolved: ${geoData[0].name}, ${geoData[0].country} -> Lat: ${exactLat}, Lon: ${exactLon}`);
            getWeatherDataByCoords(exactLat, exactLon);
        } else {
            getWeatherData(city);
        }

    } catch (error) {
        console.error("Geocoding lookup failed:", error);
        getWeatherData(city); 
    }
});

async function getWeatherDataByCoords(lat, lon) {
    const url = `${Url}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Coordinates request failed");
        
        const data = await response.json();
        console.log("Accurate Weather Object Loaded:", data);

        localStorage.setItem("lastFetchedWeather", JSON.stringify(data));
        updateUI(data);

    } catch (error) {
        console.error("Coordinate Fetch Error:", error);
    }
}

async function getWeatherData(city) {
    const safeCity = encodeURIComponent(city);
    const url = `${Url}?q=${safeCity}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Text match failed");
        
        const data = await response.json();
        localStorage.setItem("lastFetchedWeather", JSON.stringify(data));
        updateUI(data);

    } catch (error) {
        console.error("Text Engine Error:", error);
        alert("City not found. Try searching with a country code, e.g., 'Skardu, PK'.");
    }
}

function updateUI(data) {

    const unixTimestamp = data.dt;
    const dateObject = new Date(unixTimestamp * 1000);
    const weekday = dateObject.toLocaleString("en-US", { weekday: "short" });
    const day = dateObject.toLocaleString("en-US", { day: "numeric" });
    const month = dateObject.toLocaleString("en-US", { month: "short" });
    const year = dateObject.toLocaleString("en-US", { year: "numeric" });
    const time = dateObject.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    document.getElementById("updatedTime").textContent = `Updated · ${weekday}, ${day} ${month} ${year} · ${time}`;
    const iconCode = data.weather[0].icon;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
   
    document.getElementById("cityName").textContent = data.name;
    document.getElementById("countryCode").textContent = data.sys.country;
    document.getElementById("currentTemp").textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById("weatherDesc").textContent = data.weather[0].description;
    document.getElementById("feelsLike").textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById("humidityRingVal").textContent = `${data.main.humidity}%`;
    document.getElementById("cloudCoverage").textContent = `${data.clouds.all}%`;
    document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
    document.getElementById("visibility").textContent = `${data.visibility / 1000} km`;
    document.getElementById("humidityCondition").textContent = `${data.main.humidity}%`;
    document.getElementById("tempLow").textContent = `Min: ${Math.round(data.main.temp_min)}°C`;
    document.getElementById("tempHigh").textContent = `Max: ${Math.round(data.main.temp_max)}°C`;
    document.getElementById("windSpeed").textContent = `${data.wind.speed} m/s`;
    document.getElementById("windGust").textContent = data.wind.gust ? `${data.wind.gust} m/s` : "N/A";
    
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: false };
    document.getElementById("sunrise").textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], timeOptions);
    document.getElementById("sunset").textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString([], timeOptions);

    const humidity = data.main.humidity;
    const ringCircle = document.getElementById("humidityRingCircle");
    
    if (ringCircle) {
        const totalLength = 377; 
        const offsetValue = totalLength - (humidity / 100) * totalLength;
        ringCircle.style.strokeDashoffset = offsetValue;

        if (humidity > 70) {            
            ringCircle.style.stroke = "#0ea5e9";
        } else if (humidity >= 40 && humidity <= 70) {
            ringCircle.style.stroke = "#10b981"; 
        } else {
            ringCircle.style.stroke = "#f59e0b"; 
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const savedWeatherData = localStorage.getItem("lastFetchedWeather");

    if (savedWeatherData) {
        const parsedData = JSON.parse(savedWeatherData);
        updateUI(parsedData);
    } else {
        getWeatherDataByCoords(35.2981, 75.6333); 
    }
});

let locateButton = document.getElementById("locationBtn");
if (locateButton) {
    locateButton.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    getWeatherDataByCoords(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Location access denied:", error);
                    alert("Unable to fetch automated positioning settings.");
                }
            );
        }
    });
}