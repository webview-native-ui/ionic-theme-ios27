import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { resolveVerticalBarsLayout } from '@rdlabo/capacitor-native-ui/integration';
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

/** Demo preview on ordinary devices; actual layout on iPhone Duo. */
@Injectable({ providedIn: 'root' })
export class DuoModeService {
  readonly isDuoDevice = signal(false);
  readonly previewEnabled = signal(false);
  readonly #destroyRef = inject(DestroyRef);

  async initialize() {
    if (Capacitor.getPlatform() !== 'ios') return;
    const { foldable } = await Foldable.isDeviceFoldable();
    if (!foldable || this.#destroyRef.destroyed) return;
    this.isDuoDevice.set(true);
    const listener = await Foldable.addListener('layoutChange', () => void this.#applyDeviceLayout());
    if (this.#destroyRef.destroyed) {
      await listener.remove();
      return;
    }
    this.#destroyRef.onDestroy(() => void listener.remove());
    await this.#applyDeviceLayout();
  }

  setPreview(enabled: boolean) {
    if (this.isDuoDevice()) return;
    this.previewEnabled.set(enabled);
    setVerticalBarsLayout({ edge: enabled ? 'trailing' : null });
  }

  async #applyDeviceLayout() {
    setVerticalBarsLayout(await resolveVerticalBarsLayout(Foldable));
  }
}
