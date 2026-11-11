import type { IonicConfig } from '@ionic/core';
import { iosTransitionAnimation } from './transition/ios.transition';
import { iosEnterAnimation } from './popover/animations/ios.enter';
import { iosLeaveAnimation } from './popover/animations/ios.leave';

/** Spread these options into the application's existing Ionic initializer. */
export const ios26ThemeConfig: IonicConfig = {
  mode: 'ios',
  navAnimation: iosTransitionAnimation,
  popoverEnter: iosEnterAnimation,
  popoverLeave: iosLeaveAnimation,
};
