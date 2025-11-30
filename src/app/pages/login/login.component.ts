import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoginCredentials } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  hidePassword = true;
  isSubmitting = false;

  readonly loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private notification: NotificationService, private router: Router) {}

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const credentials: LoginCredentials = {
      username: this.usernameControl?.value || '',
      password: this.passwordControl?.value || ''
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.notification.success('Bienvenido de nuevo');
        this.router.navigate(['/series']);
      },
      error: error => {
        this.notification.error(error.message || 'No se pudo iniciar sesión');
        this.isSubmitting = false;
      }
    });
  }

  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}
