import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {
  private activeDropdown: any = null;

  setActiveDropdown(dropdown: any) {
    if (this.activeDropdown && this.activeDropdown !== dropdown) {
      this.activeDropdown.close();
    }
    this.activeDropdown = dropdown;
  }

  clearActiveDropdown(dropdown: any) {
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
    }
  }
}
