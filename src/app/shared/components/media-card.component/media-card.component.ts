import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MediaRecord } from '../../models/MediaRecord';

@Component({
  selector: 'app-media-card',
  imports: [CommonModule],
  templateUrl: './media-card.component.html',
  styleUrl: './media-card.component.scss',
})
export class MediaCardComponent implements OnChanges {
  @Input({ required: true }) item!: MediaRecord;
  @Input() editMode = false;

  @Output() view = new EventEmitter<string | number>();
  @Output() remove = new EventEmitter<string | number>();

  isPlaceholderModalOpen = false;
  currentCoverUrl = '';
  placeholderColor = '#dbeafe';
  private resolveRequestId = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item']) {
      void this.setupCoverUrls();
    }
  }

  onCardClick(): void {
    if (!this.editMode) {
      this.openPlaceholderModal();
    }
  }

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.openPlaceholderModal();
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.item.id);
  }

  closePlaceholderModal(): void {
    this.isPlaceholderModalOpen = false;
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closePlaceholderModal();
    }
  }

  onImageError(): void {
    this.currentCoverUrl = '';
  }

  get coverUrl(): string {
    return this.currentCoverUrl;
  }

  private openPlaceholderModal(): void {
    this.view.emit(this.item.id);
    this.isPlaceholderModalOpen = true;
  }

  private async setupCoverUrls(): Promise<void> {
    const requestId = ++this.resolveRequestId;
    this.placeholderColor = this.generatePlaceholderColor();
    const primary = this.item.thumbnail_url || (this.item.media_type === 'image' ? this.item.file_url : '');
    const fallbackFromThumbnail = this.item.thumbnail_url?.replace('/media/thumbnails/', '/media/images/') || '';
    const fallback = fallbackFromThumbnail || (this.item.media_type === 'image' ? this.item.file_url : '');
    const candidates = [primary, fallback].filter((value, index, arr) => !!value && arr.indexOf(value) === index);

    for (const candidate of candidates) {
      const exists = await this.urlExists(candidate);
      if (requestId !== this.resolveRequestId) {
        return;
      }
      if (exists) {
        this.currentCoverUrl = candidate;
        return;
      }
    }

    if (requestId === this.resolveRequestId) {
      this.currentCoverUrl = '';
    }
  }

  private async urlExists(url: string): Promise<boolean> {
    if (!url) {
      return false;
    }
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return true;
    }

    try {
      const headResponse = await fetch(url, { method: 'HEAD' });
      if (headResponse.ok) {
        return true;
      }

      if (headResponse.status === 405) {
        const getResponse = await fetch(url, { method: 'GET' });
        return getResponse.ok;
      }
      return false;
    } catch {
      return false;
    }
  }

  private generatePlaceholderColor(): string {
    const seed = `${this.item.id}-${this.item.title}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 75%)`;
  }
}
