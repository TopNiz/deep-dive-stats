const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = "3c084bd74c2f77f02d6d6c30c2018bf0";
const WIND_DEG = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW',
    'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
]
const BASE_ICON_URL = "https://openweathermap.org/img/wn/"

var weatherObj;

//?q=Luxembourg&appid=3c084bd74c2f77f02d6d6c30c2018bf0"
function buildUrl(city) {
    return BASE_URL
        + "?q="
        + city
        + "&units=metric"
        + "&appid="
        + API_KEY;
}

async function search() {
    let city = getCity();
    let weather = await getWeather(city);
    update(weather);
}

function getCity() {
    let cityInput = document.querySelector("#city-input");
    return cityInput.value;
}

async function getWeather(city) {
    let url = buildUrl(city);
    let response = await fetch(url);
    return response.json();
}

function update(weather) {
    weatherObj = weather;
    document.querySelector("#city").innerHTML = cityName(weather);
    document.querySelector("#temperature").innerHTML = temperature(weather);
    document.querySelector("#icon").src = icon2x(weather);
    rotateWindIcon(weather);
    document.querySelector("#wind-speed").innerHTML = windSpeed(weather);
    document.querySelector("#wind-deg").innerHTML = windDeg(weather);
    document.querySelector("#pressure").innerHTML = pressure(weather);
    document.querySelector("#humidity").innerHTML = humidity(weather);
    document.querySelector("#visibility").innerHTML = visibility(weather);
}

function cityName(weather) {
    return `${weather.name}, ${weather.sys.country}`;
}

function temperature(weather) {
    return `${weather.main.temp} &deg;C`;
}

function windSpeed(weather) {
    return `${weather.wind.speed} m/s`;
}

function windDeg(weather) {
    let degIndex = Math.floor((weather.wind.deg + 12.25) / 22.5);
    return `${WIND_DEG[degIndex]}`;
}

function pressure(weather) {
    return `${weather.main.pressure} hPa`;
}

function humidity(weather) {
    return `${weather.main.humidity} %`;
}

function visibility(weather) {
    return `${(weather.visibility / 1000).toFixed(1)} km`;
}

function icon(weather) {
    return `${BASE_ICON_URL}${weather.weather[0].icon}.png`;
}

function icon2x(weather) {
    return `${BASE_ICON_URL}${weather.weather[0].icon}@2x.png`;
}

function rotateWindIcon(weather) {
    const windIcon = document.querySelector("#wind-icon");
    windIcon.style.display = "inline-block";
    windIcon.style.transform = `rotate(${weather.wind.deg + 90}deg)`;
}