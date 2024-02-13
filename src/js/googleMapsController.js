import weatherConditions from './weatherConditions.js';

export class GoogleMapsController {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getDuration(origin, destination) {
    var bounds = new google.maps.LatLngBounds();
    var i;

    // The Bermuda Triangle
    var polygonCoords = [
      new google.maps.LatLng(origin.lat, origin.lng),
      new google.maps.LatLng(destination.lat, destination.lng),
    ];

    for (i = 0; i < polygonCoords.length; i++) {
      bounds.extend(polygonCoords[i]);
    }

    let midpoint = bounds.getCenter();
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${midpoint.lat()}&lon=${midpoint.lng()}&appid=${process.env.API_KEY}&units=metric`).then((response) => {
      return response.json();
    }).then(data => {
      console.log(data.weather[0].description);
      this.updateSuggestedWakeTime(data.weather[0].description, origin, destination);
    });
  }

  getTimeIncrease(condition) {
    if (weatherConditions[condition] == undefined) {
      return 0;
    }

    return weatherConditions[condition];
  }

  updateSuggestedWakeTime(condition, origin, destination, travelMode = "DRIVING") {
    let increasePercent = this.getTimeIncrease(condition);
    var service = new google.maps.DistanceMatrixService;
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
        alert("There is no such driving road");
        return;
      }
      let duration = data["duration"]["value"];
      let newDuration = duration * (1 + increasePercent / 100);
      //Display somewhere delta duration 
      console.log(this.formatTime(newDuration));
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