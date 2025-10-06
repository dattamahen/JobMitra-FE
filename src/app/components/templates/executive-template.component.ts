import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resume } from '../../shared/interfaces/resume.interfaces';

@Component({
  selector: 'app-executive-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './executive-template.component.html',
  styleUrls: ['./executive-template.component.css']
})
export class ExecutiveTemplateComponent {
  @Input() cv!: Resume;
}