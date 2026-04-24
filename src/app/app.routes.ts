import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SpendAnalyzerComponent } from './components/spend-analyzer/spend-analyzer.component';
import { InvestmentPlanningComponent } from './components/investment-planning/investment-planning.component';
import { InvestmentTrackerComponent } from './components/investment-tracker/investment-tracker.component';
import { BudgetTrackerComponent } from './components/budget-tracker/budget-tracker.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ReportsComponent } from './components/reports/reports.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'spend-analyzer', component: SpendAnalyzerComponent },
  { path: 'investment-planning', component: InvestmentPlanningComponent },
  { path: 'investment-tracker', component: InvestmentTrackerComponent },
  { path: 'budget-tracker', component: BudgetTrackerComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'reports', component: ReportsComponent }
];
