import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MediaType } from '../../models/MediaType';

@Component({
  selector: 'app-file-dropzone',
  imports: [CommonModule],
  templateUrl: './file-dropzone.component.html',
  styleUrl: './file-dropzone.component.scss',
})
export class FileDropzoneComponent {
  @Input() title = 'Arquivo de Mídia';
  @Input() mediaType: MediaType = 'video';
  @Input() accept = '';
  @Input() selectedFileName = '';
  @Input() compact = false;
  @Input() compactPlaceholder = 'Adicionar imagem de capa';

  @Output() fileSelected = new EventEmitter<File>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  isDragging = false;

  get helperLabel(): string {
    switch (this.mediaType) {
      case 'video':
        return 'Vídeos';
      case 'audio':
        return 'Áudios';
      case 'image':
        return 'Imagens';
      case 'text':
        return 'Textos';
    }
  }

  openPicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }
}
