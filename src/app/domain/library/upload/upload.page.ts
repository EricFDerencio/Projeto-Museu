import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileDropzoneComponent } from '../../../shared/components/file-dropzone.component/file-dropzone.component';
import { MediaTypeSelectorComponent } from '../../../shared/components/media-type-selector.component/media-type-selector.component';
import { TagInputComponent } from '../../../shared/components/tag-input.component/tag-input.component';
import { UploadActionsComponent } from '../../../shared/components/upload-actions.component/upload-actions.component';
import { MediaType } from '../../../shared/models/MediaType';
import { FilterOption } from '../../../shared/models/FilterOption';

@Component({
  selector: 'app-upload-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MediaTypeSelectorComponent,
    FileDropzoneComponent,
    TagInputComponent,
    UploadActionsComponent,
  ],
  templateUrl: './upload.page.html',
  styleUrl: './upload.page.scss',
})
export class UploadPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';
  private readonly fallbackApiUrl = 'http://localhost:3000';

  selectedType: MediaType = 'video';
  mediaFileName = '';
  thumbnailFileName = '';
  keywords: string[] = [];
  museums: FilterOption[] = [];
  isSubmitting = false;
  actionMessage = '';
  selectedMediaFile: File | null = null;
  selectedThumbnailFile: File | null = null;
  mediaPreviewDataUrl: string | null = null;
  thumbnailPreviewDataUrl: string | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    text_content: [''],
    museum_id: ['', [Validators.required]],
    registration_date: [this.today(), [Validators.required]],
  });

  get showMediaFileDropzone(): boolean {
    return this.selectedType !== 'text';
  }

  get canPublish(): boolean {
    const hasRequiredMediaFile = this.showMediaFileDropzone ? !!this.selectedMediaFile : true;
    return this.form.valid && hasRequiredMediaFile && !this.isSubmitting;
  }

  get mediaAccept(): string {
    switch (this.selectedType) {
      case 'video':
        return 'video/*';
      case 'audio':
        return 'audio/*';
      case 'image':
        return 'image/*';
      case 'text':
        return '';
    }
  }

  ngOnInit(): void {
    this.updateTextContentValidation();
    this.loadMuseums();
  }

  onTypeChange(type: MediaType): void {
    this.selectedType = type;
    this.mediaFileName = '';
    this.selectedMediaFile = null;
    this.mediaPreviewDataUrl = null;
    this.updateTextContentValidation();
  }

  onMediaFileSelected(file: File): void {
    this.selectedMediaFile = file;
    this.mediaFileName = file.name;
    this.actionMessage = '';
    this.readAsDataUrl(file).then((dataUrl) => {
      this.mediaPreviewDataUrl = dataUrl;
    });
  }

  onThumbnailSelected(file: File): void {
    this.selectedThumbnailFile = file;
    this.thumbnailFileName = file.name;
    this.actionMessage = '';
    this.readAsDataUrl(file).then((dataUrl) => {
      this.thumbnailPreviewDataUrl = dataUrl;
    });
  }

  onKeywordsChange(tags: string[]): void {
    this.keywords = tags;
  }

  onCancel(showMessage = true): void {
    this.form.reset({
      title: '',
      description: '',
      text_content: '',
      museum_id: '',
      registration_date: this.today(),
    });
    this.selectedType = 'video';
    this.mediaFileName = '';
    this.thumbnailFileName = '';
    this.selectedMediaFile = null;
    this.selectedThumbnailFile = null;
    this.mediaPreviewDataUrl = null;
    this.thumbnailPreviewDataUrl = null;
    this.keywords = [];
    if (showMessage) {
      this.actionMessage = 'Placeholder: formulário limpo.';
    }
  }

  onPublish(): void {
    if (!this.canPublish) {
      this.form.markAllAsTouched();
      this.actionMessage = 'Revise os campos obrigatórios antes de publicar.';
      return;
    }

    this.isSubmitting = true;
    this.actionMessage = '';

    const payload = {
      title: this.form.controls.title.value.trim(),
      description: this.form.controls.description.value.trim(),
      historical_date: null,
      keywords: this.keywords.length > 0 ? this.keywords : null,
      registration_date: this.form.controls.registration_date.value,
      author_donor: null,
      museum_id: this.form.controls.museum_id.value,
      media_type: this.selectedType,
      file_url: this.buildFileUrl(),
      thumbnail_url: this.buildThumbnailUrl(),
      text_content:
        this.selectedType === 'text' ? this.form.controls.text_content.value.trim() : null,
    };

    this.http.post(`${this.apiUrl}/media`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.onCancel(false);
        this.actionMessage = 'Mídia publicada com sucesso.';
      },
      error: () => {
        this.http.post(`${this.fallbackApiUrl}/media`, payload).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.onCancel(false);
            this.actionMessage = 'Mídia publicada com sucesso.';
          },
          error: () => {
            this.isSubmitting = false;
            this.actionMessage = 'Não foi possível publicar agora.';
          },
        });
      },
    });
  }

  private loadMuseums(): void {
    this.http.get<Array<{ id: string | number; name: string }>>(`${this.apiUrl}/museums`).subscribe({
      next: (museums) => {
        this.museums = museums.map((museum) => ({ value: String(museum.id), label: museum.name }));
      },
      error: () => {
        this.http
          .get<Array<{ id: string | number; name: string }>>(`${this.fallbackApiUrl}/museums`)
          .subscribe({
            next: (museums) => {
              this.museums = museums.map((museum) => ({ value: String(museum.id), label: museum.name }));
            },
            error: () => {
              this.museums = [];
            },
          });
      },
    });
  }

  private buildFileUrl(): string {
    if (this.selectedType === 'text') {
      return `/media/texts/manual-${Date.now()}.txt`;
    }

    if (this.selectedType === 'image' && this.mediaPreviewDataUrl) {
      return this.mediaPreviewDataUrl;
    }

    const fileName = this.selectedMediaFile?.name ?? '';
    const folderByType: Record<'video' | 'audio' | 'image', string> = {
      video: 'videos',
      audio: 'audio',
      image: 'images',
    };

    return fileName ? `/media/${folderByType[this.selectedType]}/${fileName}` : '';
  }

  private buildThumbnailUrl(): string {
    if (this.thumbnailPreviewDataUrl) {
      return this.thumbnailPreviewDataUrl;
    }

    const fileName = this.selectedThumbnailFile?.name ?? '';
    return fileName ? `/media/thumbnails/${fileName}` : '';
  }

  private updateTextContentValidation(): void {
    if (this.selectedType === 'text') {
      this.form.controls.text_content.setValidators([Validators.required]);
    } else {
      this.form.controls.text_content.clearValidators();
      this.form.controls.text_content.setValue('');
    }
    this.form.controls.text_content.updateValueAndValidity();
  }

  private today(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
