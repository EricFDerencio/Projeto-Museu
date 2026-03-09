import { MediaRecord } from '../../../shared/models/MediaRecord';
import { MediaType } from '../../../shared/models/MediaType';

export interface UploadFormValue {
  title: string;
  description: string;
  text_content: string;
  historical_date: string;
  author_donor: string;
  museum_id: string;
}

export interface UploadEditorState {
  mediaId: string;
  selectedType: MediaType;
  keywords: string[];
  registrationDate: string;
  existingFileUrl: string;
  existingThumbnailUrl: string;
  mediaFileName: string;
  thumbnailFileName: string;
}

export type UploadMediaPayload = Omit<MediaRecord, 'id'>;
