import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { MediaRecord } from '../../../shared/models/MediaRecord';
import { UploadMediaPayload } from '../forms/upload-form.types';

export interface MuseumOptionDto {
  id: string | number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';
  private readonly fallbackApiUrl = 'http://localhost:3000';

  getMuseums(): Observable<MuseumOptionDto[]> {
    return this.http.get<MuseumOptionDto[]>(`${this.apiUrl}/museums`).pipe(
      catchError(() => this.http.get<MuseumOptionDto[]>(`${this.fallbackApiUrl}/museums`)),
    );
  }

  getMediaById(mediaId: string): Observable<MediaRecord> {
    return this.http.get<MediaRecord>(`${this.apiUrl}/media/${mediaId}`).pipe(
      catchError(() => this.http.get<MediaRecord>(`${this.fallbackApiUrl}/media/${mediaId}`)),
    );
  }

  createMedia(payload: UploadMediaPayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/media`, payload).pipe(
      catchError(() => this.http.post(`${this.fallbackApiUrl}/media`, payload)),
    );
  }

  updateMedia(mediaId: string, payload: MediaRecord): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/media/${mediaId}`, payload).pipe(
      catchError(() => this.http.put(`${this.fallbackApiUrl}/media/${mediaId}`, payload)),
    );
  }
}
