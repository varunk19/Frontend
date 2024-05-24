import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-hamburger-menu',
  templateUrl: './hamburger-menu.component.html',
  styleUrl: './hamburger-menu.component.scss'
})
export class HamburgerMenuComponent {
  @Input() dashboard: boolean = false;

  isOpen: any;
  menuItems: any[] = [];

  constructor(private router: Router, private location: Location) {
    if(this.dashboard)
      this.menuItems.push({
        label: 'Dashboard',
        route: '/dashboard',
      });
    this.menuItems = [
      {
        label: 'Flight Plan',
        route: '/flight-plan',
      },
      {
        label: 'Logout',
        route: '/login',
      }
    ];
  }

  toggleMenu(event: any) {
    this.isOpen = !this.isOpen;
    event.target.focus();
  }

  closeMenu() {
    this.isOpen = false;
  }

  goToPage(route: string) {
    if(route === '/login') {
      sessionStorage.clear();
      this.location.replaceState('/login');
    }
    this.router.navigateByUrl(route);
    this.isOpen = false;
  }
}
