import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MapComponent } from '../../components/map/map.component';
import { CountryDetailComponent } from '../../components/country-detail/country-detail.component';
import { PlaceModalComponent } from '../../components/place-modal/place-modal.component';
import { ApiService } from '../../services/api.service';
import { Country } from '../../models/country.model';
import { Place, Stats } from '../../models/place.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TopbarComponent, MapComponent, CountryDetailComponent, PlaceModalComponent],
  template: `
    <app-topbar />

    <div class="pt-[76px]">
      <main class="w-full h-[calc(100vh-76px)]">
        <app-map
          [countries]="countries"
          [places]="places"
          [selectedCountry]="selectedCountry"
          (countryClick)="onCountrySelect($event)"
          (placeClick)="onPlaceSelect($event)" />
      </main>
    </div>

    <app-country-detail
      [country]="selectedCountry"
      [places]="countryPlaces"
      (selectPlace)="onPlaceSelect($event)"
      (closeDetail)="selectedCountry = null" />

    <app-place-modal
      [place]="selectedPlace"
      (close)="selectedPlace = null" />
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  private routerSub?: Subscription;

  countries: Country[] = [];
  places: Place[] = [];
  stats: Stats | null = null;
  selectedCountry: Country | null = null;
  selectedPlace: Place | null = null;
  countryPlaces: Place[] = [];

  ngOnInit() {
    this.loadData();

    // Reload data every time user navigates back to home
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/home') {
        this.loadData();
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  loadData() {
    this.api.getCountries().subscribe(c => this.countries = [...c]);
    this.api.getPlaces().subscribe(p => this.places = [...p]);
    this.api.getStats().subscribe(s => this.stats = s);
  }

  onCountrySelect(country: Country) {
    this.selectedCountry = country;
    this.api.getPlaces(country.id).subscribe(p => this.countryPlaces = p);
  }

  onPlaceSelect(place: Place) {
    this.selectedPlace = place;
  }
}
