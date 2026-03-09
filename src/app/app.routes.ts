import { Routes } from '@angular/router';
import { Librarylist } from './domain/library/library/librarylist';
import { UploadPage } from './domain/library/upload/upload.page';

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
  },
  {
    path: 'upload/:id',
    component: UploadPage,
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
