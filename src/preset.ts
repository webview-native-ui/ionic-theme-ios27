import type { IonicConfig } from '@ionic/core/components';
import { iosPopoverEnterAnimation, iosPopoverLeaveAnimation } from '@rdlabo/ionic-theme-utils';
import { iosTransitionAnimation } from './transition/ios.transition';

/** Spread theme defaults into the application's existing Ionic initialization. */
export const ios27ThemeConfig: IonicConfig = {
  mode: 'ios',
  navAnimation: iosTransitionAnimation,
  popoverEnter: iosPopoverEnterAnimation,
  popoverLeave: iosPopoverLeaveAnimation,
};
