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
  // We use this for S3 pre-signed URL PUT uploads because:
  // - It must NOT add Authorization headers
  // - It must NOT rewrite URLs
  // - It must NOT apply API-specific interceptors
  private rawHttp = new HttpClient(this.httpBackend);

  public openFilePicker = signal(false);

  private baseUrl = environment.apiUrl;

  public triggerOpenFilePicker(): void {
    this.openFilePicker.set(true);
  }

  public resetFilePicker(): void {
    this.openFilePicker.set(false);
  }

  // 1) Request a pre-signed URL from our API (Lambda)
  //    The API returns:
  //    - uploadUrl: temporary signed URL for PUT to S3
  //    - fileUrl: the permanent URL where the file will be accessible (or via CloudFront if you later swap)
  public getPresignedUrl(file: File): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(this.baseUrl + 'photos/presign', {
      fileName: file.name,
      contentType: file.type,
    });
  }

  // 2) Upload file bytes directly to S3 using the pre-signed PUT URL
  //    NOTE: This MUST use rawHttp (no interceptors), and typically should set Content-Type.
  //    Some S3 setups require the Content-Type to match what was signed.
  public uploadToS3(uploadUrl: string, file: File): Observable<HttpEvent<unknown>> {
    return this.rawHttp.put<unknown>(uploadUrl, file, {
      reportProgress: true,
      observe: 'events',

      // Important: if you signed ContentType server-side, S3 may require the same header here
      headers: {
        'Content-Type': file.type,
      },
    });
  }

  // 3) Confirm the upload completed and create the DB row
  //    This calls the new endpoint: POST /api/photos/confirm
  //    We only do this AFTER the PUT to S3 succeeds to avoid DB rows for failed uploads.
  public confirmPhoto(fileUrl: string): Observable<Photo> {
    return this.http.post<Photo>(this.baseUrl + 'photos/confirm', {
      url: fileUrl,
    });
  }

  public deletePhoto(photoId: number): Observable<object> {
    return this.http.delete(this.baseUrl + `photos/${photoId}`);
  }

  public setAsMainPhoto(photoId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}photos/${photoId}/set-main`, {});
  }
}
