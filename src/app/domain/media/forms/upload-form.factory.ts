import { Injectable, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class UploadFormFactory {
  private readonly fb = inject(FormBuilder);

  create() {
    return this.fb.nonNullable.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      text_content: [''],
      historical_date: [''],
      author_donor: [''],
      museum_id: ['', [Validators.required]],
    });
  }

  defaultValues() {
    return {
      title: '',
      description: '',
      text_content: '',
      historical_date: '',
      author_donor: '',
      museum_id: '',
    };
  }
}
