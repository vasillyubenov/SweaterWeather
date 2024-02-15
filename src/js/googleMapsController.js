import weatherConditions from './weatherConditions.js';

export class GoogleMapsController {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getDuration(origin, destination, time) {
    var bounds = new google.maps.LatLngBounds();
    var i;

    var polygonCoords = [
      new google.maps.LatLng(origin.lat, origin.lng),
      new google.maps.LatLng(destination.lat, destination.lng),
    ];

    for (i = 0; i < polygonCoords.length; i++) {
      bounds.extend(polygonCoords[i]);
    }

    let midpoint = bounds.getCenter();
    let currentTime = new Date();
    let currentHours = currentTime.getHours();
    let currentMinutes = currentTime.getMinutes();

    let inputTime = new Date(`2024-01-01T${time}:00`); // assuming time is in HH:MM format
    let inputHours = inputTime.getHours();
    let inputMinutes = inputTime.getMinutes();
    let isForTommorow = false;
    if (inputHours > currentHours || (inputHours === currentHours && inputMinutes > currentMinutes)) {
      isForTommorow = false;
    } else {
      isForTommorow = true;
    }

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${midpoint.lat()}&lon=${midpoint.lng()}&appid=${process.env.API_KEY}&units=metric`).then((response) => {
      return response.json();
    }).then(data => {
      // add guards for the things below
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
    var service = new google.maps.DistanceMatrixService;
    let travelMode = document.getElementById("travel-mode").value;
    service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: travelMode,
      unitSystem: google.maps.UnitSystem.METRIC
    }).then((response) => {
      let data = null;
      data = response["rows"][0];
      data = data["elements"][0];
      if (data["status"] != "OK") {
        alert(`There is no such ${travelMode} route`);
        return;
      }
      let duration = data["duration"]["value"];
      // remove duration seconds from alarmDate 
      let newDuration = duration * (1 + increasePercent / 100);
      alarmDate.setSeconds(alarmDate.getSeconds() - newDuration);
      //Display somewhere delta duration 
      let departureDate = alarmDate.getHours().toString().padStart(2, '0') + ":" + alarmDate.getMinutes().toString().padStart(2, '0');
      if (alarmDate.getHours > 12) {
        departureDate += "PM";
      }
      else {
        departureDate += "AM";
      }
      document.getElementById("suggested-time").innerHTML = `The suggested departure time is ${departureDate}`;
    }).catch((error) => {
      console.log(`Error: ${error}`);
    });
  }

  formatTime(seconds) {
    // Convert seconds to hours and minutes
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);

    // Construct the string
    var result = '';
    if (hours > 0) {
      result += hours + ' hour';
      if (hours > 1) result += 's';
    }
    if (minutes > 0) {
      if (result !== '') result += ' and ';
      result += minutes + ' minute';
      if (minutes > 1) result += 's';
    }
    if (result === '') {
      result = 'less than a minute';
    }

    return result;
  }
}