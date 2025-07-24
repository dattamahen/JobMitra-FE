import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TopNav } from "./top-nav/top-nav";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, MatToolbarModule, TopNav],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'tech-profile';
}
