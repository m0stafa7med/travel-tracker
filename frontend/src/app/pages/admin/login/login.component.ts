import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TopbarComponent } from '../../../components/topbar/topbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent],
  template: `
    <app-topbar />
    <div class="pt-[76px] min-h-screen flex items-center justify-center">
      <div class="glass-card p-8 w-full max-w-md fade-in">
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Admin Login</h1>
          <p class="text-slate-400 text-sm mt-2">Sign in to manage your travel data</p>
        </div>

        @if (error) {
          <div class="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {{ error }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input type="text" [(ngModel)]="username" name="username"
                   class="input-field" placeholder="Enter username" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input type="password" [(ngModel)]="password" name="password"
                   class="input-field" placeholder="Enter password" required>
          </div>
          <button type="submit" class="btn-primary w-full justify-center !py-3 text-base" [disabled]="loading">
            @if (loading) {
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            } @else {
              Sign In
            }
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  error = '';
  loading = false;

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: () => {
        this.error = 'Invalid username or password';
        this.loading = false;
      }
    });
  }
}
