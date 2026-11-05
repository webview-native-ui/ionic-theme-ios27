import { DestroyRef, DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { resolveVerticalBarsLayout } from '@rdlabo/capacitor-native-ui/integration';
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

/** Apply reported rail layout; keep manual previews available when no rail is reported. */
@Injectable({ providedIn: 'root' })
export class VerticalBarsDemoService {
  readonly hasReportedRail = signal(false);
  readonly previewEnabled = signal(false);
  readonly #destroyRef = inject(DestroyRef);
  readonly #document = inject(DOCUMENT);

  async initialize() {
    if (Capacitor.getPlatform() !== 'ios') return;
    const listener = await Foldable.addListener('layoutChange', () => void this.#applyReportedLayout());
    if (this.#destroyRef.destroyed) {
      await listener.remove();
      return;
    }
    this.#destroyRef.onDestroy(() => void listener.remove());
    await this.#applyReportedLayout();
  }

  setPreview(enabled: boolean) {
    if (this.hasReportedRail()) return;
    this.previewEnabled.set(enabled);
    setVerticalBarsLayout({ edge: enabled ? 'trailing' : null });
  }

  async #applyReportedLayout() {
    setVerticalBarsLayout(await resolveVerticalBarsLayout(Foldable));
    this.hasReportedRail.set(this.#document.querySelector('ion-app')?.classList.contains('ios-theme-vertical-bars') ?? false);
    if (this.hasReportedRail()) this.previewEnabled.set(false);
    else if (this.previewEnabled()) this.setPreview(true);
  }
}
