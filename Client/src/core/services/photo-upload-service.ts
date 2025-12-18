import { HttpBackend, HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { PresignedUrlResponse } from '../../Types/PhotoUpload';

@Injectable({
  providedIn: 'root',
})
export class PhotoUploadService {
  public http = inject(HttpClient);
  private httpBackend = inject(HttpBackend);
  // 👇 Client without interceptors
  private rawHttp = new HttpClient(this.httpBackend);

  public openFilePicker = signal(false);

  private baseUrl = environment.apiUrl;

  public triggerOpenFilePicker(): void {
    this.openFilePicker.set(true);
  }

  public resetFilePicker(): void {
    this.openFilePicker.set(false);
  }

  public getPresignedUrl(file: File): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(this.baseUrl + 'photos/presign', {
      fileName: file.name,
      contentType: file.type,
    });
  }

  public uploadToS3(uploadUrl: string, file: File): Observable<HttpEvent<unknown>> {
    return this.rawHttp.put<unknown>(uploadUrl, file, {
      reportProgress: true,
      observe: 'events',
    });
  }
}
