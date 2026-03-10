import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FilterComponent } from '../../../../shared/components/filter.component/filter.component';
import { MediaCardComponent } from '../../../../shared/components/media-card.component/media-card.component';
import { FilterChange } from '../../../../shared/models/FilterChange';
import { FilterOption } from '../../../../shared/models/FilterOption';
import { MediaRecord } from '../../../../shared/models/MediaRecord';

interface Museum {
  id: string | number;
  name: string;
}

@Component({
  selector: 'app-librarylist',
  imports: [FilterComponent, MediaCardComponent],
  templateUrl: './librarylist.html',
  styleUrl: './librarylist.scss',
})
export class Librarylist implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = '/api';
  private readonly fallbackApiUrl = 'http://localhost:3000';
  private currentFilter: FilterChange = { search: '', mediaType: '', museumId: '' };

  museumOptions: FilterOption[] = [];
  mediaTypes: FilterOption[] = [
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'image', label: 'Imagem' },
    { value: 'text', label: 'Texto' },
  ];

  mediaList: MediaRecord[] = [];
  filteredMedia: MediaRecord[] = [];
  placeholderMessage = '';

  get collectionCounterLabel(): string {
    const total = this.filteredMedia.length;
    if (total === 1) {
      return '1 mídia encontrada';
    }
    return `${total} mídias encontradas`;
  }

  ngOnInit(): void {
    this.loadMuseums();
    this.loadMedia();
  }

  onFilterChange(filter: FilterChange): void {
    this.currentFilter = filter;
    this.applyFilters();
  }

  getMuseumName(museumId: string | number): string {
    return this.museumOptions.find((museum) => museum.value === String(museumId))?.label ?? String(museumId);
  }

  onViewMedia(mediaId: string | number): void {
    void this.router.navigate(['/upload', mediaId]);
  }

  onDeleteMedia(mediaId: string | number): void {
    this.placeholderMessage = `Placeholder: exclusao do item ${mediaId} ainda nao foi implementada.`;
  }

  clearPlaceholder(): void {
    this.placeholderMessage = '';
  }

  private loadMuseums(): void {
    this.http.get<Museum[]>(`${this.apiUrl}/museums`).subscribe({
      next: (museums) => {
        this.museumOptions = this.mapMuseums(museums);
        this.applyFilters();
      },
      error: () => {
        this.http.get<Museum[]>(`${this.fallbackApiUrl}/museums`).subscribe({
          next: (museums) => {
            this.museumOptions = this.mapMuseums(museums);
            this.applyFilters();
          },
          error: () => {
            this.museumOptions = [];
          },
        });
      },
    });
  }

  private loadMedia(): void {
    this.http.get<MediaRecord[]>(`${this.apiUrl}/media`).subscribe({
      next: (media) => {
        this.mediaList = media;
        this.applyFilters();
      },
      error: () => {
        this.http.get<MediaRecord[]>(`${this.fallbackApiUrl}/media`).subscribe({
          next: (media) => {
            this.mediaList = media;
            this.applyFilters();
          },
          error: () => {
            this.mediaList = [];
            this.filteredMedia = [];
          },
        });
      },
    });
  }

  private applyFilters(): void {
    const term = this.currentFilter.search.toLowerCase();

    this.filteredMedia = this.mediaList.filter((item) => {
      const keywords = item.keywords ?? [];
      const matchesSearch =
        term.length === 0 ||
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        keywords.some((keyword) => keyword.toLowerCase().includes(term));
      const matchesType = !this.currentFilter.mediaType || item.media_type === this.currentFilter.mediaType;
      const matchesMuseum =
        !this.currentFilter.museumId || String(item.museum_id) === this.currentFilter.museumId;
      return matchesSearch && matchesType && matchesMuseum;
    });
  }

  private mapMuseums(museums: Museum[]): FilterOption[] {
    return museums.map((museum) => ({
      value: String(museum.id),
      label: museum.name,
    }));
  }
}
