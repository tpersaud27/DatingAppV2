import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nav } from '../layout/nav/nav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, Nav, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
