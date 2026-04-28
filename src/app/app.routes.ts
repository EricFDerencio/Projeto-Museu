import { Routes } from '@angular/router';
import { Librarylist } from './domain/library/pages/list/librarylist';
import { UploadPage } from './domain/media/pages/upload/upload.page';
import { uploadAccessGuard } from './core/guards/upload-access.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'library',
  },
  {
    path: 'library',
    component: Librarylist,
  },
  {
    path: 'upload',
    component: UploadPage,
    canActivate: [uploadAccessGuard],
  },
  {
    path: 'upload/:id',
    component: UploadPage,
    canActivate: [uploadAccessGuard],
  },
  {
    path: 'library/upload',
    redirectTo: 'upload',
    pathMatch: 'full',
  },
  {
    path: 'library/upload/:id',
    redirectTo: 'upload/:id',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'library',
  },
];
