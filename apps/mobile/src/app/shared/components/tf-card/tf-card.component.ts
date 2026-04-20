import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tf-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tf-card" [class]="variant">
      <ng-content />
    </div>
  `,
  styles: [`
    .tf-card {
      background: var(--tf-bg2);
      border: 1px solid var(--tf-border);
      border-radius: var(--tf-radius);
      padding: 16px;
    }
    .tf-card.highlight { border-color: var(--tf-green); }
  `],
})
export class TfCardComponent {
  @Input() variant: 'default' | 'highlight' = 'default';
}
