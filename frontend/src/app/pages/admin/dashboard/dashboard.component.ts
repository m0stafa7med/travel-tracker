import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { StatsCardComponent } from '../../../components/stats-card/stats-card.component';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Stats } from '../../../models/place.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TopbarComponent, StatsCardComponent],
  template: `
    <app-topbar />
    <div class="pt-[76px] min-h-screen p-8">
      <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="mb-8 fade-in">
          <h1 class="text-3xl font-bold text-white">Dashboard</h1>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <app-stats-card
            [icon]="globeIcon"
            [value]="stats?.visitedCountries || 0"
            label="Countries Visited"
            gradientFrom="#22c55e" gradientTo="#059669"
            [delay]="0" />
          <app-stats-card
            [icon]="pinIcon"
            [value]="stats?.totalPlaces || 0"
            label="Places Explored"
            gradientFrom="#3b82f6" gradientTo="#2563eb"
            [delay]="100" />
          <app-stats-card
            [icon]="chartIcon"
            [value]="(stats?.visitedPercentage || 0) + '%'"
            label="World Coverage"
            gradientFrom="#f59e0b" gradientTo="#d97706"
            [delay]="200" />
          <app-stats-card
            [icon]="flagIcon"
            [value]="stats?.totalCountries || 0"
            label="Total Countries"
            gradientFrom="#8b5cf6" gradientTo="#7c3aed"
            [delay]="300" />
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <a routerLink="/admin/countries" class="glass-card p-6 flex items-center gap-5 no-underline group hover:border-emerald-500/30 transition-all slide-up" style="animation-delay: 400ms;">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">Manage Countries</h3>
            </div>
          </a>

          <a routerLink="/admin/places" class="glass-card p-6 flex items-center gap-5 no-underline group hover:border-blue-500/30 transition-all slide-up" style="animation-delay: 500ms;">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">Manage Places</h3>
              <p class="text-sm text-slate-400 mt-1">Add, edit, or remove travel places</p>
            </div>
          </a>
        </div>

        <!-- Last Added Place -->
        @if (stats?.lastAddedPlace; as lastPlace) {
          <div class="glass-card p-6 slide-up" style="animation-delay: 600ms;">
            <h3 class="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Last Added Place</h3>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <p class="text-white font-semibold">{{ lastPlace.name }}</p>
                <p class="text-sm text-slate-400">{{ lastPlace.countryName }} · {{ lastPlace.visitDate || 'No date' }}</p>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  stats: Stats | null = null;

  globeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
  pinIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  chartIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>';
  flagIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>';

  ngOnInit() {
    this.api.getStats().subscribe(s => this.stats = s);
  }
}
