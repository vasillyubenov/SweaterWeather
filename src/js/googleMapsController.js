import weatherConditions from './weatherConditions.js';
import { FirebaseController } from "./firebaseController.js";

export class GoogleMapsController {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  // takes n points
  // get the n points
  // get the duration between points
  // get time increasement between each interval 
  // sum

  getEquallySpacedWaypoints(start, finish, n) {
    const latStart = start.lat;
    const lonStart = start.lng;

    const latFinish = finish.lat;
    const lonFinish = finish.lng;

    const latDiff = latFinish - latStart;
    const lonDiff = lonFinish - lonStart;

    const latIncrement = latDiff / (n + 1);
    const lonIncrement = lonDiff / (n + 1);

    const waypoints = [start];

    for (let i = 1; i <= n; i++) {
        // Calculate latitude and longitude of current waypoint
        const lat = latStart + i * latIncrement;
        const lng = lonStart + i * lonIncrement;
        // Append waypoint to array
        waypoints.push({lat, lng});
    }
    waypoints.push(finish);
    return waypoints;
}

  async getDurationBetweenPoints(origin, destination, time, currentUser, travelMode) {
    let waypoints = this.getEquallySpacedWaypoints(origin, destination, 3);
    let currentOrigin = waypoints[0];
    let sumDuration = 0;

    for (let i = 1; i < waypoints.length - 1; i++) {
      sumDuration += await this.setNewAlarm(currentOrigin, waypoints[i], time, currentUser, travelMode);
      currentOrigin = waypoints[i];
    }
    
    return sumDuration;
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
    let vasko = 0;
    await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${midpoint.lat()}&lon=${midpoint.lng()}&appid=${process.env.API_KEY}&units=metric`).then((response) => {
      return response.json();
    }).then(async data => {
      if ((data.cod < 200 || data.cod > 299) || !data.list || data.list.length == 0) {
        alert("No weather data found");
        return;
      }

      if (isForTommorow) {
        vasko = await this.updateSuggestedWakeTime(data.list[1].weather[0].description, origin, destination, inputTime);
        return;
      }

      vasko = await this.updateSuggestedWakeTime(data.list[0].weather[0].description, origin, destination, inputTime);
    });

    return vasko;
  }

  getTimeIncrease(condition) {
    if (weatherConditions[condition] == undefined) {
      return 0;
    }
    return weatherConditions[condition];
  }

  async updateSuggestedWakeTime(condition, origin, destination, alarmDate) {
    let increasePercent = this.getTimeIncrease(condition);
    let service = new google.maps.DistanceMatrixService;
    let travelModeInput = document.getElementById("travel-mode");

    if (!this.travelMode) {
      this.travelMode = travelModeInput.value;
    }
    else {
      travelModeInput.value = this.travelMode;
    }
    let vasko2 = 0;
    await service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: this.travelMode,
      unitSystem: google.maps.UnitSystem.METRIC
    })
      .then((resp) =>  {
        vasko2 = this.onGetDistanceMatrix(resp, increasePercent, alarmDate, origin, destination);
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
      });

      return vasko2;
  }

  onGetDistanceMatrix(response, increasePercent, alarmDate, origin, destination) {
    if (!response) {
      alert(`There is no such ${this.travelMode} route`);
      return;
    }
    console.log(origin);
    console.log(this.getEquallySpacedWaypoints(origin, destination, 3));
    console.log(destination);
    
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
    return newDuration;
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