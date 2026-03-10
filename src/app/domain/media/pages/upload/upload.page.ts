import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadFormFactory } from '../../forms/upload-form.factory';
import { UploadEditorState } from '../../forms/upload-form.types';
import { MediaUploadMapper } from '../../mappers/media-upload.mapper';
import { MediaService } from '../../services/media.service';
import { FileDropzoneComponent } from '../../../../shared/components/file-dropzone.component/file-dropzone.component';
import { MediaTypeSelectorComponent } from '../../../../shared/components/media-type-selector.component/media-type-selector.component';
import { TagInputComponent } from '../../../../shared/components/tag-input.component/tag-input.component';
import { UploadActionsComponent } from '../../../../shared/components/upload-actions.component/upload-actions.component';
import { FilterOption } from '../../../../shared/models/FilterOption';
import { MediaType } from '../../../../shared/models/MediaType';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formFactory = inject(UploadFormFactory);
  private readonly mediaService = inject(MediaService);
  private readonly mediaMapper = inject(MediaUploadMapper);

  selectedType: MediaType = 'video';
  mediaFileName = '';
  thumbnailFileName = '';
  keywords: string[] = [];
  museums: FilterOption[] = [];
  isSubmitting = false;
  actionMessage = '';
  selectedMediaFile: File | null = null;
  selectedThumbnailFile: File | null = null;
  editorState: UploadEditorState | null = null;

  readonly form = this.formFactory.create();

  get isEditMode(): boolean {
    return !!this.editorState;
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Atualizar mídia' : 'Publicar mídia';
  }

  get showMediaFileDropzone(): boolean {
    return this.selectedType !== 'text';
  }

  get canPublish(): boolean {
    const hasExistingFile = !!this.editorState?.existingFileUrl;
    const hasRequiredMediaFile = this.showMediaFileDropzone
      ? !!this.selectedMediaFile || hasExistingFile
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

    if (this.editorState) {
      this.editorState = { ...this.editorState, existingFileUrl: '' };
    }

    this.updateTextContentValidation();
  }

  onMediaFileSelected(file: File): void {
    this.selectedMediaFile = file;
    this.mediaFileName = file.name;

    if (this.editorState) {
      this.editorState = { ...this.editorState, existingFileUrl: '' };
    }

    this.actionMessage = '';
  }

  onThumbnailSelected(file: File): void {
    this.selectedThumbnailFile = file;
    this.thumbnailFileName = file.name;

    if (this.editorState) {
      this.editorState = { ...this.editorState, existingThumbnailUrl: '' };
    }

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

    this.form.reset(this.formFactory.defaultValues());
    this.selectedType = 'video';
    this.mediaFileName = '';
    this.thumbnailFileName = '';
    this.selectedMediaFile = null;
    this.selectedThumbnailFile = null;
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

    const registrationDate = this.editorState?.registrationDate ?? this.today();
    const payload = this.mediaMapper.toPayload(this.form.getRawValue(), {
      selectedType: this.selectedType,
      keywords: this.keywords,
      selectedMediaFile: this.selectedMediaFile,
      selectedThumbnailFile: this.selectedThumbnailFile,
      existingFileUrl: this.editorState?.existingFileUrl ?? '',
      existingThumbnailUrl: this.editorState?.existingThumbnailUrl ?? '',
      registrationDate,
    });

    if (this.editorState?.mediaId) {
      this.mediaService
        .updateMedia(this.editorState.mediaId, { ...payload, id: this.editorState.mediaId })
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.actionMessage = 'Mídia atualizada com sucesso.';
          },
          error: () => {
            this.isSubmitting = false;
            this.actionMessage = 'Não foi possível atualizar agora.';
          },
        });
      return;
    }

    this.mediaService.createMedia(payload).subscribe({
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
  }

  private initEditMode(): void {
    const mediaId = this.route.snapshot.paramMap.get('id');
    if (!mediaId) {
      return;
    }

    this.mediaService.getMediaById(mediaId).subscribe({
      next: (media) => {
        this.editorState = this.mediaMapper.toEditorState(media);
        this.selectedType = this.editorState.selectedType;
        this.keywords = [...this.editorState.keywords];
        this.mediaFileName = this.editorState.mediaFileName;
        this.thumbnailFileName = this.editorState.thumbnailFileName;
        this.form.patchValue(this.mediaMapper.toFormValue(media));
        this.updateTextContentValidation();
      },
      error: () => {
        this.actionMessage = 'Não foi possível carregar a mídia para edição.';
      },
    });
  }

  private loadMuseums(): void {
    this.mediaService.getMuseums().subscribe({
      next: (museums) => {
        this.museums = museums.map((museum) => ({ value: String(museum.id), label: museum.name }));
      },
      error: () => {
        this.museums = [];
      },
    });
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
}
