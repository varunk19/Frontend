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

  login(userId: string,password: string): Observable<any> {
    let apiUrl = 'http://127.0.0.1:5000/login';
    let requestBody = {
      "user-id": userId,
      "password": password
    };
    let headers = new HttpHeaders({
      'content-type': 'application/json'
    });
    return this.http.post(apiUrl, requestBody, { headers: headers });
  }

  getFlightPlan(userId: string): Observable<any> {
    let apiUrl = 'http://127.0.0.1:5000/fetch_flight-plan';
    let requestBody = {
      "flight_id": userId,
    };
    let headers = new HttpHeaders({
      'content-type': 'application/json'
    });
    return this.http.post(apiUrl, requestBody, { headers: headers });
  }

  createFlightPlan(userId: string, plan: string): Observable<any> {
    let apiUrl = 'http://127.0.0.1:5000/flight-plan';
    let requestBody = {
      "flight_id": userId,
      "flight-plan": plan
    };
    let headers = new HttpHeaders({
      'content-type': 'application/json'
    });
    return this.http.post(apiUrl, requestBody, { headers: headers });
  }

  getRoutes(src: any,dest: any,inc: any,exc: any): Observable<any> {
    let apiUrl = 'http://127.0.0.1:5000/find_best_route';
    let requestBody = {
      "source": src,
      "destination": dest,
      "excluded_airport": exc,
      "included_airport": inc
    };
    let headers = new HttpHeaders({
      'content-type': 'application/json'
    });
    return this.http.post(apiUrl, requestBody, { headers: headers });
  }

  callWeather(lat: any, lon: any) {
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=73f1f62de5b3d92360bbdfe7003d2c52`;
    return this.http.get(apiUrl);
  }
}
