import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Klaster | Interchain Transaction Explorer';
  isSetNodeVisible = false

  toggleIsNodeVisible() {
    this.isSetNodeVisible = true
  }
}
