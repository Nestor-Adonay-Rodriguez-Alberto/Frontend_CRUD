import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SeriesDashboardComponent } from './pages/series-dashboard/series-dashboard.component';
import { SeriesFormComponent } from './pages/series-form/series-form.component';
import { AuthGuard } from './core/guards/auth.guard';
import { EmpleadosDashboardComponent } from './pages/empleados-dashboard/empleados-dashboard.component';
import { EmpleadosFormComponent } from './pages/empleados-form/empleados-form.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'series', component: SeriesDashboardComponent, canActivate: [AuthGuard] },
  { path: 'series/new', component: SeriesFormComponent, canActivate: [AuthGuard], data: { mode: 'create' } },
  { path: 'series/:id', component: SeriesFormComponent, canActivate: [AuthGuard], data: { mode: 'view' } },
  { path: 'series/:id/edit', component: SeriesFormComponent, canActivate: [AuthGuard], data: { mode: 'edit' } },
  { path: 'empleados', component: EmpleadosDashboardComponent, canActivate: [AuthGuard] },
  { path: 'empleados/new', component: EmpleadosFormComponent, canActivate: [AuthGuard], data: { mode: 'create' } },
  { path: 'empleados/:id', component: EmpleadosFormComponent, canActivate: [AuthGuard], data: { mode: 'view' } },
  { path: 'empleados/:id/edit', component: EmpleadosFormComponent, canActivate: [AuthGuard], data: { mode: 'edit' } },
  { path: '', pathMatch: 'full', redirectTo: 'series' },
  { path: '**', redirectTo: 'series' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
