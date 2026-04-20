import { Injectable } from '@angular/core';

declare const lottie: {
  loadAnimation(opts: {
    container: HTMLElement;
    renderer: string;
    loop: boolean;
    autoplay: boolean;
    animationData?: unknown;
    path?: string;
  }): { destroy(): void };
};

@Injectable({ providedIn: 'root' })
export class LottieService {
  private import: Promise<unknown> | null = null;

  private async ensureLoaded() {
    if (!this.import) {
      this.import = import('lottie-web').then(m => m.default ?? m);
    }
    return this.import;
  }

  async playOnce(container: HTMLElement, animationData: unknown): Promise<void> {
    const lottieLib = await this.ensureLoaded() as typeof lottie;
    return new Promise(resolve => {
      const anim = lottieLib.loadAnimation({
        container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData,
      });
      // auto-destroy after ~3 s regardless
      const timer = setTimeout(() => { anim.destroy(); resolve(); }, 3000);
      container.addEventListener('DOMAttrModified', () => {}, { once: true });
      setTimeout(() => { clearTimeout(timer); anim.destroy(); resolve(); }, 2800);
    });
  }
}
