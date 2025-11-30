import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { SeriesService } from '../../core/services/series.service';
import { Serie, emptySerie } from '../../core/models/serie.model';

@Component({
  selector: 'app-series-dashboard',
  templateUrl: './series-dashboard.component.html',
  styleUrls: ['./series-dashboard.component.css']
})
export class SeriesDashboardComponent implements OnInit, OnDestroy {
  displayedColumns = ['titulo', 'temporadas', 'actions'];
  series: Serie[] = [];
  totalItems = 0;
  page = 1;
  pageSize = 5;
  loadingList = false;
  savingSerie = false;
  private searchSub?: Subscription;

  readonly searchControl = this.fb.control('');

  readonly serieForm = this.fb.group({
    id: [0],
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    temporadas: [1, [Validators.required, Validators.min(1)]]
  });

  constructor(private fb: FormBuilder, private seriesService: SeriesService, private notification: NotificationService, private authService: AuthService) {
    this.resetForm();
  }

  ngOnInit(): void {
    this.loadSeries();

    this.searchSub = this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.loadSeries();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadSeries(): void {
    this.loadingList = true;

    this.seriesService.getSeries(this.page, this.pageSize, this.searchControl.value || undefined).subscribe({
      next: response => {
        this.series = response.data || [];
        this.totalItems = response.count;
        this.loadingList = false;
      },
      error: error => {
        this.notification.error(error.message || 'No se pudo cargar el listado');
        this.loadingList = false;
      }
    });
  }

  handleSubmit(): void {
    if (this.serieForm.invalid) {
      this.serieForm.markAllAsTouched();
      return;
    }

    const { id, ...dto } = this.serieForm.getRawValue();
    const payload = {
      titulo: (dto.titulo || '').trim(),
      temporadas: Math.max(1, Number(dto.temporadas) || 1)
    };
    this.savingSerie = true;

    const request$ = id && id > 0 ? this.seriesService.updateSerie(id, payload) : this.seriesService.createSerie(payload);

    request$.subscribe({
      next: serie => {
        this.notification.success(id && id > 0 ? 'Serie actualizada' : 'Serie creada');
        this.resetForm();
        this.loadSeries();
        this.savingSerie = false;
      },
      error: error => {
        this.notification.error(error.message || 'No se pudo guardar la serie');
        this.savingSerie = false;
      }
    });
  }

  editSerie(serie: Serie): void {
    this.serieForm.patchValue(serie);
    if (typeof window !== 'undefined') {
      window.scroll({ top: 0, behavior: 'smooth' });
    }
  }

  resetForm(): void {
    this.serieForm.reset(emptySerie());
    this.serieForm.markAsPristine();
    this.serieForm.markAsUntouched();
  }

  previousPage(): void {
    if (this.page === 1) {
      return;
    }

    this.page -= 1;
    this.loadSeries();
  }

  nextPage(): void {
    if (this.page * this.pageSize >= this.totalItems) {
      return;
    }

    this.page += 1;
    this.loadSeries();
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
