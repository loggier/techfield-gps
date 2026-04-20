import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'green' | 'blue' | 'amber' | 'purple' | 'red' | 'muted';

@Component({
  selector: 'tf-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [class]="variant"><ng-content /></span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }
    .green  { background: rgba(0,196,125,0.15); color: var(--tf-green); }
    .blue   { background: rgba(59,130,246,0.15); color: var(--tf-blue); }
    .amber  { background: rgba(245,158,11,0.15); color: var(--tf-amber); }
    .purple { background: rgba(139,92,246,0.15); color: var(--tf-purple); }
    .red    { background: rgba(239,68,68,0.15); color: var(--tf-red); }
    .muted  { background: rgba(107,122,153,0.15); color: var(--tf-text-muted); }
  `],
})
export class TfBadgeComponent {
  @Input() variant: BadgeVariant = 'green';
}
