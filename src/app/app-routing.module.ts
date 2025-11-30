import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SeriesDashboardComponent } from './pages/series-dashboard/series-dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'series', component: SeriesDashboardComponent, canActivate: [AuthGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'series' },
  { path: '**', redirectTo: 'series' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
