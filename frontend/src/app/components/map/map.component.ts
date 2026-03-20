import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Country } from '../../models/country.model';
import { Place } from '../../models/place.model';
import mapboxgl from 'mapbox-gl';
import { environment } from '../../../environments/environment';

const MAPBOX_TOKEN = environment.mapboxToken;
const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full relative bg-slate-900">
      <div #mapContainer class="w-full h-full"></div>

      @if (!mapLoaded) {
        <div class="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-slate-400 text-sm">Loading map...</p>
          </div>
        </div>
      }

      <!-- Legend - bottom left -->
      <div class="absolute bottom-6 left-4 z-10 rounded-xl px-4 py-3 text-sm shadow-lg"
           style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(14px); border: 1px solid rgba(71, 85, 105, 0.5);">
        <div class="flex flex-col gap-2">
          <!-- Country legends -->
          <div class="flex items-center gap-2">
            <span class="inline-block w-3.5 h-3.5 rounded-sm" style="background: #3b82f6;"></span>
            <span class="text-slate-300 text-xs font-medium">Motherland</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block w-3.5 h-3.5 rounded-sm" style="background: #4ade80;"></span>
            <span class="text-slate-300 text-xs font-medium">Visited</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block w-3.5 h-3.5 rounded-sm" style="background: #475569;"></span>
            <span class="text-slate-300 text-xs font-medium">Not Visited</span>
          </div>
          <!-- Place category legends -->
          @if (placeCategories.length > 0) {
            <div class="w-full h-px bg-slate-600 my-1"></div>
            <p class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Lists</p>
            @for (cat of placeCategories; track cat.name) {
              <div class="flex items-center gap-2">
                <svg width="12" height="16" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 30 18 30s18-17.4 18-30C36 8.06 27.94 0 18 0z" [attr.fill]="cat.color"/>
                  <circle cx="18" cy="18" r="5" fill="white"/>
                </svg>
                <span class="text-slate-300 text-xs font-medium">{{ cat.name }}</span>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class MapComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Input() countries: Country[] = [];
  @Input() places: Place[] = [];
  @Input() selectedCountry: Country | null = null;
  @Output() countryClick = new EventEmitter<Country>();
  @Output() placeClick = new EventEmitter<Place>();
  @Output() mapClick = new EventEmitter<{ lat: number; lng: number }>();

  mapLoaded = false;
  placeCategories: { name: string; color: string }[] = [];
  private map!: mapboxgl.Map;
  private markers: mapboxgl.Marker[] = [];
  private geoJsonLoaded = false;

  ngOnInit() {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.map && this.mapLoaded) {
      if (changes['places']) {
        this.updateMarkers();
        this.updatePlaceCategories();
      }
      if (changes['countries'] && this.geoJsonLoaded) this.updateCountryColors();
      if (changes['selectedCountry']) this.focusCountry();
    }
  }

  ngOnDestroy() {
    this.markers.forEach(m => m.remove());
    this.markers = [];
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    this.map = new mapboxgl.Map({
      accessToken: MAPBOX_TOKEN,
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [10, 25],
      zoom: 2.5,
      maxBounds: [[-180, -85], [180, 85]],
      attributionControl: true
    });

    // Move +/- controls to bottom-right, lower position
    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    this.map.on('load', () => {
      this.mapLoaded = true;
      this.loadGeoJson();
      this.updateMarkers();
      this.updatePlaceCategories();
    });

    this.map.on('click', (e) => {
      this.mapClick.emit({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });
  }

  private loadGeoJson() {
    this.map.addSource('countries', {
      type: 'geojson',
      data: GEOJSON_URL
    });

    this.map.addLayer({
      id: 'country-fills',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': '#334155',
        'fill-opacity': 0.1
      }
    });

    this.map.addLayer({
      id: 'country-borders',
      type: 'line',
      source: 'countries',
      paint: {
        'line-color': '#475569',
        'line-width': 0.5
      }
    });

    this.map.on('click', 'country-fills', (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const code = feature.properties?.['ISO3166-1-Alpha-2'];
        const country = this.countries.find(c => c.code === code);
        if (country) {
          this.countryClick.emit(country);
        }
      }
    });

    this.map.on('mouseenter', 'country-fills', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'country-fills', () => {
      this.map.getCanvas().style.cursor = '';
    });

    this.map.on('sourcedata', (e) => {
      if (e.sourceId === 'countries' && this.map.isSourceLoaded('countries')) {
        if (!this.geoJsonLoaded) {
          this.geoJsonLoaded = true;
          this.updateCountryColors();
        }
      }
    });
  }

  private readonly MOTHERLAND_CODE = 'EG';

  private updateCountryColors() {
    if (!this.map || !this.geoJsonLoaded) return;

    const visitedCodes = this.countries.filter(c => c.visited && c.code !== this.MOTHERLAND_CODE).map(c => c.code);

    const colorExpression: any[] = ['match', ['get', 'ISO3166-1-Alpha-2']];
    colorExpression.push([this.MOTHERLAND_CODE], '#3b82f6');
    if (visitedCodes.length > 0) {
      colorExpression.push(visitedCodes, '#4ade80');
    }
    colorExpression.push('#475569');

    const opacityExpression: any[] = ['match', ['get', 'ISO3166-1-Alpha-2']];
    opacityExpression.push([this.MOTHERLAND_CODE], 0.7);
    if (visitedCodes.length > 0) {
      opacityExpression.push(visitedCodes, 0.6);
    }
    opacityExpression.push(0.1);

    const borderColorExpression: any[] = ['match', ['get', 'ISO3166-1-Alpha-2']];
    borderColorExpression.push([this.MOTHERLAND_CODE], '#2563eb');
    if (visitedCodes.length > 0) {
      borderColorExpression.push(visitedCodes, '#22c55e');
    }
    borderColorExpression.push('#475569');

    const borderWidthExpression: any[] = ['match', ['get', 'ISO3166-1-Alpha-2']];
    const highlightedCodes = [this.MOTHERLAND_CODE, ...visitedCodes];
    if (highlightedCodes.length > 0) {
      borderWidthExpression.push(highlightedCodes, 1.5);
    }
    borderWidthExpression.push(0.5);

    this.map.setPaintProperty('country-fills', 'fill-color', colorExpression as any);
    this.map.setPaintProperty('country-fills', 'fill-opacity', opacityExpression as any);
    this.map.setPaintProperty('country-borders', 'line-color', borderColorExpression as any);
    this.map.setPaintProperty('country-borders', 'line-width', borderWidthExpression as any);
  }

  private updatePlaceCategories() {
    const catMap = new Map<string, string>();
    this.places.forEach(place => {
      if (place.category && place.categoryColor) {
        catMap.set(place.category, place.categoryColor);
      }
    });
    this.placeCategories = Array.from(catMap.entries()).map(([name, color]) => ({ name, color }));
  }

  private updateMarkers() {
    if (!this.map) return;

    this.markers.forEach(m => m.remove());
    this.markers = [];

    this.places.forEach(place => {
      const color = place.categoryColor || '#22c55e';
      const el = document.createElement('div');
      el.innerHTML = `<svg width="30" height="40" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 30 18 30s18-17.4 18-30C36 8.06 27.94 0 18 0z" fill="${color}"/>
        <circle cx="18" cy="18" r="5" fill="white"/>
      </svg>`;
      el.style.cursor = 'pointer';
      el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))';

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([place.longitude, place.latitude])
        .addTo(this.map);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.placeClick.emit(place);
      });

      this.markers.push(marker);
    });
  }

  private focusCountry() {
    // Simple center - a full implementation would use geocoding or bounding boxes
  }
}
