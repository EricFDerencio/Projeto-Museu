import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

const UPLOAD_ACCESS_PASSWORD = '124';
const UPLOAD_ACCESS_SESSION_KEY = 'upload-access-granted';

export const uploadAccessGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);

  if (typeof window === 'undefined') {
    return true;
  }

  if (window.sessionStorage.getItem(UPLOAD_ACCESS_SESSION_KEY) === 'true') {
    return true;
  }

  const providedPassword = window.prompt('Digite a senha para acessar a tela de insercao:');

  if (providedPassword === UPLOAD_ACCESS_PASSWORD) {
    window.sessionStorage.setItem(UPLOAD_ACCESS_SESSION_KEY, 'true');
    return true;
  }

  window.alert('Senha incorreta.');
  return router.createUrlTree(['/library']);
};
