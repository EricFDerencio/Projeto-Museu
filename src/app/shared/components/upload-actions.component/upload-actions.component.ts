import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-upload-actions',
  imports: [CommonModule],
  templateUrl: './upload-actions.component.html',
  styleUrl: './upload-actions.component.scss',
})
export class UploadActionsComponent {
  @Input() cancelLabel = 'Cancelar';
  @Input() submitLabel = 'Publicar Mídia';
  @Input() submitting = false;
  @Input() disabled = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  onCancel(): void {
    if (!this.submitting) {
      this.cancel.emit();
    }
  }

  onSubmit(): void {
    if (!this.disabled && !this.submitting) {
      this.submit.emit();
    }
  }
}

