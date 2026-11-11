import type { IonicConfig } from '@ionic/core/components';
import { iosPopoverEnterAnimation, iosPopoverLeaveAnimation } from '@rdlabo/ionic-theme-utils';
import { iosTransitionAnimation } from './transition/ios.transition';

/** Apply theme defaults before the application's existing Ionic initialization. */
export const ios27ThemeConfig = (existing: IonicConfig = {}): IonicConfig => {
  const mode = existing.mode ?? 'ios';
  const animations =
    mode === 'ios'
      ? {
          navAnimation: iosTransitionAnimation,
          popoverEnter: iosPopoverEnterAnimation,
          popoverLeave: iosPopoverLeaveAnimation,
        }
      : {};
  return { ...animations, ...existing, mode };
};
