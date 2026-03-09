import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileDropzoneComponent } from '../../../shared/components/file-dropzone.component/file-dropzone.component';
import { MediaTypeSelectorComponent } from '../../../shared/components/media-type-selector.component/media-type-selector.component';
import { TagInputComponent } from '../../../shared/components/tag-input.component/tag-input.component';
import { UploadActionsComponent } from '../../../shared/components/upload-actions.component/upload-actions.component';
import { FilterOption } from '../../../shared/models/FilterOption';
import { MediaRecord } from '../../../shared/models/MediaRecord';
import { MediaType } from '../../../shared/models/MediaType';

type MediaPayload = Omit<MediaRecord, 'id'>;

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
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
  editingMediaId: string | null = null;
  originalRegistrationDate = '';
  existingFileUrl = '';
  existingThumbnailUrl = '';

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    text_content: [''],
    historical_date: [''],
    author_donor: [''],
    museum_id: ['', [Validators.required]],
  });

  get isEditMode(): boolean {
    return !!this.editingMediaId;
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Atualizar mídia' : 'Publicar mídia';
  }

  get showMediaFileDropzone(): boolean {
    return this.selectedType !== 'text';
  }

  get canPublish(): boolean {
    const hasRequiredMediaFile = this.showMediaFileDropzone
      ? !!this.selectedMediaFile || !!this.existingFileUrl
      : true;
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
    this.initEditMode();
  }

  onTypeChange(type: MediaType): void {
    this.selectedType = type;
    this.mediaFileName = '';
    this.selectedMediaFile = null;
    this.existingFileUrl = '';
    this.updateTextContentValidation();
  }

  onMediaFileSelected(file: File): void {
    this.selectedMediaFile = file;
    this.mediaFileName = file.name;
    this.existingFileUrl = '';
    this.actionMessage = '';
  }

  onThumbnailSelected(file: File): void {
    this.selectedThumbnailFile = file;
    this.thumbnailFileName = file.name;
    this.existingThumbnailUrl = '';
    this.actionMessage = '';
  }

  onKeywordsChange(tags: string[]): void {
    this.keywords = tags;
  }

  onCancel(showMessage = true): void {
    if (this.isEditMode) {
      void this.router.navigate(['/library']);
      return;
    }

    this.form.reset({
      title: '',
      description: '',
      text_content: '',
      historical_date: '',
      author_donor: '',
      museum_id: '',
    });
    this.selectedType = 'video';
    this.mediaFileName = '';
    this.thumbnailFileName = '';
    this.selectedMediaFile = null;
    this.selectedThumbnailFile = null;
    this.existingFileUrl = '';
    this.existingThumbnailUrl = '';
    this.keywords = [];
    if (showMessage) {
      this.actionMessage = 'Formulário limpo.';
    }
  }

  onPublish(): void {
    if (!this.canPublish) {
      this.form.markAllAsTouched();
      this.actionMessage = 'Revise os campos obrigatórios antes de salvar.';
      return;
    }

    this.isSubmitting = true;
    this.actionMessage = '';

    const registrationDate = this.isEditMode ? this.originalRegistrationDate : this.today();
    const payload: MediaPayload = {
      title: this.form.controls.title.value.trim(),
      description: this.form.controls.description.value.trim(),
      historical_date: this.form.controls.historical_date.value || null,
      keywords: this.keywords.length > 0 ? this.keywords : null,
      registration_date: registrationDate,
      author_donor: this.form.controls.author_donor.value.trim() || null,
      museum_id: this.form.controls.museum_id.value,
      media_type: this.selectedType,
      file_url: this.buildFileUrl(),
      thumbnail_url: this.buildThumbnailUrl(),
      text_content: this.selectedType === 'text' ? this.form.controls.text_content.value.trim() : null,
    };

    if (this.isEditMode && this.editingMediaId) {
      this.updateMedia(this.editingMediaId, { ...payload, id: this.editingMediaId });
      return;
    }

    this.createMedia(payload);
  }

  private initEditMode(): void {
    const mediaId = this.route.snapshot.paramMap.get('id');
    if (!mediaId) {
      return;
    }

    this.editingMediaId = mediaId;
    this.loadMediaById(mediaId);
  }

  private loadMediaById(mediaId: string): void {
    this.http.get<MediaRecord>(`${this.apiUrl}/media/${mediaId}`).subscribe({
      next: (media) => {
        this.applyMediaToForm(media);
      },
      error: () => {
        this.http.get<MediaRecord>(`${this.fallbackApiUrl}/media/${mediaId}`).subscribe({
          next: (media) => {
            this.applyMediaToForm(media);
          },
          error: () => {
            this.actionMessage = 'Não foi possível carregar a mídia para edição.';
          },
        });
      },
    });
  }

  private applyMediaToForm(media: MediaRecord): void {
    this.selectedType = media.media_type;
    this.keywords = media.keywords ?? [];
    this.originalRegistrationDate = media.registration_date;
    this.existingFileUrl = media.file_url;
    this.existingThumbnailUrl = media.thumbnail_url ?? '';
    this.mediaFileName = this.extractFileName(media.file_url);
    this.thumbnailFileName = this.extractFileName(media.thumbnail_url ?? '');

    this.form.patchValue({
      title: media.title,
      description: media.description,
      text_content: media.text_content ?? '',
      historical_date: media.historical_date ?? '',
      author_donor: media.author_donor ?? '',
      museum_id: String(media.museum_id),
    });

    this.updateTextContentValidation();
  }

  private createMedia(payload: MediaPayload): void {
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

  private updateMedia(mediaId: string, payload: MediaRecord): void {
    this.http.put(`${this.apiUrl}/media/${mediaId}`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.actionMessage = 'Mídia atualizada com sucesso.';
      },
      error: () => {
        this.http.put(`${this.fallbackApiUrl}/media/${mediaId}`, payload).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.actionMessage = 'Mídia atualizada com sucesso.';
          },
          error: () => {
            this.isSubmitting = false;
            this.actionMessage = 'Não foi possível atualizar agora.';
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
      return this.existingFileUrl || `/media/texts/manual-${Date.now()}.txt`;
    }

    const fileName = this.selectedMediaFile?.name ?? '';
    const folderByType: Record<'video' | 'audio' | 'image', string> = {
      video: 'videos',
      audio: 'audio',
      image: 'images',
    };

    if (fileName) {
      return `/media/${folderByType[this.selectedType]}/${fileName}`;
    }

    return this.existingFileUrl;
  }

  private buildThumbnailUrl(): string {
    const fileName = this.selectedThumbnailFile?.name ?? '';
    if (fileName) {
      return `/media/thumbnails/${fileName}`;
    }

    if (this.existingThumbnailUrl) {
      return this.existingThumbnailUrl;
    }

    const mediaFileName = this.selectedMediaFile?.name ?? '';
    if (this.selectedType === 'image' && mediaFileName) {
      return `/media/images/${mediaFileName}`;
    }

    if (this.selectedType === 'image' && this.existingFileUrl.startsWith('/media/images/')) {
      return this.existingFileUrl;
    }

    return this.generateThumbnailPlaceholderDataUrl();
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

  private extractFileName(path: string): string {
    if (!path || path.startsWith('data:')) {
      return '';
    }

    const segments = path.split('/');
    return segments[segments.length - 1] ?? '';
  }

  private generateThumbnailPlaceholderDataUrl(): string {
    const title = this.form.controls.title.value.trim();
    const letter = (title[0] ?? 'M').toUpperCase();
    const hue = Math.floor(Math.random() * 360);
    const background = `hsl(${hue}, 70%, 55%)`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="${background}"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="220" fill="#ffffff">${letter}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
