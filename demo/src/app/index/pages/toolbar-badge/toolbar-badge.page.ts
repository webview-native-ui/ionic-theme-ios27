import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonBadge,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@demo/ionic';
import { ellipsisHorizontal } from 'ionicons/icons';

@Component({
  selector: 'app-toolbar-badge',
  standalone: true,
  imports: [IonBadge, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton, IonTitle, IonToolbar],
  templateUrl: './toolbar-badge.page.html',
  styleUrls: ['./toolbar-badge.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarBadgePage {
  readonly more = ellipsisHorizontal;
  readonly directions = ['ltr', 'rtl'] as const;
  readonly badges = ['', '3', '99+'];
}
