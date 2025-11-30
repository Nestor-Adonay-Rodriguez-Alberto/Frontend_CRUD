import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesService } from '../../core/services/series.service';
import { NotificationService } from '../../core/services/notification.service';
import { Serie, emptySerie } from '../../core/models/serie.model';

@Component({
  selector: 'app-series-form',
  templateUrl: './series-form.component.html',
  styleUrls: ['./series-form.component.css']
})
export class SeriesFormComponent implements OnInit {
  isEditMode = false;
  serieId?: number;
  loadingSerie = false;
  savingSerie = false;

  readonly serieForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    temporadas: [1, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private seriesService: SeriesService,
    private notification: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.serieForm.reset(emptySerie());
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');

      if (!idParam) {
        this.isEditMode = false;
        this.serieId = undefined;
        this.serieForm.reset(emptySerie());
        return;
      }

      const parsedId = Number(idParam);
      if (Number.isNaN(parsedId)) {
        this.notification.error('Identificador inválido');
        this.navigateBack();
        return;
      }

      this.isEditMode = true;
      this.serieId = parsedId;
      this.fetchSerie(parsedId);
    });
  }

  handleSubmit(): void {
    if (this.serieForm.invalid) {
      this.serieForm.markAllAsTouched();
      return;
    }

    const payload: Partial<Serie> = {
      titulo: (this.serieForm.value.titulo || '').trim(),
      temporadas: Math.max(1, Number(this.serieForm.value.temporadas) || 1)
    };

    this.savingSerie = true;

    const request$ = this.isEditMode && this.serieId
      ? this.seriesService.updateSerie(this.serieId, payload)
      : this.seriesService.createSerie(payload);

    request$.subscribe({
      next: () => {
        this.notification.success(this.isEditMode ? 'Serie actualizada' : 'Serie creada');
        this.navigateBack();
      },
      error: error => {
        this.notification.error(error.message || 'No se pudo guardar la serie');
        this.savingSerie = false;
      }
    });
  }

  cancel(): void {
    this.navigateBack();
  }

  private fetchSerie(id: number): void {
    this.loadingSerie = true;

    this.seriesService.getSerieById(id).subscribe({
      next: serie => {
        this.serieForm.patchValue(serie);
        this.loadingSerie = false;
      },
      error: error => {
        this.notification.error(error.message || 'No se pudo cargar la serie');
        this.loadingSerie = false;
        this.navigateBack();
      }
    });
  }

  private navigateBack(): void {
    this.savingSerie = false;
    this.router.navigate(['/series']);
  }

  get title(): string {
    return this.isEditMode ? 'Editar serie' : 'Nueva serie';
  }

  get subtitle(): string {
    return this.isEditMode
      ? 'Actualiza la información y guarda los cambios'
      : 'Completa el formulario para agregar una serie al catálogo';
  }
}
