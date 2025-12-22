import { HttpBackend, HttpClient, HttpEvent } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { PresignedUrlResponse } from '../../Types/PhotoUpload';
import { Photo } from '../../Types/Member';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
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

  public savePhoto(fileUrl: string): Observable<Photo> {
    return this.http.post<Photo>(this.baseUrl + 'photos', {
      url: fileUrl,
    });
  }

  public deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + `photos/${photoId}`);
  }
}
