import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { ApiService } from '../../../services/api.service';
import { Country } from '../../../models/country.model';
import { Place, PlaceRequest } from '../../../models/place.model';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { environment } from '../../../../environments/environment';

const MAPBOX_TOKEN = environment.mapboxToken;

@Component({
  selector: 'app-manage-places',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent],
  template: `
    <app-topbar />
    <div class="pt-[76px] min-h-screen">
      <div class="h-[calc(100vh-76px)] relative">

        <!-- Full Screen Map -->
        <div #mapContainer class="w-full h-full"></div>

        <!-- Floating Form Panel (appears when pin is placed) -->
        @if (showForm) {
          <div class="absolute top-[100px] right-4 w-[360px] slide-up" style="z-index: 1000; max-height: calc(100vh - 180px); overflow-y: auto;">
            <div class="rounded-2xl p-5 shadow-2xl" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(71, 85, 105, 0.5);">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-white">{{ editingPlace ? 'Edit Place' : 'Save This Place' }}</h3>
                <button (click)="showForm = false; resetForm(); clearPendingPin()" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              @if (pendingPin) {
                <div class="mb-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Pin at {{ form.latitude.toFixed(4) }}, {{ form.longitude.toFixed(4) }}
                </div>
              }

              <form (ngSubmit)="onSubmit()" class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Name *</label>
                  <input type="text" [(ngModel)]="form.name" name="name" class="input-field text-sm !py-2" placeholder="e.g. Eiffel Tower" required>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Country *</label>
                  <select [(ngModel)]="form.countryId" name="countryId" class="input-field text-sm !py-2" required>
                    <option [ngValue]="0" disabled>Select a country</option>
                    @for (c of countries; track c.id) {
                      <option [ngValue]="c.id">{{ c.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Visit Date</label>
                  <input type="date" [(ngModel)]="form.visitDate" name="visitDate" class="input-field text-sm !py-2">
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Notes</label>
                  <textarea [(ngModel)]="form.description" name="description" class="input-field text-sm !py-2" rows="2" placeholder="Write your notes..."></textarea>
                </div>
                <!-- List / Category Selection -->
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">List</label>
                  @if (!showNewListInput) {
                    <div class="space-y-1.5">
                      <!-- Existing lists -->
                      @for (cat of existingCategoriesWithColors; track cat.name) {
                        <button type="button" (click)="selectCategory(cat)"
                                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all"
                                [class]="form.category === cat.name ? 'bg-slate-700 border border-emerald-500/50 text-white' : 'bg-slate-800/50 border border-transparent text-slate-300 hover:bg-slate-700/50'">
                          <span class="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20" [style.background]="cat.color"></span>
                          {{ cat.name }}
                          @if (form.category === cat.name) {
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="ml-auto text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>
                          }
                        </button>
                      }
                      <!-- No list option -->
                      <button type="button" (click)="form.category = ''; form.categoryColor = '#22c55e'"
                              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all"
                              [class]="!form.category ? 'bg-slate-700 border border-emerald-500/50 text-white' : 'bg-slate-800/50 border border-transparent text-slate-400 hover:bg-slate-700/50'">
                        <span class="w-3.5 h-3.5 rounded-full shrink-0 border border-dashed border-slate-500 bg-transparent"></span>
                        No list
                      </button>
                      <!-- Add new list button -->
                      <button type="button" (click)="showNewListInput = true"
                              class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-emerald-400 hover:bg-emerald-500/10 transition-all border border-dashed border-emerald-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add new list
                      </button>
                    </div>
                  } @else {
                    <!-- New list creation -->
                    <div class="space-y-2 p-3 rounded-lg bg-slate-800/50 border border-slate-600/50">
                      <div class="flex gap-2">
                        <input type="text" [(ngModel)]="newListName" name="newListName" class="input-field text-sm !py-2 flex-1" placeholder="List name (e.g. Food, Hotels)">
                        <input type="color" [(ngModel)]="newListColor" name="newListColor"
                               class="w-10 h-[38px] rounded-lg cursor-pointer border border-slate-600 p-0.5"
                               title="Pick color">
                      </div>
                      <!-- Color presets -->
                      <div class="flex gap-1.5 flex-wrap">
                        @for (preset of colorPresets; track preset) {
                          <button type="button" (click)="newListColor = preset"
                                  class="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
                                  [class]="newListColor === preset ? 'border-white scale-110' : 'border-transparent'"
                                  [style.background]="preset"></button>
                        }
                      </div>
                      <div class="flex gap-2">
                        <button type="button" (click)="addNewList()" class="btn-primary text-xs !py-1.5 !px-3 flex-1">Add List</button>
                        <button type="button" (click)="showNewListInput = false" class="btn-secondary text-xs !py-1.5 !px-3">Cancel</button>
                      </div>
                    </div>
                  }
                </div>
                <!-- Image Upload -->
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Photos</label>
                  <label class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-slate-600 text-slate-400 text-xs cursor-pointer hover:border-emerald-500 hover:text-emerald-400 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    {{ selectedFiles.length > 0 ? selectedFiles.length + ' file(s) selected' : 'Click to add photos' }}
                    <input type="file" accept="image/*" multiple class="hidden" (change)="onFormFileSelected($event)">
                  </label>
                </div>
                <div class="flex gap-2 pt-1">
                  <button type="submit" class="btn-primary text-sm !py-2 flex-1" [disabled]="saving">
                    {{ saving ? 'Saving...' : (editingPlace ? 'Update' : 'Save Place') }}
                  </button>
                  <button type="button" (click)="showForm = false; resetForm(); clearPendingPin()" class="btn-secondary text-sm !py-2">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Place Detail Modal (when clicking a saved marker) -->
        @if (selectedPlace && !showForm) {
          <div class="absolute top-[100px] right-4 z-10 w-[380px] slide-up">
            <div class="rounded-2xl overflow-hidden shadow-2xl" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(71, 85, 105, 0.5);">

              <!-- Image Slider -->
              @if (selectedPlace.images && selectedPlace.images.length > 0) {
                <div class="relative h-48 overflow-hidden">
                  <img [src]="'http://localhost:8080' + selectedPlace.images[currentImageIndex].url" [alt]="selectedPlace.name"
                       class="w-full h-full object-cover">
                  @if (selectedPlace.images.length > 1) {
                    <button (click)="prevImage(); $event.stopPropagation()" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button (click)="nextImage(); $event.stopPropagation()" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                    <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      @for (img of selectedPlace.images; track img.id; let i = $index) {
                        <div class="w-2 h-2 rounded-full transition-all" [class]="i === currentImageIndex ? 'bg-white scale-110' : 'bg-white/40'"></div>
                      }
                    </div>
                  }
                </div>
              }

              <div class="p-5">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="text-lg font-bold text-white">{{ selectedPlace.name }}</h3>
                    <p class="text-sm text-emerald-400">{{ selectedPlace.countryName }}</p>
                    @if (selectedPlace.category) {
                      <div class="flex items-center gap-1.5 mt-1">
                        <span class="w-2.5 h-2.5 rounded-full" [style.background]="selectedPlace.categoryColor || '#22c55e'"></span>
                        <span class="text-xs text-slate-400">{{ selectedPlace.category }}</span>
                      </div>
                    }
                  </div>
                  <button (click)="selectedPlace = null" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                @if (selectedPlace.visitDate) {
                  <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Visited on {{ selectedPlace.visitDate }}
                  </div>
                }

                @if (selectedPlace.description) {
                  <p class="text-sm text-slate-300 leading-relaxed">{{ selectedPlace.description }}</p>
                }

                <!-- Admin actions -->
                <div class="flex gap-2 mt-4 pt-3 border-t border-slate-700/50">
                  <label class="btn-secondary text-xs !py-1.5 !px-3 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Add Photo
                    <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event, selectedPlace)">
                  </label>
                  <button (click)="editPlace(selectedPlace)" class="btn-secondary text-xs !py-1.5 !px-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button (click)="deletePlace(selectedPlace)" class="btn-secondary text-xs !py-1.5 !px-3 hover:!text-red-400 hover:!border-red-500/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        @if (!mapLoaded) {
          <div class="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div class="text-center">
              <div class="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-slate-400 text-sm">Loading map...</p>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ManagePlacesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  private api = inject(ApiService);

  places: Place[] = [];
  countries: Country[] = [];
  showForm = false;
  saving = false;
  editingPlace: Place | null = null;
  selectedPlace: Place | null = null;
  pendingPin = false;
  mapLoaded = false;
  currentImageIndex = 0;
  selectedFiles: File[] = [];
  existingCategoriesWithColors: { name: string; color: string }[] = [];
  showNewListInput = false;
  newListName = '';
  newListColor = '#22c55e';

  colorPresets = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
    '#f43f5e', '#78716c'
  ];

  private map!: mapboxgl.Map;
  private markers: mapboxgl.Marker[] = [];
  private pendingMarker: mapboxgl.Marker | null = null;
  private geocoder: MapboxGeocoder | null = null;

  form: PlaceRequest = {
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    visitDate: '',
    countryId: 0,
    category: '',
    categoryColor: '#22c55e'
  };

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.markers.forEach(m => m.remove());
    this.markers = [];
    if (this.pendingMarker) {
      this.pendingMarker.remove();
      this.pendingMarker = null;
    }
    if (this.map) {
      this.map.remove();
    }
  }

  loadData() {
    this.api.getPlaces().subscribe(p => {
      this.places = p;
      this.updateMarkers();
      // Extract existing categories with colors
      const catMap = new Map<string, string>();
      p.forEach(place => {
        if (place.category) {
          catMap.set(place.category, place.categoryColor || '#22c55e');
        }
      });
      this.existingCategoriesWithColors = Array.from(catMap.entries()).map(([name, color]) => ({ name, color }));
    });
    this.api.getCountries().subscribe(c => this.countries = c);
  }

  selectCategory(cat: { name: string; color: string }) {
    this.form.category = cat.name;
    this.form.categoryColor = cat.color;
  }

  addNewList() {
    if (!this.newListName.trim()) return;
    const newCat = { name: this.newListName.trim(), color: this.newListColor };
    this.existingCategoriesWithColors.push(newCat);
    this.form.category = newCat.name;
    this.form.categoryColor = newCat.color;
    this.newListName = '';
    this.newListColor = '#22c55e';
    this.showNewListInput = false;
  }

  private initMap() {
    this.map = new mapboxgl.Map({
      accessToken: MAPBOX_TOKEN,
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [10, 25],
      zoom: 2.5,
      attributionControl: true
    });

    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    // Add Mapbox Geocoder for search/autocomplete
    this.geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl as any,
      marker: false,
      placeholder: 'Search for a place... (e.g. Eiffel Tower, Tokyo)',
      types: 'place,poi,address,locality',
      flyTo: { speed: 2, zoom: 15 }
    });

    this.map.addControl(this.geocoder as any, 'top-left');

    this.geocoder.on('result', (e: any) => {
      const [lng, lat] = e.result.center;
      const placeName = e.result.text || e.result.place_name || '';

      this.selectedPlace = null;
      this.placePin(lat, lng, placeName);

      // Try to match country from geocoder context
      if (e.result.context) {
        const countryContext = e.result.context.find(
          (ctx: any) => ctx.id && ctx.id.startsWith('country')
        );
        if (countryContext) {
          const countryCode = countryContext.short_code?.toUpperCase();
          if (countryCode) {
            const matchedCountry = this.countries.find(c => c.code === countryCode);
            if (matchedCountry) {
              this.form.countryId = matchedCountry.id;
            }
          }
        }
      }
    });

    this.map.on('click', (e) => {
      this.selectedPlace = null;
      this.placePin(e.lngLat.lat, e.lngLat.lng);
    });

    this.map.on('load', () => {
      this.mapLoaded = true;
      this.updateMarkers();
    });
  }

  private placePin(lat: number, lng: number, name?: string) {
    this.form.latitude = parseFloat(lat.toFixed(6));
    this.form.longitude = parseFloat(lng.toFixed(6));
    if (name) this.form.name = name;
    this.pendingPin = true;
    this.showForm = true;
    this.showNewListInput = false;

    if (this.pendingMarker) {
      this.pendingMarker.remove();
      this.pendingMarker = null;
    }

    const el = document.createElement('div');
    el.innerHTML = `<svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 30 18 30s18-17.4 18-30C36 8.06 27.94 0 18 0z" fill="#EA4335"/>
      <circle cx="18" cy="18" r="7" fill="#B71C1C"/>
      <circle cx="18" cy="18" r="5" fill="white"/>
    </svg>`;
    el.style.cursor = 'pointer';
    el.style.filter = 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))';

    this.pendingMarker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(this.map);
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
        this.showForm = false;
        this.clearPendingPin();
        this.currentImageIndex = 0;
        this.selectedPlace = place;
        this.map.flyTo({ center: [place.longitude, place.latitude], speed: 1.5 });
      });

      this.markers.push(marker);
    });
  }

  selectPlace(place: Place) {
    this.selectedPlace = place;
    this.currentImageIndex = 0;
    if (this.map) {
      this.map.flyTo({ center: [place.longitude, place.latitude], zoom: 12, speed: 1.5 });
    }
  }

  prevImage() {
    if (this.selectedPlace?.images) {
      this.currentImageIndex = this.currentImageIndex > 0
        ? this.currentImageIndex - 1
        : this.selectedPlace.images.length - 1;
    }
  }

  nextImage() {
    if (this.selectedPlace?.images) {
      this.currentImageIndex = this.currentImageIndex < this.selectedPlace.images.length - 1
        ? this.currentImageIndex + 1
        : 0;
    }
  }

  resetForm() {
    this.editingPlace = null;
    this.form = { name: '', description: '', latitude: 0, longitude: 0, visitDate: '', countryId: 0, category: '', categoryColor: '#22c55e' };
    this.pendingPin = false;
    this.selectedFiles = [];
    this.showNewListInput = false;
  }

  clearPendingPin() {
    if (this.pendingMarker) {
      this.pendingMarker.remove();
      this.pendingMarker = null;
    }
    this.pendingPin = false;
  }

  editPlace(place: Place) {
    this.selectedPlace = null;
    this.editingPlace = place;
    this.form = {
      name: place.name,
      description: place.description || '',
      latitude: place.latitude,
      longitude: place.longitude,
      visitDate: place.visitDate || '',
      countryId: place.countryId,
      category: place.category || '',
      categoryColor: place.categoryColor || '#22c55e'
    };
    this.showForm = true;
    this.pendingPin = true;
    this.showNewListInput = false;
  }

  onFormFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onSubmit() {
    this.saving = true;
    const obs = this.editingPlace
      ? this.api.updatePlace(this.editingPlace.id, this.form)
      : this.api.createPlace(this.form);

    obs.subscribe({
      next: (savedPlace: any) => {
        // Upload images if any selected
        if (this.selectedFiles.length > 0) {
          const placeId = savedPlace.id || this.editingPlace?.id;
          if (placeId) {
            let uploaded = 0;
            this.selectedFiles.forEach(file => {
              this.api.uploadImage(placeId, file).subscribe(() => {
                uploaded++;
                if (uploaded === this.selectedFiles.length) {
                  this.loadData();
                }
              });
            });
          }
        } else {
          this.loadData();
        }
        this.showForm = false;
        this.resetForm();
        this.clearPendingPin();
        this.saving = false;
        // Clear geocoder input
        if (this.geocoder) {
          this.geocoder.clear();
        }
      },
      error: () => this.saving = false
    });
  }

  deletePlace(place: Place) {
    if (confirm(`Delete "${place.name}"?`)) {
      this.api.deletePlace(place.id).subscribe(() => {
        this.selectedPlace = null;
        this.loadData();
      });
    }
  }

  onFileSelected(event: Event, place: Place) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.api.uploadImage(place.id, input.files[0]).subscribe(() => {
        this.loadData();
        // Refresh selected place
        if (this.selectedPlace?.id === place.id) {
          this.api.getPlaces().subscribe(places => {
            this.selectedPlace = places.find(p => p.id === place.id) || null;
          });
        }
      });
    }
  }
}
