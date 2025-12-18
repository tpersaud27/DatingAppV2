import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PhotoUploadService {
  public openFilePicker = signal(false);

  public triggerOpenFilePicker(): void {
    this.openFilePicker.set(true);
  }

  public resetFilePicker(): void {
    this.openFilePicker.set(false);
  }
}
