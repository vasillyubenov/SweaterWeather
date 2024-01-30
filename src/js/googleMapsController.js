export class GoogleMapsController {
    constructor(apiKey) {
      this.apiKey = apiKey;
    }
  
    async getDuration(origin, destination) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${this.apiKey}`
        );
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
  
        const data = await response.json();
        return data["geocoded_waypoints"]["routes"].duration.text;
      } catch (error) {
        console.error('Error fetching directions:', error.message);
        throw error;
      }
    }
  }