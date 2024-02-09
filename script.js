var locationData = document.getElementById("textInput");
var searchIcon = document.querySelector(".search-icon");
var gpsIcon = document.querySelector(".gps-icon");
var cityName;

// API key 
const apiKey = "feedf467abf55ccb704e5f9153857f75";

// event listener of search box
locationData.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    var textSearch = locationData.value.trim();

    if (textSearch === '') {
      alert('Text value is empty');
    } else {
      cityName = textSearch;
      checkWeather(cityName, 'city');

      locationData.value = '';
    }
  }
});

// event listener of search icon
searchIcon.addEventListener("click", function () {
  var textSearch = locationData.value;
  if (textSearch.trim() === '') {
    alert('Text value is empty');
  } else {
    cityName = locationData.value;
    checkWeather(cityName, 'city');
    locationData.value = null;
     }
 
});

// event listener of gps icon
gpsIcon.addEventListener("click", function () {
  findUser()
    .then((position) => {
      const userLocation = { lat: position[0], lon: position[1] };
      checkWeather(userLocation, 'coordinates');
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
});



//function to calculate time
function timeZone(timestamp) {
  const date = new Date(timestamp * 1000);
  const fullDate = {
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    year: date.getFullYear(),
    month: date.toLocaleDateString("en-US", { month: "long" }),
    day: date.getDate(),
  };

  return fullDate;
}

// main function to check weather starts here
async function checkWeather(place, requestType) {
  var currentData;
  var forecastData;
  var airData;

  // function to handle error
  function  handleFetchError(response){
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 404) {
      console.error('City not found. Please enter a valid city name.');
    } else {
      console.error(`Error: ${response.status}`);
    }
  }
  

  if (requestType === 'coordinates') {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${place.lat}&lon=${place.lon}&appid=${apiKey}&units=metric`;
    const apiUrl2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${place.lat}&lon=${place.lon}&appid=${apiKey}&units=metric`;
    const apiUrl3 = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${place.lat}&lon=${place.lon}&appid=${apiKey}&units=metric`
    const currentResponse = await fetch(apiUrl);
    const forecastResponse = await fetch(apiUrl2);
    const airResponse = await fetch(apiUrl3);

    currentData = await handleFetchError(currentResponse);
    forecastData = await handleFetchError(forecastResponse);
    airData = await handleFetchError(airResponse);    
    
    updateWeatherData(currentData, forecastData, airData);
  }
  else if (requestType === 'city'){
    var lat;
    var lon;

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${apiKey}&units=metric`; // forecast
    const apiUrl2 = `https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${apiKey}&units=metric`; // current weather
    const currentResponse = await fetch(apiUrl2);
    const forecastResponse = await fetch(apiUrl);

    currentData = await handleFetchError(currentResponse);
    forecastData = await handleFetchError(forecastResponse);

    lat = currentData.coord.lat;
    lon = currentData.coord.lon;
    const apiUrl3 = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    const airResponse = await fetch(apiUrl3);
    airData = await handleFetchError(airResponse);

    updateWeatherData(currentData, forecastData, airData);
  }


}

function updateWeatherData(currentData, forecastData, airData){
  var currentData = currentData;
  var forecastData = forecastData;
  var airData = airData;

  // extracting current data
var city = currentData.name;
var main = currentData.weather[0].main;
var temperature = currentData.main.temp;
var weatherType = currentData.weather[0].description;
var humidity = currentData.main.humidity;
var windSpeed = currentData.wind.speed;

// extracting forecast data 
var forecastList = forecastData.list;

// calling filter function
forecastFilter(forecastList);


// extracting time data 
var options = { hour: "numeric", minute: "2-digit", hour12: false };
var sunriseTimestamp = currentData.sys.sunrise;
var sunsetTimestamp = currentData.sys.sunset;

var sunriseTime = new Date(sunriseTimestamp * 1000).toLocaleTimeString(
  "en-US",
  options
);
var sunsetTime = new Date(sunsetTimestamp * 1000).toLocaleTimeString(
  "en-US",
  options
);
var timestamp = currentData.dt;
var fullDate = timeZone(timestamp);

// extracting pollution data
var pm2_5 = Math.round(airData.list[0].components.pm2_5);

// modifying elements dynamically using dom methods
document.querySelector(".current-temperature").innerHTML = Math.round(temperature) + "° C";
document.querySelector(".location").innerHTML = city;
document.querySelector(".current-weather-condition").innerHTML = weatherType;
// calling weatherstatus function to change status icon
weatherCardStatus("current-weather-icon", main, weatherType);

document.querySelector(".current-date").innerHTML = fullDate.day + " " + fullDate.month;
document.querySelector("#current-day").innerHTML = fullDate.weekday;
document.querySelector(".current-humidity").innerHTML = humidity + " %";
document.querySelector(".current-wind-speed").innerHTML = windSpeed + " km/h";
document.querySelector(".sunrise").innerHTML = sunriseTime;
document.querySelector(".sunset").innerHTML = sunsetTime;
document.querySelector(".air-quality-index").innerHTML = pm2_5 + " - ";
document.querySelector(".air-quality-status").innerHTML = checkair(pm2_5);

//today small card
document.querySelector(".today p").textContent = fullDate.weekday;
weatherCardStatus("today img", main, weatherType);
document.querySelector(".today h3").textContent = Math.round(temperature) + "° C";
}




//function to change icon to weather status
function weatherCardStatus(elementClass, main, weatherType) {
  var description = weatherType;

  if (main === "Clouds") {
    if (description === "broken clouds") {
      document.querySelector("." + elementClass).setAttribute("src", "./images/broken clouds.gif");
    } else {
      document.querySelector("." + elementClass).setAttribute("src", "./images/cloudy.gif");
    }
  } else if (main === "Clear") {
    document.querySelector("." + elementClass).setAttribute("src", "./images/clear_sky.gif");
  } else if (main === "Rain") {
    if (description === "light rain" || description === "moderate rain") {
      document.querySelector("." + elementClass).setAttribute("src", "./images/light_rain.gif");
    } else if (description === "heavy intensity rain" || description === "very heavy rain") {
      document.querySelector("." + elementClass).setAttribute("src", "./images/rain.gif");
    } else {
      document.querySelector("." + elementClass).setAttribute("src", "./images/heavy_rain.gif");
    }
  } else if (main === "Snow") {
    if (description === "light snow") {
      document.querySelector("." + elementClass).setAttribute("src", "./images/light_snow.gif");
    } else {
      document.querySelector("." + elementClass).setAttribute("src", "./images/snow.gif");
    }
  } else if (main === "Drizzle") {
    document.querySelector("." + elementClass).setAttribute("src", "./images/drizzle.gif");
  } else if (main === "Fog") {
    document.querySelector("." + elementClass).setAttribute("src", "./images/fog.gif");
  } else if (main === "Thunderstorm") {
    document.querySelector("." + elementClass).setAttribute("src", "./images/thunderstorm.gif");
  } else if (main === "Tornado") {
    document.querySelector("." + elementClass).setAttribute("src", "./images/twister.gif");
  } else if (main === "Smoke") {
    document.querySelector("." + elementClass).setAttribute("src", "./images/smoke.png");
  } else if (main === "Mist") {
    document.querySelector("." + elementClass).setAttribute("src", "./images/mist.gif");
  } else if (main === "Haze") {
    document.querySelector("." + elementClass).setAttribute("src", "./images/haze.png");
  }
}

// function to calculate AQI from using PM2_5
function checkair(pm2_5) {
  if (pm2_5 > 0 && pm2_5 <= 12) {
    return "Very  Good";
  } else if (pm2_5 > 12 && pm2_5 <= 35) {
    return "Good";
  } else if (pm2_5 > 35 && pm2_5 <= 55) {
    return "Moderate";
  } else if (pm2_5 > 55 && pm2_5 <= 150) {
    return "Poor";
  } else if (pm2_5 > 150 && pm2_5 <= 250) {
    return "Unhealthy";
  } else if (pm2_5 > 250 && pm2_5 <= 350) {
    return "Severe";
  } else if (pm2_5 > 350 && pm2_5 <= 500) {
    return "Hazardous";
  } else {
    return "Hazardous";
  }
}

// function to filter forecast data
function forecastFilter(forecastList) {
  const dailyForecast = forecastList.filter(entry => {
    return entry.dt_txt.includes('12:00:00');
  });


  for (let i = 1; i < dailyForecast.length; i++) {
    document.querySelector(".day-" + i + " p").textContent = timeZone(dailyForecast[i].dt).weekday;
    weatherCardStatus("day-" + i + " img", dailyForecast[i].weather[0].main, dailyForecast[i].weather[0].description);

    var temperature = Math.round(dailyForecast[i].main.temp);
    document.querySelector(".day-" + i + " h3").innerHTML = temperature + "° C";
  }
}

function findUser() {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          resolve([latitude, longitude]);
        },
        (error) => {
          reject(new Error(`Error getting geolocation: ${error.message}`));
        }
      );
    } else {
      reject(new Error("Geolocation not supported"));
    }
  });
}


function checking(position) {
  var place = position;
  if (place.lat && place.lon) {
    API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${data.lat}&lon=${data.lon}&appid=${key}&units=metric`;
  } else {
    API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${data}&appid=${key}&units=metric`;
  }
}



