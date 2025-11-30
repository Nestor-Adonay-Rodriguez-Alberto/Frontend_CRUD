import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { EmpleadosService } from '../../core/services/empleados.service';
import { Empleado } from '../../core/models/empleado.model';

@Component({
  selector: 'app-empleados-dashboard',
  templateUrl: './empleados-dashboard.component.html',
  styleUrls: ['./empleados-dashboard.component.css']
})
export class EmpleadosDashboardComponent implements OnInit, OnDestroy {
  displayedColumns = ['nombre', 'puesto', 'actions'];
  empleados: Empleado[] = [];
  totalItems = 0;
  page = 1;
  pageSize = 5;
  loadingList = false;
  private searchSub?: Subscription;

  readonly searchControl = new FormControl('');

  constructor(
    private empleadosService: EmpleadosService,
    private notification: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmpleados();

    this.searchSub = this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.loadEmpleados();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadEmpleados(): void {
    this.loadingList = true;

    this.empleadosService.getEmpleados(this.page, this.pageSize, this.searchControl.value || undefined).subscribe({
      next: response => {
        this.empleados = response.data || [];
        this.totalItems = response.count;
        this.loadingList = false;
      },
      error: error => {
        this.notification.error(error.message || 'No se pudo cargar el listado');
        this.loadingList = false;
      }
    });
  }

  createEmpleado(): void {
    this.router.navigate(['/empleados/new']);
  }

  editEmpleado(empleado: Empleado): void {
    this.router.navigate(['/empleados', empleado.id, 'edit']);
  }

  viewEmpleado(empleado: Empleado): void {
    this.router.navigate(['/empleados', empleado.id]);
  }

  previousPage(): void {
    if (this.page === 1) {
      return;
    }

    this.page -= 1;
    this.loadEmpleados();
  }

  nextPage(): void {
    if (this.page * this.pageSize >= this.totalItems) {
      return;
    }

    this.page += 1;
    this.loadEmpleados();
  }

  logout(): void {
    this.authService.logout();
  }

  get totalPages(): number {
    if (!this.totalItems) {
      return 1;
    }

    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }
}
