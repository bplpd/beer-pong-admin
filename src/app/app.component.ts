import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatIconModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background-color: #ffffff;
        color: #24292f;
        display: flex;
        flex-direction: column;
      }

      main {
        flex: 1;
        width: 100%;
      }

      header {
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      }

      a {
        transition: all 0.2s ease;
      }
    `,
  ],
})
export class AppComponent {
  currentYear = new Date().getFullYear();
}
