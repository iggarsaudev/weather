

// Obtengo los contenedores
let container = document.getElementById("container")
let divInfoCity = document.getElementById("infoCity")
let container__WeatherForecast = document.getElementById("container__WeatherForecast")
let container__InfoWeather = document.getElementById("container__InfoWeather")

// Obtengo el botón y el input
let btnSearch = document.getElementById("btnSearch")
let city = document.getElementById("city")

// Listener btnSearch
btnSearch.addEventListener("click", () => {
    event.preventDefault(); // Detiene el envío del formulario
    // Obtengo la ciudad a buscar
    let citySearch = city.value
    searchCity(citySearch)
});

// Función para obtener todas las ciudades con ese nombre y añadirlo a un dropdown
function searchCity(city) {
    // Limpiamos infoCity
    infoCity.innerHTML = ""

    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=0&appid=${API_KEY}&lang=es`)
        .then((res) => (res.json()))
        .then((datos) => {
            // console.log(datos[0].lat)
            // console.log(datos[0].lon)
            fillDropdown(datos) // Rellenamos dropDown
            addListener() // Agregamos listener
        })
        .catch((error) => {
            let errorCard = createError("Error al obtener los datos de la ciudad desde al API: " + error.message);
            container__InfoWeather.appendChild(errorCard);
        })
}

// Función para rellenar el dropDown
// Función para rellenar el dropDown
function fillDropdown(datos) {
    // Limpiamos los contenedores de los climas
    container__WeatherForecast.innerHTML = "";
    container__InfoWeather.innerHTML = "";

    if (datos.length === 1) {
        // Si solo hay una ciudad, obtenemos directamente la información del clima
        let cityCountry = `${datos[0].name},${datos[0].country}`;
        getWeatherForecast(cityCountry);
    } else if (datos.length > 1) {
        // Creamos el dropDown
        let dropDown = `
            <select name="dropDown" id="dropDown">
                <option value="" disabled selected>Selecciona una ciudad</option>        
        `;

        // Rellenamos las options con los diferentes resultados
        datos.forEach(city => {
            dropDown += `
                <option value="${city.name},${city.country}">${city.name}, ${city.country}, ${city.state || ""}</option>
            `;
        });

        dropDown += `</select>`;

        // Asignamos al contenedor
        container__WeatherForecast.innerHTML += dropDown;

    } else {
        let errorCard = createError("No se encontraron ciudades con ese nombre.");
        container__InfoWeather.appendChild(errorCard);
    }
}

// Función para agregar el listener al dropDown
// Función para agregar el listener al dropDown
function addListener() {
    let dropDown = document.getElementById("dropDown"); // Obtenemos el dropdown
    if (dropDown) {
        dropDown.addEventListener("change", () => {
            let cityCountry = dropDown.value;

            // Limpiamos los contenedores antes de mostrar nueva información
            container__WeatherForecast.innerHTML = "";
            container__InfoWeather.innerHTML = "";

            dropDown.remove(); // Eliminamos el dropDown antes de obtener los datos

            getWeatherForecast(cityCountry);
        });
    } else {
        console.error("No se encontró el dropdown.");
    }
}


// Función para obtener el pronóstico
function getWeatherForecast(cityCountry) {
    // Limpiamos el container
    // container__WeatherForecast.innerHTML = ""

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityCountry}&appid=${API_KEY}&lang=es`)
        .then((res) => (res.json()))
        .then((datos) => {
            let infoCity = {
                latitud: datos.city.coord.lat,
                longitud: datos.city.coord.lon,
                nombre: datos.city.name,
                poblacion: datos.city.population,
                amanecer: datos.city.sunrise,
                atardecer: datos.city.sunset
            }
            printInfoCity(infoCity)
            printCardWeatherForecast(datos)
            printCardInfoWeather(datos.list[0]) // Muestra el primer pronóstico disponible
        })
        .catch((error) => {
            let errorCard = createError("Error al obtener los datos del pronóstico desde al API: " + error.message);
            container__InfoWeather.appendChild(errorCard);
        })
}

// Función para pintar la información de la ciudad
function printInfoCity(info) {
    // console.log("printInfoCity llamada", info);
    const amanecer = new Date(info.amanecer * 1000).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });
    const atardecer = new Date(info.atardecer * 1000).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });

    let infoSalida = `
        <div class="infoCity">
            <table class="infoCity__table">
                <tr class="infoCity__tr">
                    <td class="infoCity__td">
                        <p class="infoCity__attributes"><i class="fas fa-city infoCity__icon"></i> <span>Ciudad</span> ${info.nombre}</p>
                    </td>
                    <td class="infoCity__td">
                        <p class="infoCity__attributes"><i class="fas fa-users infoCity__icon"></i> <span>Población</span> ${info.poblacion.toLocaleString()}</p>
                    </td>
                    <td class="infoCity__td">
                        <p class="infoCity__attributes"><i class="fas fa-long-arrow-alt-right infoCity__icon"></i> <span>Longitud</span> ${info.longitud}</p>
                    </td>
                    <td class="infoCity__td">
                        <p class="infoCity__attributes"><i class="fas fa-long-arrow-alt-up infoCity__icon"></i> <span>Latitud</span> ${info.latitud}</p>
                    </td>
                    <td class="infoCity__td">
                        <p class="infoCity__attributes"><i class="fas fa-sun infoCity__icon"></i> <span>Amanecer</span> ${amanecer}h</p>
                    </td>
                    <td class="infoCity__td">
                        <p class="infoCity__attributes"><i class="fas fa-moon infoCity__icon"></i> <span>Atardecer</span> ${atardecer}h</p>
                    </td>
                </tr>
            </table>
        </div>
    `;
    divInfoCity.innerHTML += infoSalida;
}

