import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieService } from '@core/services/lottie.service';

@Component({
  selector: 'tf-lottie-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" style="position:fixed;inset:0;z-index:9999;pointer-events:none;display:flex;align-items:center;justify-content:center;background:rgba(8,12,18,0.7);">
      <div #container style="width:280px;height:280px;"></div>
    </div>
  `,
})
export class LottieOverlayComponent implements OnInit {
  @Input() animationData: unknown = null;
  @Input() visible = false;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  constructor(private lottie: LottieService) {}

  ngOnInit() {
    if (this.visible && this.animationData && this.containerRef) {
      this.lottie.playOnce(this.containerRef.nativeElement, this.animationData)
        .then(() => { this.visible = false; });
    }
  }
}
