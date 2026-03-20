import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Country } from '../../models/country.model';
import { Stats } from '../../models/place.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="w-[380px] h-[calc(100vh-76px)] fixed left-0 top-[76px] overflow-y-auto z-10"
           style="background: rgba(15, 23, 42, 0.95); border-right: 1px solid rgba(148, 163, 184, 0.1);">

      <!-- Stats Section -->
      <div class="p-5 border-b border-slate-700/50">
        <div class="grid grid-cols-2 gap-3">
          <div class="glass-card-sm p-4 text-center">
            <p class="text-2xl font-bold text-emerald-400">{{ stats?.visitedCountries || 0 }}</p>
            <p class="text-xs text-slate-400 mt-1">Countries Visited</p>
          </div>
          <div class="glass-card-sm p-4 text-center">
            <p class="text-2xl font-bold text-blue-400">{{ stats?.totalPlaces || 0 }}</p>
            <p class="text-xs text-slate-400 mt-1">Places Explored</p>
          </div>
        </div>
        @if (stats) {
          <div class="mt-3">
            <div class="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progress</span>
              <span>{{ stats.visitedPercentage }}%</span>
            </div>
            <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                   [style.width.%]="stats.visitedPercentage"></div>
            </div>
          </div>
        }
      </div>

      <!-- Search -->
      <div class="p-4">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()"
                 placeholder="Search countries..."
                 class="input-field !pl-10 !py-2.5 text-sm">
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="px-4 flex gap-2 mb-3">
        <button (click)="filter = 'all'; onSearch()"
                [class]="filter === 'all' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'"
                class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all">
          All ({{ countries.length }})
        </button>
        <button (click)="filter = 'visited'; onSearch()"
                [class]="filter === 'visited' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'"
                class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all">
          Visited ({{ visitedCount }})
        </button>
        <button (click)="filter = 'unvisited'; onSearch()"
                [class]="filter === 'unvisited' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'"
                class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all">
          Remaining ({{ countries.length - visitedCount }})
        </button>
      </div>

      <!-- Country List -->
      <div class="px-4 pb-4 space-y-2">
        @for (country of filteredCountries; track country.id) {
          <button (click)="selectCountry.emit(country)"
                  class="w-full text-left p-3 rounded-xl transition-all hover:bg-slate-800/80 border border-transparent hover:border-slate-700/50 group"
                  [class]="selectedCountry?.id === country.id ? 'border-emerald-500/30 bg-emerald-500/10' : ''">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                   [style.background]="country.visited ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.1)'">
                <span class="text-sm">{{ getFlag(country.code) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ country.name }}</p>
                <p class="text-xs text-slate-500">{{ country.code }} · {{ country.placesCount }} places</p>
              </div>
              @if (country.visited) {
                <div class="w-2 h-2 rounded-full bg-emerald-400 shrink-0" style="animation: pulse-glow 2s ease infinite;"></div>
              }
            </div>
          </button>
        }

        @if (filteredCountries.length === 0) {
          <div class="text-center py-8 text-slate-500">
            <p class="text-sm">No countries found</p>
          </div>
        }
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() countries: Country[] = [];
  @Input() stats: Stats | null = null;
  @Input() selectedCountry: Country | null = null;
  @Output() selectCountry = new EventEmitter<Country>();

  searchTerm = '';
  filter: 'all' | 'visited' | 'unvisited' = 'all';
  filteredCountries: Country[] = [];

  get visitedCount(): number {
    return this.countries.filter(c => c.visited).length;
  }

  ngOnChanges() {
    this.onSearch();
  }

  onSearch() {
    let result = this.countries;

    if (this.filter === 'visited') result = result.filter(c => c.visited);
    if (this.filter === 'unvisited') result = result.filter(c => !c.visited);

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term)
      );
    }

    this.filteredCountries = result;
  }

  getFlag(code: string): string {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
}
