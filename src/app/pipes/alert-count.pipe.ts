import { Pipe, PipeTransform } from '@angular/core';
import { Notification } from '../components/notifications/notifications.component';

@Pipe({ name: 'alertCount', standalone: true })
export class AlertCountPipe implements PipeTransform {
  transform(notifications: Notification[], type: string): number {
    return notifications.filter(n => n.type === type).length;
  }
}
