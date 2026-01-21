// lib/extractCities.ts
import axios from "axios";
import config from "../config";
import slugify from "slugify";

export async function getCityFromCoordinates(
  latitude: number,
  longitude: number
): Promise<{ city: string; state: string; lat: number; lng: number } | null> {
  try {
    const googleMapsApiKey = config.google_map_api_key || "";
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
    );
    const results = response.data.results;
    if (results.length > 0) {
      // Find the result that contains both 'locality' and 'administrative_area_level_1' components
      for (const result of results) {
        const cityComponent = result.address_components.find((component: any) =>
          component.types.includes("locality")
        );
        const stateComponent = result.address_components.find(
          (component: any) =>
            component.types.includes("administrative_area_level_1")
        );
        if (cityComponent && stateComponent) {
          return {
            city: slugify(cityComponent.long_name as string, { lower: true }),
            state: slugify(stateComponent.long_name as string, { lower: true }),
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching city and state from Google Maps:", error);
    return null;
  }
}
