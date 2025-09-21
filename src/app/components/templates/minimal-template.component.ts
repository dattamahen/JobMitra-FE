import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resume } from '../../shared/interfaces/resume.interfaces';

@Component({
  selector: 'app-minimal-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minimal-template.component.html',
  styleUrls: ['./minimal-template.component.css']
})
export class MinimalTemplateComponent {
  @Input() cv!: Resume;
}