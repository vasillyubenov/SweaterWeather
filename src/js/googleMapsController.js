import weatherConditions from './weatherConditions.js';
import { FirebaseController } from "./firebaseController.js";

export class GoogleMapsController {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async setNewAlarm(origin, destination, time, currentUser, travelMode) {
    this.currentUser = currentUser;
    this.travelMode = travelMode;

    var bounds = new google.maps.LatLngBounds();
    var polygonCoords = [
      new google.maps.LatLng(origin.lat, origin.lng),
      new google.maps.LatLng(destination.lat, destination.lng),
    ];

    for (let i = 0; i < polygonCoords.length; i++) {
      bounds.extend(polygonCoords[i]);
    }

    let midpoint = bounds.getCenter();
    let currentTime = new Date();
    let currentHours = currentTime.getHours();
    let currentMinutes = currentTime.getMinutes();

    // Setting todays time
    let inputTime = new Date();
    inputTime.setHours(time.split(":")[0]);
    inputTime.setMinutes(time.split(":")[1]);

    let inputHours = inputTime.getHours();
    let inputMinutes = inputTime.getMinutes();
    let isForTommorow = false;

    if (inputHours > currentHours || (inputHours === currentHours && inputMinutes > currentMinutes)) {
      isForTommorow = false;
    } else {
      isForTommorow = true;
    }

    if (isForTommorow) {
      inputTime.setDate(inputTime.getDate() + 1);
    }

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${midpoint.lat()}&lon=${midpoint.lng()}&appid=${process.env.API_KEY}&units=metric`).then((response) => {
      return response.json();
    }).then(data => {
      if ((data.cod < 200 || data.cod > 299) || !data.list || data.list.length == 0) {
        alert("No weather data found");
        return;
      }

      if (isForTommorow) {
        this.updateSuggestedWakeTime(data.list[1].weather[0].description, origin, destination, inputTime);
        return;
      }

      this.updateSuggestedWakeTime(data.list[0].weather[0].description, origin, destination, inputTime);
    });
  }

  getTimeIncrease(condition) {
    if (weatherConditions[condition] == undefined) {
      return 0;
    }
    return weatherConditions[condition];
  }

  updateSuggestedWakeTime(condition, origin, destination, alarmDate) {
    let increasePercent = this.getTimeIncrease(condition);
    let service = new google.maps.DistanceMatrixService;
    let travelModeInput = document.getElementById("travel-mode");

    if (!this.travelMode) {
      this.travelMode = travelModeInput.value;
    }
    else {
      travelModeInput.value = this.travelMode;
    }

    service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: this.travelMode,
      unitSystem: google.maps.UnitSystem.METRIC
    })
      .then((resp) => this.onGetDistanceMatrix(resp, increasePercent, alarmDate, origin, destination))
      .catch((error) => {
        console.log(`Error: ${error}`);
      });
  }

  onGetDistanceMatrix(response, increasePercent, alarmDate, origin, destination) {
    if (!response) {
      alert(`There is no such ${this.travelMode} route`);
      return;
    }

    //Updating user db
    this.updateDatabase(origin, destination, this.travelMode, alarmDate.getHours().toString().padStart(2, '0') + ":" + alarmDate.getMinutes().toString().padStart(2, '0'));

    let data = response["rows"][0]["elements"][0];
    if (!data || data["status"] != "OK") {
      alert(`There is no such ${this.travelMode} route`);
      return;
    }

    let duration = data["duration"]["value"];
    let newDuration = duration * (1 + increasePercent / 100);

    alarmDate.setSeconds(alarmDate.getSeconds() - newDuration);

    //Display somewhere delta duration and suggested time
    let dateString = this.getFormatedDate(alarmDate);
    document.getElementById("suggested-time").innerHTML = `The suggested departure time is ${dateString}`;
  }

  async updateDatabase(origin, destination, travelMode, time) {
    const firebaseController = new FirebaseController();

    await firebaseController.updateAlarm(this.currentUser, {
      time,
      origin,
      destination,
      travelMode
    });

    console.log("Alarm updated successfully");
  }

  getFormatedDate(date) {
    let timeFormat = date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0');
    if (date.getHours > 12) {
      timeFormat += " PM ";
    }
    else {
      timeFormat += " AM ";
    }

    return `${timeFormat} ${date.toLocaleDateString("en-GB")}`;
  }
}