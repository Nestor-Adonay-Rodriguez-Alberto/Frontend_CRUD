import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { SeriesService } from '../../core/services/series.service';
import { Serie } from '../../core/models/serie.model';

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
  private searchSub?: Subscription;

  readonly searchControl = new FormControl('');

  constructor(
    private seriesService: SeriesService,
    private notification: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

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

  createSerie(): void {
    this.router.navigate(['/series/new']);
  }

  editSerie(serie: Serie): void {
    this.router.navigate(['/series', serie.id, 'edit']);
  }

  viewSerie(serie: Serie): void {
    this.router.navigate(['/series', serie.id]);
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
