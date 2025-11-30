import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuOption {
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  readonly options: MenuOption[] = [
    {
      title: 'Series',
      description: 'Administra el catálogo de series disponible',
      icon: 'movie',
      route: '/series'
    },
    {
      title: 'Empleados',
      description: 'Gestiona la información del personal',
      icon: 'groups',
      route: '/empleados'
    }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }
}
