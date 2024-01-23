const apiKey = process.env.API_KEY;


document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lon = urlParams.get('lon');

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayWeatherDetails(data);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
        });
});


function displayWeatherDetails(weatherData) {
    const weatherDetailsContainer = document.getElementById("weatherDetails");

    const cityName = weatherData.name;
    const temperature = Math.round(weatherData.main.temp - 273.15); // Convert temperature to Celsius
    const weatherDescription = weatherData.weather[0].description;
    const weatherIcon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;

    const htmlCurrentWeather = `
        <h2>${cityName}</h2>
        <img id="weatherIcon" src="${weatherIcon}" alt="Weather Icon">
        <div class="weatherInfo">
            <div>
                <p class="temperature">${temperature}°C</p>
                <p class="description">${weatherDescription}</p>
            </div>
            <div>
                <p>Humidity: ${weatherData.main.humidity}%</p>
                <p>Wind: ${weatherData.wind.speed} m/s</p>
            </div>
        </div>
    `;

    const htmlForecast = `
        <h3>Weekly Weather Forecast</h3>
        <div class="forecast">
            <!-- Forecast details will be displayed here -->
        </div>
    `;

    weatherDetailsContainer.innerHTML = htmlCurrentWeather + htmlForecast;

    fetchWeeklyForecast(cityName);
}

function fetchWeeklyForecast(cityName) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&cnt=30`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayWeeklyForecast(data);
        })
        .catch(error => {
            console.error("Error fetching weekly forecast data:", error);
        });
}

function displayWeeklyForecast(forecastData) {
    const forecastContainer = document.querySelector(".forecast");

    // Group forecast data by day
    const groupedForecast = groupForecastByDay(forecastData.list);

    // Display detailed forecast for each day
    Object.keys(groupedForecast).forEach(day => {
        const dailyForecastEntries = groupedForecast[day];
        const date = new Date(dailyForecastEntries[0].dt * 1000);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const dayHtml = `
            <div class="dailyForecast">
                <p class="dailyForecastHead">${dayOfWeek} ${formattedDate}</p>
        `;

        const hourlyHtml = dailyForecastEntries.map(entry => {
            const hour = new Date(entry.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const temperature = Math.round(entry.main.temp - 273.15);
            const weatherDescription = entry.weather[0].description;
            const weatherIcon = `http://openweathermap.org/img/wn/${entry.weather[0].icon}.png`;
            const humidity = entry.main.humidity;
            const windSpeed = entry.wind.speed;

            return `
                <div>
                    <p>${hour}</p>
                    <img class="weatherIcon" src="${weatherIcon}" alt="Weather Icon">
                    <p class="temperature">${temperature}°C</p>
                    <p class="description">${weatherDescription}</p>
                </div>
            `;
        }).join('');

        const closingHtml = `</div>`;
        forecastContainer.innerHTML += dayHtml + `<div class="hourlyForecast">${hourlyHtml}</div>` + closingHtml;
    });
}


function groupForecastByDay(forecastList) {
    return forecastList.reduce((groupedForecast, forecast) => {
        const date = new Date(forecast.dt * 1000);
        const dayKey = date.toDateString();

        if (!groupedForecast[dayKey]) {
            groupedForecast[dayKey] = [];
        }

        groupedForecast[dayKey].push(forecast);
        return groupedForecast;
    }, {});
}

