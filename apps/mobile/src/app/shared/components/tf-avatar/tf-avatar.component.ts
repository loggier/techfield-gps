import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tf-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar" [style.width.px]="size" [style.height.px]="size" [style.fontSize.px]="size * 0.38">
      <img *ngIf="src" [src]="src" [alt]="name" />
      <span *ngIf="!src">{{ initial }}</span>
    </div>
  `,
  styles: [`
    .avatar {
      border-radius: 50%;
      background: linear-gradient(135deg, var(--tf-green), var(--tf-blue));
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: #fff; overflow: hidden; flex-shrink: 0;
    }
    img { width: 100%; height: 100%; object-fit: cover; }
  `],
})
export class TfAvatarComponent {
  @Input() src?: string;
  @Input() name = '';
  @Input() size = 40;
  get initial() { return this.name.charAt(0).toUpperCase(); }
}
