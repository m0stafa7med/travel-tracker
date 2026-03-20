import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Place } from '../../models/place.model';

@Component({
  selector: 'app-place-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (place) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="close.emit()">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="glass-card max-w-lg w-full p-0 overflow-hidden relative fade-in" (click)="$event.stopPropagation()">

          <!-- Image Slider -->
          @if (place.images && place.images.length > 0) {
            <div class="relative h-64 bg-slate-800">
              <img [src]="'http://localhost:8080' + place.images[currentImageIndex].url"
                   [alt]="place.name"
                   class="w-full h-full object-cover">
              @if (place.images.length > 1) {
                <button (click)="prevImage()" class="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button (click)="nextImage()" class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  @for (img of place.images; track img.id; let i = $index) {
                    <button (click)="currentImageIndex = i"
                            class="w-2 h-2 rounded-full transition-all"
                            [class]="i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'"></button>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="h-40 bg-gradient-to-br from-emerald-900/50 to-slate-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-slate-600" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          }

          <!-- Content -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-xl font-bold text-white">{{ place.name }}</h2>
                <p class="text-sm text-emerald-400 mt-1">{{ place.countryName }}</p>
              </div>
              <button (click)="close.emit()"
                      class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            @if (place.description) {
              <p class="text-sm text-slate-300 leading-relaxed mb-4">{{ place.description }}</p>
            }

            <div class="flex flex-wrap gap-3 text-xs text-slate-400">
              @if (place.visitDate) {
                <div class="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ place.visitDate }}
                </div>
              }
              <div class="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ place.latitude?.toFixed(4) }}, {{ place.longitude?.toFixed(4) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class PlaceModalComponent {
  @Input() place: Place | null = null;
  @Output() close = new EventEmitter<void>();
  currentImageIndex = 0;

  ngOnChanges() {
    this.currentImageIndex = 0;
  }

  prevImage() {
    if (this.place?.images) {
      this.currentImageIndex = this.currentImageIndex > 0
        ? this.currentImageIndex - 1
        : this.place.images.length - 1;
    }
  }

  nextImage() {
    if (this.place?.images) {
      this.currentImageIndex = this.currentImageIndex < this.place.images.length - 1
        ? this.currentImageIndex + 1
        : 0;
    }
  }
}
