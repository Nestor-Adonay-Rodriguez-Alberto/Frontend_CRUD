import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Serie } from '../models/serie.model';
import { ApiEnvelope, PaginatedApiEnvelope, PaginatedResponse, mapApiResponse, mapPaginatedResponse } from '../models/response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeriesService {
  private readonly baseUrl = `${environment.apiUrl}/series`;

  constructor(private http: HttpClient) {}

  getSeries(page: number, pageSize: number, search?: string): Observable<PaginatedResponse<Serie[]>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    return this.http
      .get<PaginatedApiEnvelope<Serie[]>>(`${this.baseUrl}/get-all`, { params })
      .pipe(
        map(mapPaginatedResponse),
        map(response => {
          const safeResponse = this.ensureSuccess<Serie[]>(response);
          const normalizedData = (safeResponse.data || []).map(serie => this.normalizeSerie(serie));
          return { ...safeResponse, data: normalizedData };
        }),
        catchError(this.handleError)
      );
  }

  getSerieById(id: number): Observable<Serie> {
    return this.http
      .get<ApiEnvelope<Serie>>(`${this.baseUrl}/ById/${id}`)
      .pipe(
        map(mapApiResponse),
        map(this.ensureData<Serie>('Serie no encontrada')),
        map(serie => this.normalizeSerie(serie)),
        catchError(this.handleError)
      );
  }

  createSerie(serie: Partial<Serie>): Observable<Serie> {
    return this.http
      .post<ApiEnvelope<Serie>>(this.baseUrl, this.toApiSerie(serie))
      .pipe(
        map(mapApiResponse),
        map(this.ensureData<Serie>('No se pudo crear la serie')),
        map(created => this.normalizeSerie(created)),
        catchError(this.handleError)
      );
  }

  updateSerie(id: number, serie: Partial<Serie>): Observable<Serie> {
    return this.http
      .put<ApiEnvelope<Serie>>(`${this.baseUrl}/update/${id}`, this.toApiSerie(serie))
      .pipe(
        map(mapApiResponse),
        map(this.ensureData<Serie>('No se pudo actualizar la serie')),
        map(updated => this.normalizeSerie(updated)),
        catchError(this.handleError)
      );
  }

  private ensureSuccess<T>(response: PaginatedResponse<T>): PaginatedResponse<T> {
    if (!response.status) {
      throw new Error(response.message || 'Error al consultar series');
    }

    return {
      ...response,
      data: response.data ?? (([] as unknown) as T)
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

  private toApiSerie(serie: Partial<Serie>): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (serie.id !== undefined) {
      payload['Id'] = serie.id;
    }

    if (serie.titulo !== undefined) {
      payload['Titulo'] = serie.titulo;
    }

    if (serie.temporadas !== undefined) {
      payload['Temporadas'] = serie.temporadas;
    }

    return payload;
  }

  private normalizeSerie(raw: unknown): Serie {
    return {
      id: Number((raw as { id?: number; Id?: number }).id ?? (raw as { Id?: number }).Id ?? 0),
      titulo: (raw as { titulo?: string; Titulo?: string }).titulo ?? (raw as { Titulo?: string }).Titulo ?? '',
      temporadas: Number((raw as { temporadas?: number; Temporadas?: number }).temporadas ?? (raw as { Temporadas?: number }).Temporadas ?? 0)
    };
  }
}
