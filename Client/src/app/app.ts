import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nav } from '../layout/nav/nav';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlay } from '../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Nav, RouterOutlet, LoadingOverlay],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
