import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaType } from '../../models/MediaType';

interface MediaTypeOption {
  value: MediaType;
  label: string;
}

@Component({
  selector: 'app-media-type-selector',
  imports: [CommonModule],
  templateUrl: './media-type-selector.component.html',
  styleUrl: './media-type-selector.component.scss',
})
export class MediaTypeSelectorComponent {
  @Input() selectedType: MediaType = 'video';
  @Output() selectedTypeChange = new EventEmitter<MediaType>();

  readonly options: MediaTypeOption[] = [
    { value: 'video', label: 'Vídeo' },
    { value: 'audio', label: 'Áudio' },
    { value: 'image', label: 'Imagem' },
    { value: 'text', label: 'Texto' },
  ];

  select(type: MediaType): void {
    if (this.selectedType !== type) {
      this.selectedTypeChange.emit(type);
    }
  }
}

