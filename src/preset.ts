import type { IonicConfig } from '@ionic/core';
import { iosTransitionAnimation } from './transition/ios.transition';
import { iosEnterAnimation } from './popover/animations/ios.enter';
import { iosLeaveAnimation } from './popover/animations/ios.leave';

/** Create options for the application's existing Ionic initializer. */
export const ios26ThemeConfig = (existing: IonicConfig = {}): IonicConfig => {
  const mode = existing.mode ?? 'ios';
  const animations =
    mode === 'ios'
      ? {
          navAnimation: iosTransitionAnimation,
          popoverEnter: iosEnterAnimation,
          popoverLeave: iosLeaveAnimation,
        }
      : {};

  return { ...animations, ...existing, mode };
};
