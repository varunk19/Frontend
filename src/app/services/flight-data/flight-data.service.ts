import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlightDataService {

  constructor(private http: HttpClient) { }

  getAirlineFlights(airline: string): Observable<any> {
    let apiUrl = 'https://flight-data4.p.rapidapi.com/get_airline_flights';
    let headers = new HttpHeaders({
      'X-RapidAPI-Key': '7ef5ff3e51msh0cf4114271e2433p170f03jsnb3ace6212244',
      'X-RapidAPI-Host': 'flight-data4.p.rapidapi.com'
    });
    const params = new HttpParams().set('airline', airline);
    return this.http.get(apiUrl, { headers: headers, params });
  }

  getWeatherAlerts(lat: any,lng: any) {
    let apiUrl = 'https://weatherbit-v1-mashape.p.rapidapi.com/alerts';
    let headers = new HttpHeaders({
      'X-RapidAPI-Key': '7ef5ff3e51msh0cf4114271e2433p170f03jsnb3ace6212244',
      'X-RapidAPI-Host': 'weatherbit-v1-mashape.p.rapidapi.com'
    });
    const params = new HttpParams().set('lat', lat);
    params.set('lng', lng);
    return this.http.get(apiUrl, { headers: headers, params: {'lat': lat, 'lon': lng} });
  }
}
