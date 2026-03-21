import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Country } from '../../models/country.model';
import { Place } from '../../models/place.model';
import { environment } from '../../../environments/environment';

const MOTHERLAND_CODE = 'EG';

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (country) {
      <div class="fixed bottom-6 left-6 right-6 z-20 slide-up">
        <div class="glass-card p-5 max-w-4xl mx-auto">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ getFlag(country.code) }}</span>
              <div>
                <h3 class="text-lg font-bold text-white">{{ country.name }}</h3>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [class]="getStatusClass()">
                    {{ getStatusLabel() }}
                  </span>
                  <span class="text-xs text-slate-500">{{ country.placesCount }} places</span>
                </div>
              </div>
            </div>
            <button (click)="closeDetail.emit()" class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          @if (places.length > 0) {
            <div class="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              @for (place of places; track place.id) {
                <button (click)="selectPlace.emit(place)"
                        class="shrink-0 glass-card-sm p-3 w-48 text-left hover:border-emerald-500/30 transition-all group">
                  @if (place.images && place.images.length > 0) {
                    <div class="w-full h-24 rounded-lg overflow-hidden mb-2">
                      <img [src]="uploadsUrl + place.images[0].url" [alt]="place.name"
                           class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                    </div>
                  } @else {
                    <div class="w-full h-24 rounded-lg bg-slate-800 mb-2 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-slate-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                  }
                  <p class="text-sm font-medium text-white truncate">{{ place.name }}</p>
                  <p class="text-xs text-slate-500 mt-0.5">{{ place.visitDate || 'No date' }}</p>
                </button>
              }
            </div>
          } @else {
            <p class="text-sm text-slate-500 text-center py-4">No places added yet</p>
          }
        </div>
      </div>
    }
  `
})
export class CountryDetailComponent {
  uploadsUrl = environment.uploadsUrl;
  @Input() country: Country | null = null;
  @Input() places: Place[] = [];
  @Output() selectPlace = new EventEmitter<Place>();
  @Output() closeDetail = new EventEmitter<void>();

  getFlag(code: string): string {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  getStatusLabel(): string {
    if (this.country?.code === MOTHERLAND_CODE) return 'Motherland';
    return this.country?.visited ? 'Visited' : 'Not visited';
  }

  getStatusClass(): string {
    if (this.country?.code === MOTHERLAND_CODE) return 'bg-blue-500/20 text-blue-400';
    return this.country?.visited ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400';
  }
}
