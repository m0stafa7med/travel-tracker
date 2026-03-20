import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'admin/login', loadComponent: () => import('./pages/admin/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/countries',
    loadComponent: () => import('./pages/admin/manage-countries/manage-countries.component').then(m => m.ManageCountriesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/places',
    loadComponent: () => import('./pages/admin/manage-places/manage-places.component').then(m => m.ManagePlacesComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
