import { Injectable } from '@angular/core';
import { MediaRecord } from '../../../shared/models/MediaRecord';
import { MediaType } from '../../../shared/models/MediaType';
import { MediaFileUrlService } from '../services/media-file-url.service';
import { MediaThumbnailService } from '../services/media-thumbnail.service';
import { UploadEditorState, UploadFormValue, UploadMediaPayload } from '../forms/upload-form.types';

interface BuildPayloadContext {
  selectedType: MediaType;
  keywords: string[];
  selectedMediaFile: File | null;
  selectedThumbnailFile: File | null;
  existingFileUrl: string;
  existingThumbnailUrl: string;
  registrationDate: string;
}

@Injectable({ providedIn: 'root' })
export class MediaUploadMapper {
  constructor(
    private readonly fileUrlService: MediaFileUrlService,
    private readonly thumbnailService: MediaThumbnailService,
  ) {}

  toFormValue(media: MediaRecord): UploadFormValue {
    return {
      title: media.title,
      description: media.description,
      text_content: media.text_content ?? '',
      historical_date: media.historical_date ?? '',
      author_donor: media.author_donor ?? '',
      museum_id: String(media.museum_id),
    };
  }

  toEditorState(media: MediaRecord): UploadEditorState {
    return {
      mediaId: String(media.id),
      selectedType: media.media_type,
      keywords: media.keywords ?? [],
      registrationDate: media.registration_date,
      existingFileUrl: media.file_url,
      existingThumbnailUrl: media.thumbnail_url ?? '',
      mediaFileName: this.fileUrlService.extractFileName(media.file_url),
      thumbnailFileName: this.fileUrlService.extractFileName(media.thumbnail_url ?? ''),
    };
  }

  toPayload(formValue: UploadFormValue, ctx: BuildPayloadContext): UploadMediaPayload {
    return {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      historical_date: formValue.historical_date || null,
      keywords: ctx.keywords.length > 0 ? ctx.keywords : null,
      registration_date: ctx.registrationDate,
      author_donor: formValue.author_donor.trim() || null,
      museum_id: formValue.museum_id,
      media_type: ctx.selectedType,
      file_url: this.fileUrlService.buildFileUrl(ctx.selectedType, ctx.selectedMediaFile, ctx.existingFileUrl),
      thumbnail_url: this.thumbnailService.buildThumbnailUrl({
        selectedType: ctx.selectedType,
        title: formValue.title,
        selectedMediaFile: ctx.selectedMediaFile,
        selectedThumbnailFile: ctx.selectedThumbnailFile,
        existingFileUrl: ctx.existingFileUrl,
        existingThumbnailUrl: ctx.existingThumbnailUrl,
      }),
      text_content: ctx.selectedType === 'text' ? formValue.text_content.trim() : null,
    };
  }
}
