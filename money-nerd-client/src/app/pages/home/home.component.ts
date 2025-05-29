import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [],
})
export class HomeComponent implements OnInit {
  constructor(private homeService: HomeService) {}

  ngOnInit() {}

  async getAllTransactions() {
    this.homeService.getTransactions().subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (e) => {
        console.log(e);
      },
    });
  }
}
