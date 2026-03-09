import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterOption } from '../../models/FilterOption';
import { FilterChange } from '../../models/FilterChange';

@Component({
  selector: 'app-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent {
  @Input() mediaTypes: FilterOption[] = [
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'image', label: 'Imagem' },
    { value: 'text', label: 'Texto' },
  ];
  @Input() museums: FilterOption[] = [];
  @Output() filterChange = new EventEmitter<FilterChange>();

  search = '';
  mediaType = '';
  museumId = '';

  onFilterChange(): void {
    this.filterChange.emit({
      search: this.search.trim(),
      mediaType: this.mediaType,
      museumId: this.museumId,
    });
  }
}
