import { Injectable } from '@angular/core';
import { MediaType } from '../../../shared/models/MediaType';

@Injectable({ providedIn: 'root' })
export class MediaFileUrlService {
  buildFileUrl(selectedType: MediaType, selectedMediaFile: File | null, existingFileUrl: string): string {
    if (selectedType === 'text') {
      return existingFileUrl || `/media/texts/manual-${Date.now()}.txt`;
    }

    const fileName = selectedMediaFile?.name ?? '';
    const folderByType: Record<'video' | 'audio' | 'image', string> = {
      video: 'videos',
      audio: 'audio',
      image: 'images',
    };

    if (fileName) {
      return `/media/${folderByType[selectedType]}/${fileName}`;
    }

    return existingFileUrl;
  }

  extractFileName(path: string): string {
    if (!path || path.startsWith('data:')) {
      return '';
    }

    const segments = path.split('/');
    return segments[segments.length - 1] ?? '';
  }
}