// Función para pintar la card del pronóstico
function printCardWeatherForecast(datos) {
    // console.log("printCardWeatherForecast llamada", datos);
    let diasUnicos = {};

    datos.list.reduce((acc, item) => {
        let fecha = new Date(item.dt * 1000).toDateString();
        let hora = new Date(item.dt * 1000).getHours();

        if (!diasUnicos[fecha] || Math.abs(hora - 12) < Math.abs(diasUnicos[fecha].hora - 12)) {
            diasUnicos[fecha] = { ...item, hora };
        }

        return acc;
    }, {});

    let forecastCard = `<div class="forecast">`;

    Object.values(diasUnicos).forEach(item => {
        let temperatura = convertCelsius(item.main.temp);
        let descripcion = item.weather[0].description;
        let icono = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
        let fechaFormateada = new Date(item.dt * 1000).toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' });

        forecastCard += `
            <div class="forecast__item" data-id="${item.dt}">
                <img src="${icono}" alt="${descripcion}" class="forecast__icon">
                <div class="forecast__info">
                    <p class="forecast__date">${fechaFormateada}</p>
                    <p class="forecast__temp">🌡️ ${temperatura}°C</p>
                </div>
            </div>
        `;
    });

    forecastCard += `</div>`;
    container__WeatherForecast.innerHTML += forecastCard;

    // Agregar event listener a cada pronóstico
    container__WeatherForecast.querySelectorAll('.forecast__item').forEach(item => {
        item.addEventListener("click", () => {
            let id = item.getAttribute('data-id');
            let selectedDay = datos.list.find(weather => weather.dt == id);
            printCardInfoWeather(selectedDay); // Llama a la función para mostrar los detalles del día
        });
    });
}

// Función para pintar la card del día seleccionado, la primera vez mostrará la del día actual
function printCardInfoWeather(item) {
    // console.log("printCardInfoWeather llamada", item);
    // Limpiamos el contenedor
    container__InfoWeather.innerHTML = ""

    let date = new Date(item.dt * 1000); // Fecha y hora del pronóstico en formato Unix
    let formattedDate = date.toLocaleString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let temperature = convertCelsius(item.main.temp);
    let tempMin = convertCelsius(item.main.temp_min);
    let tempMax = convertCelsius(item.main.temp_max);
    let humidity = item.main.humidity;
    let pressure = item.main.pressure;
    let windSpeed = item.wind.speed;
    let description = item.weather[0].description;
    let icon = item.weather[0].icon;
    let clouds = item.clouds.all;
    let feelsLike = convertCelsius(item.main.feels_like);

    let weatherCard = `
        <div class="card">
            <h3 class="card__title">${formattedDate}</h3>
            <img class="card__avatar" src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
            <div class="card__content">
                <p class="card__attributes"><strong>🌡️ Temperatura actual</strong> ${temperature}°C</p>
                <p class="card__attributes"><strong>📈 Temp. máxima</strong> ${tempMax}°C</p>
                <p class="card__attributes"><strong>📉 Temp. mínima</strong> ${tempMin}°C</p>
                <p class="card__attributes"><strong>🥶 Sensación térmica</strong> ${feelsLike}°C</p>
                <p class="card__attributes"><strong>💧 Humedad</strong> ${humidity}%</p>
                <p class="card__attributes"><strong>🔵 Presión atmosférica</strong> ${pressure} hPa</p>
                <p class="card__attributes"><strong>💨 Velocidad del viento</strong> ${windSpeed} m/s</p>
                <p class="card__attributes"><strong>☁  Nubes</strong> ${clouds}%</p>
            </div>
        </div>
    `;

    // Actualizamos el contenedor de la información
    container__InfoWeather.innerHTML = weatherCard; // Esto reemplaza la tarjeta anterior
}


// Función para convertir la hora
function convertTime(currentTime) {
    const time = new Date(currentTime * 1000); // Multiplicamos por 1000 para obtener milisegundos
    return time.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

// Función para convertir temperatura de Kelvin a Celsius
function convertCelsius(kelvin) {
    return (kelvin - 273.15).toFixed(1); // Redondea a 1 decimal
}

// Función para crear el error
function createError(texto) {
    // Creamos el contenedor de la card error y añadimos su clase
    let card = document.createElement("div");
    card.classList.add("error");

    // Mensaje de error
    card.textContent = texto

    return card;
}