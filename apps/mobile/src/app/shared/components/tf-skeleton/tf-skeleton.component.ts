import { Component, Input } from '@angular/core';

@Component({
  selector: 'tf-skeleton',
  standalone: true,
  template: `<div class="sk" [style.width]="width" [style.height]="height" [style.borderRadius]="radius"></div>`,
  styles: [`
    .sk {
      background: linear-gradient(90deg, var(--tf-bg3) 25%, var(--tf-bg2) 50%, var(--tf-bg3) 75%);
      background-size: 200% 100%;
      animation: skeleton-shine 1.4s infinite;
    }
    @keyframes skeleton-shine {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
  `],
})
export class TfSkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() radius = '8px';
}
