import { Injectable } from '@angular/core';
import { MediaType } from '../../../shared/models/MediaType';

interface ThumbnailContext {
  selectedType: MediaType;
  title: string;
  selectedMediaFile: File | null;
  selectedThumbnailFile: File | null;
  existingFileUrl: string;
  existingThumbnailUrl: string;
}

@Injectable({ providedIn: 'root' })
export class MediaThumbnailService {
  buildThumbnailUrl(ctx: ThumbnailContext): string {
    const thumbnailFileName = ctx.selectedThumbnailFile?.name ?? '';
    if (thumbnailFileName) {
      return `/media/thumbnails/${thumbnailFileName}`;
    }

    if (ctx.existingThumbnailUrl) {
      return ctx.existingThumbnailUrl;
    }

    const mediaFileName = ctx.selectedMediaFile?.name ?? '';
    if (ctx.selectedType === 'image' && mediaFileName) {
      return `/media/images/${mediaFileName}`;
    }

    if (ctx.selectedType === 'image' && ctx.existingFileUrl.startsWith('/media/images/')) {
      return ctx.existingFileUrl;
    }

    return this.generateThumbnailPlaceholderDataUrl(ctx.title);
  }

  private generateThumbnailPlaceholderDataUrl(title: string): string {
    const letter = (title.trim()[0] ?? 'M').toUpperCase();
    const hue = Math.floor(Math.random() * 360);
    const background = `hsl(${hue}, 70%, 55%)`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="${background}"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="220" fill="#ffffff">${letter}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
