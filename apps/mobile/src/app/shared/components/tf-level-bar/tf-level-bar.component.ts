import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tf-level-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="level-wrap">
      <div class="level-header">
        <span class="level-label">{{ levelLabel }}</span>
        <span class="level-pts">{{ pointsToNext > 0 ? pointsToNext + ' pts para ' + nextLabel : '🏆 Nivel máximo' }}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" [style.width.%]="percent" style="transition: width 0.8s ease;"></div>
      </div>
    </div>
  `,
  styles: [`
    .level-wrap { width: 100%; }
    .level-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .level-label { font-weight: 600; font-size: 14px; }
    .level-pts   { font-size: 12px; color: var(--tf-text-muted); }
    .bar-track   { height: 8px; background: var(--tf-bg3); border-radius: 4px; overflow: hidden; }
    .bar-fill    { height: 100%; background: linear-gradient(90deg, var(--tf-green), #00e5a0); border-radius: 4px; }
  `],
})
export class TfLevelBarComponent {
  @Input() levelLabel = 'Novato';
  @Input() nextLabel = 'Verificado';
  @Input() percent = 0;
  @Input() pointsToNext = 0;
}
