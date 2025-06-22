const cityInput = document.querySelector('.city-input')
const searchBtn = document.querySelector('.search-btn')
const notFoundSection = document.querySelector('.not-found') 
const searchCitySection = document.querySelector('.search-city')
const weatherInfoSection = document.querySelector('.weather-info')

const countryTxt = document.querySelector('.country-txt')
const tempTxt = document.querySelector('.temp-txt')
const conditionTxt = document.querySelector('.condition-txt')
const humidityTxt = document.querySelector('.humidity-value-txt')
const windTxt = document.querySelector('.wind-value-txt')
const weatherSummaryImg = document.querySelector('.weather-summary-img')
const currentDateTxt = document.querySelector('.current-date-txt')
const forecastItemsContainer = document.querySelector('.forecast-items-container')
const localTimeTxt = document.querySelector('.local-time-txt');
const favoriteToggle = document.querySelector('.favorite-toggle');
const favoritesList = document.querySelector('.favorites-list');
const favoritesSection = document.querySelector('.favorite-section');
const buttons = document.querySelectorAll('.button');


const earthloader = document.getElementById('loadingOverlay') || document.querySelector('.earth-loader-wrapper');

const apikey = '93cd4961451fd6b72e07ecf9247298a7'

searchBtn.addEventListener('click', () =>{
    if(cityInput.value.trim() != ''){
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
});
cityInput.addEventListener('keydown',(event) => {
    if(event.key == 'Enter' && 
        cityInput.value.trim() != ''
    ){
         updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
    console.log(event)
});
async function getFetchData(endPoint, city){
     const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apikey}&units=metric`;

    const response =await fetch(apiUrl)
    if (!response.ok) {
    throw new Error("City not found");
}
    const data = await response.json();
    return data;
}
function getweatherIcon(id, isNight = false) {
    if(isNight){
        if (id <= 232) return 'night_thunder.png'
        if (id <= 321) return 'night_drizzle.png'
        if (id <= 531) return 'night_rain.png'
        if (id <= 622) return 'snow1.png'
        if (id <= 781) return 'tornado1.png'
        if (id <= 800) return 'night_clear.png'
        if (id <= 804) return 'night_moon.png' 
        else return 'cloud.webp'
    }
        if (id <= 232) return 'thunder1.png'
        if (id <= 321) return 'drizzle1.png'
        if (id <= 531) return 'rain1.png'
        if (id <= 622) return 'snow1.png'
        if (id <= 781) return 'tornado1.png'
        if (id <= 800) return 'clear1.png'
        if (id <= 804) return 'sun1.png' 
        else return 'cloud.webp'
}

function getCurrentDate(){
    const currentDate = new Date()
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }
    return currentDate.toLocaleDateString('en-GB',options)
}


async function updateWeatherInfo(city) {
  
 if (!city || city.trim() === '') {
  earthloader.classList.remove('active'); 
  return;
}
  earthloader.classList.add('active'); 

  
 
  try {
    const weatherData = await getFetchData('weather', city);

    if (weatherData.cod != 200) {
      showDisplaySection(notFoundSection);
      earthloader.classList.remove('active');
      return;
    }

    const {
      name: country,
      main: { temp, humidity },
      weather: [{ id, main }],
      wind: { speed },
      timezone,
      sys: { sunrise, sunset }
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + ' °C';
    conditionTxt.textContent = main;
    humidityTxt.textContent = humidity + '%';
    windTxt.textContent = speed + ' M/s';
    currentDateTxt.textContent = getCurrentDate();

    const utcTime = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime.getTime() + timezone * 1000);
    const localTimeFormatted = localTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
    localTimeTxt.textContent = `${localTimeFormatted}`;
    const hours = localTime.getHours();
    const isNight = hours < 6 || hours >= 18;

    if (isNight) applyNightTheme();
    else applyDayTheme();

    weatherSummaryImg.src = `assets/${getweatherIcon(id, isNight)}`;

    favoriteToggle.classList.toggle('favorited', isCityFavorited(country));
    favoriteToggle.style.display = 'inline-flex';
    updateFavoriteBtnState(country);

    const favInput = favoriteToggle.querySelector('input');
    favInput.onchange = () => toggleFavorite(country);

    await updateForecastInfo(city, isNight);
    showDisplaySection(weatherInfoSection);

  } catch (err) {
    console.error(err);
    showDisplaySection(notFoundSection);
  } finally {
    earthloader.classList.remove('active'); 
  }
}

async function updateForecastInfo(city, isNight) {
    const forecastsDate = await getFetchData('forecast', city)

    const timeTaken = '12:00:00'
    const todayDate = new Date().toISOString().split('T')[0]

    forecastItemsContainer.innerHTML = ''
    forecastsDate.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.endsWith("12:00:00") && 
           !forecastWeather.dt_txt.startsWith(todayDate)) {
            updateForecastItems(forecastWeather, isNight)
           }

       
    })
    console.log(todayDate)
}
function updateForecastItems(weatherData, isNight) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = {
        day: '2-digit',
        month: 'short'
    };
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/${getweatherIcon(id, isNight)}" class="forecast-item-img" />
            <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
        </div>
    `;
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => {
    if (sec) sec.style.display = 'none';
  });

 
  if (section === searchCitySection) {
    renderFavorites();
    favoritesSection.style.display = 'block';
  } else {
    favoritesList.innerHTML = '';
    favoritesSection.style.display = 'none';
  }

  if (section) section.style.display = 'flex';
}

function applyDayTheme() {
    document.body.classList.add('day-theme');
    document.body.classList.remove('night-theme');
}

function applyNightTheme() {
    document.body.classList.add('night-theme');
    document.body.classList.remove('day-theme');
}
function isCityFavorited(city) {
  const favs = JSON.parse(localStorage.getItem('favorites')) || [];
  return favs.includes(city);
}

function toggleFavorite(city) {
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  const index = favs.indexOf(city);

  if (index !== -1) {
    favs.splice(index, 1);
  } else {
    favs.push(city);
  }

  localStorage.setItem('favorites', JSON.stringify(favs));
  updateFavoriteBtnState(city);
}


function updateFavoriteBtnState(city) {
  const isFav = isCityFavorited(city);
  favoriteToggle.classList.toggle('favorited', isFav);

  
  const input = favoriteToggle.querySelector('input[type="checkbox"]');
 
  if (input) input.checked = isFav;
 
}

function renderFavorites() {
  const favs = JSON.parse(localStorage.getItem('favorites')) || [];
  favoritesList.innerHTML = '';
  if (favs.length === 0) {
    favoritesList.innerHTML = '<p>No favorite cities yet.</p>';
    return;
  }

  favs.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.className = 'favorite-city';
    li.onclick = () => updateWeatherInfo(city);
    favoritesList.appendChild(li);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  showDisplaySection(searchCitySection);
});

document.addEventListener("DOMContentLoaded", () => {
  const city = document.querySelector('.country-txt')?.textContent;
  if (city) updateFavoriteBtnState(city);
});
buttons.forEach((button) => {
button.addEventListener('click', () => {
  showDisplaySection(searchCitySection);
});
});

document.querySelector('.earth-loader-wrapper').classList.add('active');


setTimeout(() => {
  document.querySelector('.earth-loader-wrapper').classList.remove('active');
}, 3000);
