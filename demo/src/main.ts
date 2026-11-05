import { miniPlayer } from './native-ui/mini-player';
import { counter, accessoryCounter } from './native-ui/counter';
import { bootstrapApplication } from '@angular/platform-browser';
import { createAppConfig, type IonicAnimationOptions } from './app/app.config';
import { AppComponent } from './app/app.component';
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';
import { DuoModeService } from './app/duo-mode.service';
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

// The stock-Ionic build exercises vertical bars without loading the iOS theme.
const stockIonic = getComputedStyle(document.documentElement).getPropertyValue('--demo-stock-ionic').trim() === '1';

/**
 * Adaptive CSS selects styles; page transition always uses iOS 27 — see README.md.
 * Resolved synchronously so Ionic's global config is initialized before any element upgrades.
 */
function loadIOSAnimations(): IonicAnimationOptions {
  if (stockIonic || typeof CSS === 'undefined') return {};
  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};

  return {
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  };
}

// Keep the Web fallback available in the demo; applications can choose when to enable it.
void bootstrapApplication(AppComponent, createAppConfig(loadIOSAnimations()))
  .then((app) => app.injector.get(DuoModeService).initialize())
  .catch((err) => console.error(err));
const verticalBarsOnly = stockIonic || new URLSearchParams(window.location.search).has('verticalBarsOnly');
const buttonDefaultFill =
  stockIonic || new URLSearchParams(window.location.search).get('buttonDefaultFill') === 'solid' ? 'solid' : 'glass';
const buttonProjection = new URLSearchParams(window.location.search).get('buttonProjection') === 'source' ? 'source' : 'system';
void enableNativeUI({
  controls: verticalBarsOnly ? 'verticalOnly' : true,
  extensions: verticalBarsOnly ? [] : [counter, accessoryCounter, miniPlayer],
  ionic: { verticalBars: { buttonProjection, buttonDefaultFill, popover: true } },
}).then((handle) => {
  const app = document.querySelector('ion-app');
  if (app) Object.assign(app, { nativeUI: handle });
});
