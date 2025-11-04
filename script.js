let input = document.querySelector(".input");
let searchBtn = document.querySelector(".search-btn");
let weatherBox = document.querySelector(".weather-box");
let weatherDetails = document.querySelector(".weather-details");
let notFound = document.querySelector(".not-found");

async function checkWeather(city) {
    let temperature = document.querySelector(".temperature");
    let description = document.querySelector(".description");
    let humidity = document.querySelector(".humidity span");
    let wind = document.querySelector(".wind span");

    const APIKey = "19542db1e2bfaa66dcd3e12db2585186";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`;    
    
    try {
        const response = await fetch(url);
        const weather = await response.json();
    
        if (weather.cod == 404) { 
            weatherBox.style.display = "none";
            weatherDetails.style.display = "none";

            notFound.style.display = "block";
            notFound.classList.add("fadeIn");
        } else {
            temperature.innerHTML = `${Math.round(weather.main.temp)}<span>°C</span>`;
            description.innerHTML = `${weather.weather[0].description}`;
            humidity.innerHTML = `${weather.main.humidity}%`;
            wind.innerHTML = `${Math.round(weather.wind.speed)} Km/h`;

            let weatherIcon = document.querySelector(".weather-box img");
            weatherIcon.src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;

            notFound.style.display = "none";
            weatherBox.style.display = "block";
            weatherDetails.style.display = "flex";

            weatherBox.classList.add("fadeIn");
            weatherDetails.classList.add("fadeIn");
        }
    } catch (error) {
        console.log("Error in checkWeather", error);
    }
}

function processForecast(forecast) {
    let entries = forecast.list;
    let middayEntries = entries.filter(e => e.dt_txt && e.dt_txt.includes("12:00:00"));
    
    if (middayEntries.length < 3) {
        let alternativeEntries = [];
        for (let i = 0; i < entries.length && alternativeEntries.length < 3; i += 8) {
            alternativeEntries.push(entries[i]);
        }
        middayEntries = alternativeEntries;
    }

    let daysToShow = middayEntries.slice(0, 3);
    let container = document.querySelector(".forecast-container");

    if (!container) return;

    container.innerHTML = "";

    for (let dayEntry of daysToShow) {
        let datetime = dayEntry.dt_txt;
        let temp = Math.round(dayEntry.main.temp);
        let desc = dayEntry.weather[0].description;
        let iconCode = dayEntry.weather[0].icon;

        let date = new Date(datetime.replace(' ', 'T'));
        let dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
        let iconUrl = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";

        let forecastItem = document.createElement("div");
        forecastItem.className = "forecast-day";
        forecastItem.innerHTML = `
            <div class="forecast-date">${dayLabel}</div>
            <img src="${iconUrl}" alt="${desc}">
            <div class="forecast-temp">${temp}°C</div>
            <div class="forecast-desc">${desc}</div>
        `;
        container.appendChild(forecastItem);
    }

        let forecastBlock = document.querySelector(".forecast");
        
        forecastBlock.classList.add("show", "fadeIn");
        forecastBlock.style.display = "block";
        forecastBlock.style.opacity = "1";
        forecastBlock.style.scale = "1";
}

async function handleSearch() {
    let city = input.value.trim().toLowerCase();
    if (!city) return;

    await checkWeather(city);

    const forecast = await checkForecast(city);
    if (forecast) {
        processForecast(forecast);
    } else {
        let forecastBlock = document.querySelector(".forecast");
        forecastBlock.classList.remove("show", "fadeIn");
    }
}

input.addEventListener("input", function () {
    notFound.style.display = "none";
    weatherBox.style.display = "none";
    weatherDetails.style.display = "none";

    notFound.classList.remove("fadeIn");
    weatherBox.classList.remove("fadeIn");
    weatherDetails.classList.remove("fadeIn");

    let forecastBlock = document.querySelector(".forecast");
    forecastBlock.classList.remove("show", "fadeIn");
    forecastBlock.style.display = "none";
});

searchBtn.addEventListener("click", handleSearch);

input.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});

async function checkForecast(city) {
    const APIKey = "19542db1e2bfaa66dcd3e12db2585186";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKey}`;
    
    try {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Forecast data not found");
    }

    const forecast = await response.json();
    
    if (forecast.cod && forecast.cod !== "200") {
        throw new Error(forecast.message || "Forecast not found");
    }

    return forecast;
} catch (error) {
    console.error("Error fetching forecast data:", error);
    return null;
    }
}