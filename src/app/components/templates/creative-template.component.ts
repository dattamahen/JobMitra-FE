import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resume } from '../../shared/interfaces/resume.interfaces';

@Component({
  selector: 'app-creative-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creative-template.component.html',
  styleUrls: ['./creative-template.component.css']
})
export class CreativeTemplateComponent {
  @Input() cv!: Resume;
}