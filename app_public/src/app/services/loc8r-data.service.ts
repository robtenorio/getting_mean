import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Location } from '../components/home-list/home-list.component';

@Injectable({
  providedIn: 'root'
})
export class Loc8rDataService {

  private apiBaseUrl = 'http://localhost:3000/api/';

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

  private handleError(error: any): Promise<any> {
    console.error('Something has gone wrong', error);
    return Promise.reject(error.message || error);
  }

  constructor(private http: HttpClient) { }

}
