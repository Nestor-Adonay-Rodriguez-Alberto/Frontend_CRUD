import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmpleadosService } from '../../core/services/empleados.service';
import { NotificationService } from '../../core/services/notification.service';
import { Empleado, emptyEmpleado } from '../../core/models/empleado.model';

@Component({
  selector: 'app-empleados-form',
  templateUrl: './empleados-form.component.html',
  styleUrls: ['./empleados-form.component.css']
})
export class EmpleadosFormComponent implements OnInit, OnDestroy {
  private routeSub?: Subscription;
  private mode: 'create' | 'edit' | 'view' = 'create';
  empleadoId?: number;
  loadingEmpleado = false;
  savingEmpleado = false;

  readonly empleadoForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    puesto: ['', [Validators.required, Validators.minLength(3)]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private fb: FormBuilder,
    private empleadosService: EmpleadosService,
    private notification: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.empleadoForm.reset(emptyEmpleado());
    this.applyModeFromRoute();

    this.routeSub = this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');

      if (!idParam) {
        this.setMode('create');
        this.empleadoId = undefined;
        this.empleadoForm.reset(emptyEmpleado());
        return;
      }

      const parsedId = Number(idParam);
      if (Number.isNaN(parsedId)) {
        this.notification.error('Identificador inválido');
        this.navigateBack();
        return;
      }

      if (this.mode === 'create') {
        this.setMode('edit');
      }

      this.empleadoId = parsedId;
      this.fetchEmpleado(parsedId);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  handleSubmit(): void {
    if (this.isReadOnly) {
      return;
    }

    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    const payload: Partial<Empleado> = {
      nombre: (this.empleadoForm.value.nombre || '').trim(),
      puesto: (this.empleadoForm.value.puesto || '').trim(),
      contrasena: this.empleadoForm.value.contrasena || ''
    };

    this.savingEmpleado = true;

    const request$ = this.isEditMode && this.empleadoId
      ? this.empleadosService.updateEmpleado(this.empleadoId, payload)
      : this.empleadosService.createEmpleado(payload);

    request$.subscribe({
      next: () => {
        this.notification.success(this.isEditMode ? 'Empleado actualizado' : 'Empleado creado');
        this.navigateBack();
      },
      error: error => {
        this.notification.error(error.message || 'No se pudo guardar el empleado');
        this.savingEmpleado = false;
      }
    });
  }

  cancel(): void {
    this.navigateBack();
  }

  private fetchEmpleado(id: number): void {
    this.loadingEmpleado = true;

    this.empleadosService.getEmpleadoById(id).subscribe({
      next: empleado => {
        this.empleadoForm.patchValue(empleado);
        if (this.isReadOnly) {
          this.empleadoForm.disable({ emitEvent: false });
        }
        this.loadingEmpleado = false;
      },
      error: error => {
        this.notification.error(error.message || 'No se pudo cargar el empleado');
        this.loadingEmpleado = false;
        this.navigateBack();
      }
    });
  }

  private navigateBack(): void {
    this.savingEmpleado = false;
    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    this.router.navigate(['/empleados']);
  }

  get title(): string {
    if (this.isReadOnly) {
      return 'Detalle del empleado';
    }

    return this.isEditMode ? 'Editar empleado' : 'Nuevo empleado';
  }

  get subtitle(): string {
    if (this.isReadOnly) {
      return 'Consulta la información registrada para este empleado';
    }

    return this.isEditMode
      ? 'Actualiza los datos y guarda los cambios'
      : 'Completa el formulario para registrar un empleado';
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  get isReadOnly(): boolean {
    return this.mode === 'view';
  }

  private applyModeFromRoute(): void {
    const routeMode = (this.route.snapshot.data['mode'] as 'create' | 'edit' | 'view' | undefined) ?? 'create';
    this.setMode(routeMode);
  }

  private setMode(mode: 'create' | 'edit' | 'view'): void {
    this.mode = mode;

    if (this.isReadOnly) {
      this.empleadoForm.disable({ emitEvent: false });
    } else {
      this.empleadoForm.enable({ emitEvent: false });
    }
  }
}
