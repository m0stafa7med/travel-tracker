import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card-sm p-5 flex items-center gap-4 slide-up" [style.animation-delay]="delay + 'ms'">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
           [style.background]="'linear-gradient(135deg, ' + gradientFrom + ', ' + gradientTo + ')'">
        <span [innerHTML]="icon"></span>
      </div>
      <div>
        <p class="text-2xl font-bold text-white">{{ value }}</p>
        <p class="text-sm text-slate-400">{{ label }}</p>
      </div>
    </div>
  `
})
export class StatsCardComponent {
  @Input() icon = '';
  @Input() value: string | number = 0;
  @Input() label = '';
  @Input() gradientFrom = '#22c55e';
  @Input() gradientTo = '#059669';
  @Input() delay = 0;
}
