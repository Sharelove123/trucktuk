import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .hos_logic import calculate_trip_hos, split_events_into_days

class CalculateTripView(APIView):
    def post(self, request):
        current_loc = request.data.get('current_location')
        pickup_loc = request.data.get('pickup_location')
        dropoff_loc = request.data.get('dropoff_location')
        cycle_used = float(request.data.get('current_cycle_used', 0))
        
        try:
            # 1. Geocode locations
            def geocode(addr):
                # Switch to ArcGIS public geocoder as it's very robust and less likely to block Vercel
                url = f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine={addr}&maxLocations=1"
                response = requests.get(url)
                if response.status_code != 200:
                    raise Exception(f"Geocoding API Error ({response.status_code}): {response.text[:100]}")
                res = response.json()
                if not res.get('candidates'):
                    raise Exception(f"Could not find location: {addr}")
                
                candidate = res['candidates'][0]
                return {
                    "lat": candidate['location']['y'], 
                    "lon": candidate['location']['x'], 
                    "display_name": candidate['address']
                }

            locs = {
                "current": geocode(current_loc),
                "pickup": geocode(pickup_loc),
                "dropoff": geocode(dropoff_loc)
            }
            
            # 2. Get Route from OSRM
            coords = f"{locs['current']['lon']},{locs['current']['lat']};{locs['pickup']['lon']},{locs['pickup']['lat']};{locs['dropoff']['lon']},{locs['dropoff']['lat']}"
            osrm_url = f"https://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson"
            response = requests.get(osrm_url)
            if response.status_code != 200:
                 raise Exception(f"Routing API Error ({response.status_code}): {response.text[:100]}")
            route_res = response.json()
            
            if route_res['code'] != 'Ok':
                 return Response({"error": "Routing failed"}, status=status.HTTP_400_BAD_REQUEST)
            
            route = route_res['routes'][0]
            distance_miles = route['distance'] * 0.000621371
            duration_hours = route['duration'] / 3600
            
            # 3. Calculate HOS
            events = calculate_trip_hos(
                locs['current'], locs['pickup'], locs['dropoff'], 
                cycle_used, distance_miles, duration_hours
            )
            
            # 4. Split into daily logs
            daily_logs = split_events_into_days(events)
            
            return Response({
                "locations": locs,
                "route_geometry": route['geometry'],
                "distance_miles": distance_miles,
                "duration_hours": duration_hours,
                "events": events,
                "daily_logs": daily_logs
            })
            
        except Exception as e:
            return Response({"error": f"Backend Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
