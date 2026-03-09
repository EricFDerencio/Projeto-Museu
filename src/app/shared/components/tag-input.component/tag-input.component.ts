import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tag-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.scss',
})
export class TagInputComponent {
  @Input() title = 'Palavras-chave';
  @Input() placeholder = 'Digite uma tag e pressione Enter';
  @Input() buttonLabel = 'Adicionar';
  @Input() tags: string[] = [];
  @Input() embedded = false;

  @Output() tagsChange = new EventEmitter<string[]>();

  draftTag = '';

  addTag(): void {
    const normalized = this.draftTag.trim();
    if (!normalized) {
      return;
    }

    const exists = this.tags.some((tag) => tag.toLowerCase() === normalized.toLowerCase());
    if (!exists) {
      this.tagsChange.emit([...this.tags, normalized]);
    }
    this.draftTag = '';
  }

  removeTag(tagToRemove: string): void {
    this.tagsChange.emit(this.tags.filter((tag) => tag !== tagToRemove));
  }
}
