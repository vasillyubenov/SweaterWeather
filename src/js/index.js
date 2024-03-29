import { FirebaseController } from "./firebaseController.js";

const firebaseController = new FirebaseController();

const searchForm = document.querySelector("#search-form");
const compareForm = document.querySelector("#compare-form");
const input = document.querySelector("#search-term");
const alarm = document.querySelector("#alarm-utility");
const logoutButton = document.querySelector("#logout-btn");
const msg = document.querySelector(".form-msg");
const list = document.querySelector(".cities");

const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
  window.location.href = "/error";
}

const apiKey = process.env.API_KEY;

alarm.addEventListener("click", handleAlarmUtilityClick);

logoutButton.addEventListener("click", logoutUser);

searchForm.addEventListener("submit", (e) => {
  // Prevent default form submission
  e.preventDefault();

  // Hide any message that might be displayed
  msg.textContent = "";
  msg.classList.remove("visible");

  // Get the search value
  let inputVal = input.value;

  // Check if there's already a city that matches the search criteria
  const listItemsArray = Array.from(list.querySelectorAll(".cities li"));

  if (listItemsArray.length > 0) {
    const filteredArray = listItemsArray.filter((el) => {
      let content = "";
      let cityName = el.querySelector(".city__name").textContent.toLowerCase();
      let cityCountry = el
        .querySelector(".city__country")
        .textContent.toLowerCase();

      // Check for the <city,country> format
      if (inputVal.includes(",")) {
        // If the country code is invalid (ex. athens,grrrr), keep only the city name
        if (inputVal.split(",")[1].length > 2) {
          inputVal = inputVal.split(",")[0];

          // Get the content from the existing city
          content = cityName;
        } else {
          // Country code is valid so keep both city and country
          content = `${cityName},${cityCountry}`;
        }
      } else {
        // Only the <city> format is used
        content = cityName;
      }

      // Return whether or not the existing content matches the form input value
      return content == inputVal.toLowerCase();
    });

    // If filteredArray is not blank, we have matches so we show a message and exit
    if (filteredArray.length > 0) {
      msg.textContent = `You already know the weather for ${
        filteredArray[0].querySelector(".city__name").textContent
      } ...otherwise be more specific by providing the country code as well 😉`;
      msg.classList.add("visible");
      searchForm.reset();
      input.focus();
      return;
    }
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;
  callWeatherApi(url);
});

compareForm.addEventListener("submit", function (event) {
  event.preventDefault();


  const leftInput = document.getElementById("left").value;
  const rightInput = document.getElementById("right").value;

  const text1 = encodeURIComponent(leftInput);
  const text2 = encodeURIComponent(rightInput);
  window.location.href = `/compare?t1=${text1}&t2=${text2}`;
});

// getLocation();
showLocations();

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
    return;
  }

  alert("Geolocation is not supported by this browser.");
}

function showPosition(position) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=${apiKey}`;
  callWeatherApi(url, true);
}

async function showLocations(locations) {
  //Clear the list and load only ones from backend
  list.innerHTML = "";
  locations = await firebaseController.getLocations(currentUser);

  if (locations != null) {
    for (const location of locations) {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
      callWeatherApi(url);
    }
  }
}

function callWeatherApi(url, isCurrentLocation = false) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // If we get a 404 code, throw an error
      if (data.cod == "404") {
        showToast("City not found!");
      }

      // Let's destructure the data object
      const { main, name, sys, weather } = data;

      firebaseController.addLocation(currentUser, name);

      // Define the icon location
      const icon = `../img/weather/${weather[0]["icon"]}.svg`;

      // Create the list item for the new city
      const li = document.createElement("li");
      const removeButton = document.createElement("div");
      removeButton.innerHTML = "X";
      removeButton.addEventListener("click", (event) => {
        event.stopImmediatePropagation();
        handleRemoveCity(name);
      });
      removeButton.classList.add("remove-btn");

      // Define markup
      const markup =
        (isCurrentLocation
          ? `<p class="current-location">Current Location</p>`
          : "") +
        `
				<figure>
					<img src="${icon}" alt="${weather[0]["description"]}">
				</figure>
				<div>
					<h2>${Math.round(main.temp)}<sup>°C</sup></h2>
					<p class="city__conditions">${weather[0]["description"].toUpperCase()}</p>
					<h3><span class="city__name">${name}</span><span class="city__country">${
          sys.country
        }</span></h3>
				</div>
			`;
      // Add the new markup to the list item
      li.innerHTML = markup;
      li.appendChild(removeButton);

      // Add latitude and longitude to the list item's dataset
      li.dataset.lat = data.coord.lat;
      li.dataset.lon = data.coord.lon;

      // Add click event listener to the list item
      li.addEventListener("click", handleCityClick);

      // Add the new list item to the page
      list.appendChild(li);
    })
    .catch(() => {
      showToast("City not found!");
      msg.textContent = "Please search for a valid city!";
      msg.classList.add("visible");
    });

  msg.textContent = "";

  searchForm.reset();
  input.focus();
}

async function handleRemoveCity(name) {
  await firebaseController.removeLocation(currentUser, name, showToast);
  showLocations();
}

function handleAlarmUtilityClick(event) {
  event.preventDefault();
  window.location.href = "/alarm";
}

function handleCityClick(event) {
  // Extract latitude and longitude from the clicked list item's dataset
  const lat = event.currentTarget.dataset.lat;
  const lon = event.currentTarget.dataset.lon;

  // Redirect to the detail page with the extracted coordinates
  window.location.href = `/detail?lat=${lat}&lon=${lon}`;
}

function logoutUser(event) {
  event.preventDefault();
  localStorage.removeItem("currentUser");
  window.location.href = "/";
}

function showToast(text) {
  var toast = document.getElementById("snackbar");
  toast.innerHTML = text;
  toast.className = "show";
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}
