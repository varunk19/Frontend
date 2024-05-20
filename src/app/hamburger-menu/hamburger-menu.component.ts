import { Component } from '@angular/core';

@Component({
  selector: 'app-hamburger-menu',
  templateUrl: './hamburger-menu.component.html',
  styleUrl: './hamburger-menu.component.scss'
})
export class HamburgerMenuComponent {

  isOpen: any;
  menuItems: any;

  constructor() {
    this.menuItems = [
      {
        label: 'Dashboard',
        route: '/dashboard',
      },
      {
        label: 'Flight Plan',
        route: '/flight-plan',
      },
      {
        label: 'Logout',
        route: '/logout',
      }
    ];
  }

  toggleMenu(event: any) {
    this.isOpen = !this.isOpen;
    event.target.focus();
    console.log(event.target);
    console.log(document.activeElement);
  }

  closeMenu() {
    this.isOpen = false;
  }
}
