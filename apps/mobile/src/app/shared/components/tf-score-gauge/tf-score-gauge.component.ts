import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tf-score-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gauge-wrap">
      <svg viewBox="0 0 120 120" class="gauge-svg">
        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--tf-bg3)" stroke-width="10"/>
        <circle cx="60" cy="60" r="50" fill="none"
          stroke="var(--tf-green)" stroke-width="10"
          stroke-dasharray="314"
          [attr.stroke-dashoffset]="dashOffset"
          stroke-linecap="round"
          transform="rotate(-90 60 60)"
          style="transition: stroke-dashoffset 0.8s ease"/>
      </svg>
      <div class="gauge-center">
        <span class="score-val">{{ score }}</span>
        <span class="score-lbl">{{ statusLabel }}</span>
      </div>
    </div>
  `,
  styles: [`
    .gauge-wrap { position: relative; width: 140px; height: 140px; margin: 0 auto; }
    .gauge-svg  { width: 100%; height: 100%; }
    .gauge-center {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .score-val { font-size: 28px; font-weight: 700; color: var(--tf-green); }
    .score-lbl { font-size: 11px; color: var(--tf-text-muted); margin-top: 2px; }
  `],
})
export class TfScoreGaugeComponent implements OnChanges {
  @Input() score = 0;
  dashOffset = 314;
  statusLabel = '';

  ngOnChanges() {
    this.dashOffset = 314 - (314 * this.score / 100);
    if (this.score >= 80) this.statusLabel = 'Destacado';
    else if (this.score >= 60) this.statusLabel = 'Activo';
    else if (this.score >= 40) this.statusLabel = 'Inactivo';
    else if (this.score >= 20) this.statusLabel = 'Dormido';
    else this.statusLabel = 'Archivado';
  }
}
