import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Country } from '../models/country.model';
import { Place, PlaceRequest, ImageModel, Stats, LoginRequest, LoginResponse } from '../models/place.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Public APIs
  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.baseUrl}/countries`);
  }

  getCountry(id: number): Observable<Country> {
    return this.http.get<Country>(`${this.baseUrl}/countries/${id}`);
  }

  getPlaces(countryId?: number): Observable<Place[]> {
    let params = new HttpParams();
    if (countryId) params = params.set('countryId', countryId.toString());
    return this.http.get<Place[]>(`${this.baseUrl}/places`, { params });
  }

  getPlace(id: number): Observable<Place> {
    return this.http.get<Place>(`${this.baseUrl}/places/${id}`);
  }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.baseUrl}/stats`);
  }

  // Auth
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, request);
  }

  // Admin APIs
  toggleCountryVisit(id: number): Observable<Country> {
    return this.http.put<Country>(`${this.baseUrl}/admin/countries/${id}/toggle-visit`, {});
  }

  createPlace(request: PlaceRequest): Observable<Place> {
    return this.http.post<Place>(`${this.baseUrl}/admin/places`, request);
  }

  updatePlace(id: number, request: PlaceRequest): Observable<Place> {
    return this.http.put<Place>(`${this.baseUrl}/admin/places/${id}`, request);
  }

  deletePlace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/places/${id}`);
  }

  uploadImage(placeId: number, file: File): Observable<ImageModel> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImageModel>(`${this.baseUrl}/admin/places/${placeId}/images`, formData);
  }

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/places/images/${imageId}`);
  }
}
