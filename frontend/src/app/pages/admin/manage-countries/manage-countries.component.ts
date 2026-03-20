import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { ApiService } from '../../../services/api.service';
import { Country } from '../../../models/country.model';

@Component({
  selector: 'app-manage-countries',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent],
  template: `
    <app-topbar />
    <div class="pt-[76px] min-h-screen p-8">
      <div class="max-w-4xl mx-auto">

        <div class="flex items-center justify-between mb-8 fade-in">
          <div>
            <h1 class="text-3xl font-bold text-white">Countries</h1>
          </div>
          <div class="flex items-center gap-3 text-sm text-slate-400">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              {{ visitedCount }} visited
            </span>
            <span>of {{ countries.length }}</span>
          </div>
        </div>

        <!-- Search -->
        <div class="mb-6 fade-in">
          <div class="relative">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="filterCountries()"
                   placeholder="Search countries..."
                   class="input-field !pl-12 !py-3">
          </div>
        </div>

        <!-- Country Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (country of filteredCountries; track country.id; let i = $index) {
            <div class="glass-card-sm p-4 flex items-center justify-between group hover:border-emerald-500/20 transition-all slide-up"
                 [style.animation-delay]="(i * 30) + 'ms'">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ getFlag(country.code) }}</span>
                <div>
                  <p class="text-sm font-medium text-white">{{ country.name }}</p>
                  <p class="text-xs text-slate-500">{{ country.code }} · {{ country.placesCount }} places</p>
                </div>
              </div>
              <button (click)="toggleVisited(country)"
                      class="relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer"
                      [class]="country.visited ? 'bg-emerald-500' : 'bg-slate-700'">
                <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300"
                      [class]="country.visited ? 'left-[26px]' : 'left-0.5'"></span>
              </button>
            </div>
          }
        </div>

        @if (filteredCountries.length === 0) {
          <div class="text-center py-16 text-slate-500">
            <p>No countries match your search</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ManageCountriesComponent implements OnInit {
  private api = inject(ApiService);

  countries: Country[] = [];
  filteredCountries: Country[] = [];
  searchTerm = '';

  get visitedCount(): number {
    return this.countries.filter(c => c.visited).length;
  }

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.api.getCountries().subscribe(c => {
      this.countries = c;
      this.filterCountries();
    });
  }

  filterCountries() {
    if (!this.searchTerm.trim()) {
      this.filteredCountries = this.countries;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCountries = this.countries.filter(c =>
      c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term)
    );
  }

  toggleVisited(country: Country) {
    this.api.toggleCountryVisit(country.id).subscribe(updated => {
      const idx = this.countries.findIndex(c => c.id === updated.id);
      if (idx !== -1) this.countries[idx] = updated;
      this.filterCountries();
    });
  }

  getFlag(code: string): string {
    const codePoints = code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
}
