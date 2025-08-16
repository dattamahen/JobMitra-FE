import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resume } from '../../services/resume.service';

@Component({
  selector: 'app-classic-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './classic-template.component.html',
  styleUrls: ['./classic-template.component.css']
})
export class ClassicTemplateComponent {
  @Input() cv!: Resume;
}