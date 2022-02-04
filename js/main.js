"use strict";

const permission = document.querySelector('.permission');
const positive = document.querySelector('.positive');
const negative = document.querySelector('.negative');
const error = document.querySelector('.error');

const API_KEY = '85c35a552eae17a164b40ef64baa5cca';
const RAIN_MARGIN = 4;

//Esta función oculta todos los paneles
function hidePanels() {
    permission.classList.add('hidden');
    positive.classList.add('hidden');
    negative.classList.add('hidden');
    error.classList.add('hidden');
}

//Esta función muestra un panel
function showPanel(panel) {
    hidePanels();
    panel.classList.remove("hidden");
}


//Esta función hace una petición remota

async function getData({ url, options = {} }) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error('Error realizando petición');
    }

    const data = await response.json();

    return data;

}

//Función que muestra el panel positivo 
function showPositive({temperature, city, weather, rainHour}) {
    showPanel(positive)
    const text = positive.querySelector('p');
    text.innerHTML = `
    Ahora mismo hay ${temperature}ºC en ${city} con  ${weather} y parece que lloverá en ${rainHour} horas`;
}
//Función que muestra el panel negativo
function showNegative(){

}

//Función que consigue los datos del tiempo y analiza si va a llover

async function getWeatherData({ latitude, longitude }) {
    try {
//Pedir condiciones actuales a la api

const currentWheather = await getData({
    url: 'https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=es'});

console.log('currentWheather');


//pedir condiciones de las pŕoximas horas a la api
const nextHoursWheather = await getData(
    {url: 'https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&exclude=current,minutely,daily,alerts&units=metric&lang=es'}
);
console.log('nextHoursWheather');

//comprobar a qué hora es la pŕoxima lluvia
const nextRain = nextHoursWheather.hourly.findIndex((hour) => {
    return hour.wheather[0].main === 'Rain';
})


if (nextRain > -1 && nextRain < RAIN_MARGIN) {
    
//si llueve mostrar panel positivo
showPositive({
    temperature: currentWheather.main.temp,
    city: currentWheather.name,
    weather: currentWheather.weather[0].description,
    rainHour: nextRain + 1,
    currentRaining: currentWheather.wheather[0].main === 'Rain',

})
}
else {
//Si no llueve mostrar panel negativo
}


    } catch {
        showPanel(error);

    }
    
}

//Esta función consigue la localización del usuario
function getUserLocation(){
    hidePanels();
    navigator.geolocation.getCurrentPosition(
        (location) => {
            const { latitude, longitude } = location.coords;
            getWeatherData({ latitude, longitude });
        },
        () => {
            showPanel(error);

        }
    );

}



//Función principal
function main() {
    showPanel(permission);

    const permissionButton = permission.querySelector('button');

    permissionButton.onclick = () => {
        getUserLocation();
    };
    
}

main();