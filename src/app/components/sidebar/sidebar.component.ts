import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems: { path: string; icon: string; label: string; disabled?: boolean }[] = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/spend-analyzer', icon: '📊', label: 'Spend Analyzer' },
    { path: '/investment-tracker', icon: '📈', label: 'Investment Tracker' },
    { path: '/investment-planning', icon: '💰', label: 'Investment Planning' },
    { path: '/budget-tracker', icon: '💳', label: 'Budget Tracker' },
    { path: '/notifications', icon: '🔔', label: 'Notifications & Alerts' },
    { path: '/reports', icon: '📄', label: 'Reports' }
  ];
}
