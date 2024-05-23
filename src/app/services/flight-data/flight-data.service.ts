import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlightDataService {

  private apiUrl = 'https://flight-data4.p.rapidapi.com/get_airline_flights';
  private headers = new HttpHeaders({
    'X-RapidAPI-Key': '7ef5ff3e51msh0cf4114271e2433p170f03jsnb3ace6212244',
    'X-RapidAPI-Host': 'flight-data4.p.rapidapi.com'
  });

  constructor(private http: HttpClient) { }

  getAirlineFlights(airline: string): Observable<any> {
    const params = new HttpParams().set('airline', airline);
    return this.http.get(this.apiUrl, { headers: this.headers, params });
  }
}
