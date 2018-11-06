import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../classes/user';
import { AuthResponse } from '../classes/authresponse';
import { Location } from '../components/home-list/home-list.component';

@Injectable({
  providedIn: 'root'
})
export class Loc8rDataService {

  private apiBaseUrl = 'http://localhost:3000/api';

  public getLocations(lat: number, lng: number): Promise<Location[]> {

    const max: number = 10000000;

    const url: string = `${this.apiBaseUrl}/locations?lng=${lng}&lat=${lat}&max=${max}`;

    return this.http
      .get(url)
      .toPromise()
      .then(response => response as Location[])
      .catch(this.handleError);

  }

  public getLocationById(locationId: string): Promise<Location> {

    const url: string = `${this.apiBaseUrl}/locations/${locationId}`;

    return this.http
      .get(url)
      .toPromise()
      .then(response => response as Location)
      .catch(this.handleError);

  }

  public login(user: User): Promise<AuthResponse> {
    return this.makeAuthApiCall('login', user);
  }

  public register(user: User): Promise<AuthResponse> {
    return this.makeAuthApiCall('register', user);
  }

  private makeAuthApiCall(urlPath: string, user: User): Promise<AuthResponse> {
    const url: string = `${this.apiBaseUrl}/${urlPath}`;
    return this.http
      .post(url, user)
      .toPromise()
      .then(response => response as AuthResponse)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('Something has gone wrong', error);
    return Promise.reject(error.message || error);
  }

  constructor(private http: HttpClient) { }

}
