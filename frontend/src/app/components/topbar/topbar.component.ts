import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 glass-card" style="border-radius: 0; border-top: none; border-left: none; border-right: none;">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-3 no-underline">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
            </svg>
          </div>
          <span class="text-xl font-bold text-white tracking-tight">Travel Tracker</span>
        </a>

        <div class="flex items-center gap-2">
          @if (auth.isLoggedIn()) {
            <a routerLink="/admin/dashboard" routerLinkActive="!border-emerald-500 !text-emerald-400"
               class="px-4 py-2 rounded-xl border border-transparent text-slate-300 hover:text-white hover:border-slate-600 transition-all no-underline text-sm font-medium">
              Dashboard
            </a>
            <a routerLink="/admin/countries" routerLinkActive="!border-emerald-500 !text-emerald-400"
               class="px-4 py-2 rounded-xl border border-transparent text-slate-300 hover:text-white hover:border-slate-600 transition-all no-underline text-sm font-medium">
              Countries
            </a>
            <a routerLink="/admin/places" routerLinkActive="!border-emerald-500 !text-emerald-400"
               class="px-4 py-2 rounded-xl border border-transparent text-slate-300 hover:text-white hover:border-slate-600 transition-all no-underline text-sm font-medium">
              Places
            </a>
            <button (click)="logout()" class="btn-secondary text-sm !py-2 !px-4 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          }
        </div>
      </div>
    </nav>
  `
})
export class TopbarComponent {
  auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}
