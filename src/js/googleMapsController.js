export class GoogleMapsController {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getDuration(origin, destination) {
    console.log(origin);
    console.log(destination);
    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.METRIC
    }).then((response) => {
      let data = null;
      data = response["rows"][0];
      data = data["elements"][0];
      if (data["status"] != "OK")
      {
        alert("There is no such driving road");
        return;
      }
      let duration = data["duration"]["value"];
      // Here we need to apply extra duration relevant to current meoterological conditions
      console.log(this.formatTime(duration));
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