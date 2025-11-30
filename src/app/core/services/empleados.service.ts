import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Empleado } from '../models/empleado.model';
import { ApiEnvelope, PaginatedApiEnvelope, PaginatedResponse, mapApiResponse, mapPaginatedResponse } from '../models/response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpleadosService {
  private readonly baseUrl = `${environment.apiUrl}/empleados`;

  constructor(private http: HttpClient) {}

  getEmpleados(page: number, pageSize: number, search?: string): Observable<PaginatedResponse<Empleado[]>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    return this.http
      .get<PaginatedApiEnvelope<Empleado[]>>(`${this.baseUrl}/get-all`, { params })
      .pipe(
        map(mapPaginatedResponse),
        map(response => {
          const safe = this.ensureSuccess<Empleado[]>(response);
          return { ...safe, data: (safe.data || []).map(item => this.normalizeEmpleado(item)) };
        }),
        catchError(this.handleError)
      );
  }

  getEmpleadoById(id: number): Observable<Empleado> {
    return this.http
      .get<ApiEnvelope<Empleado>>(`${this.baseUrl}/ById/${id}`)
      .pipe(
        map(mapApiResponse),
        map(this.ensureData<Empleado>('Empleado no encontrado')),
        map(empleado => this.normalizeEmpleado(empleado)),
        catchError(this.handleError)
      );
  }

  createEmpleado(empleado: Partial<Empleado>): Observable<Empleado> {
    return this.http
      .post<ApiEnvelope<Empleado>>(this.baseUrl, this.toApiEmpleado(empleado))
      .pipe(
        map(mapApiResponse),
        map(this.ensureData<Empleado>('No se pudo crear el empleado')),
        map(created => this.normalizeEmpleado(created)),
        catchError(this.handleError)
      );
  }

  updateEmpleado(id: number, empleado: Partial<Empleado>): Observable<Empleado> {
    return this.http
      .put<ApiEnvelope<Empleado>>(`${this.baseUrl}/${id}`, this.toApiEmpleado(empleado))
      .pipe(
        map(mapApiResponse),
        map(this.ensureData<Empleado>('No se pudo actualizar el empleado')),
        map(updated => this.normalizeEmpleado(updated)),
        catchError(this.handleError)
      );
  }

  private ensureSuccess<T>(response: PaginatedResponse<T>): PaginatedResponse<T> {
    if (!response.status) {
      throw new Error(response.message || 'Error al consultar empleados');
    }

    return {
      ...response,
      data: response.data ?? null
    };
  }

  private ensureData<T>(errorMessage: string) {
    return (response: { status: boolean; message: string; data: T | null }): T => {
      if (!response.status || !response.data) {
        throw new Error(response.message || errorMessage);
      }

      return response.data;
    };
  }

  private handleError(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      const apiMessage = error.error?.message || error.error?.Message;
      return throwError(() => new Error(apiMessage || 'Error al comunicarse con el servidor'));
    }

    if (error instanceof Error) {
      return throwError(() => error);
    }

    return throwError(() => new Error('Error inesperado en la operación'));
  }

  private toApiEmpleado(empleado: Partial<Empleado>): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (empleado.id !== undefined) {
      payload['Id'] = empleado.id;
    }

    if (empleado.nombre !== undefined) {
      payload['Nombre'] = empleado.nombre;
    }

    if (empleado.puesto !== undefined) {
      payload['Puesto'] = empleado.puesto;
    }

    if (empleado.contrasena !== undefined) {
      payload['Contraseña'] = empleado.contrasena;
    }

    return payload;
  }

  private normalizeEmpleado(raw: unknown): Empleado {
    return {
      id: Number((raw as { id?: number; Id?: number }).id ?? (raw as { Id?: number }).Id ?? 0),
      nombre: (raw as { nombre?: string; Nombre?: string }).nombre ?? (raw as { Nombre?: string }).Nombre ?? '',
      puesto: (raw as { puesto?: string; Puesto?: string }).puesto ?? (raw as { Puesto?: string }).Puesto ?? '',
      contrasena:
        (raw as { contrasena?: string; Contrasena?: string; Contraseña?: string }).contrasena ??
        (raw as { Contrasena?: string }).Contrasena ??
        (raw as { Contraseña?: string }).Contraseña ??
        ''
    };
  }
}
