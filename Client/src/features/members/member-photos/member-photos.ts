import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Observable } from 'rxjs';
import { Photo } from '../../../Types/Member';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { PhotoUploadService } from '../../../core/services/photo-upload-service';
import { HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { PresignedUrlResponse } from '../../../Types/PhotoUpload';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-member-photos',
  imports: [AsyncPipe, MatProgressBarModule],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos {
  public photos$?: Observable<Photo[]>;
  public isUploading = signal(false);
  public uploadProgress = signal<number | null>(null);

  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private uploadService: PhotoUploadService) {
    const memberId = this.memberService.member()?.id;
    this.photos$ = memberId ? this.memberService.getMemberPhotos(memberId) : undefined;

    // This runs whenevber a signal changes
    // The parent component (member-detailed) triggers the signal openFilePicker to true
    // The child component (member-photos) listens for that change and opens the fileInput
    // Run this function once now, and then re-run it every time any signal inside it changes.
    effect(() => {
      if (this.uploadService.openFilePicker()) {
        this.fileInput.nativeElement.click();
        this.uploadService.resetFilePicker();
      }
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file: File = input.files[0];
    console.log('Selected file:', file);

    this.uploadFile(file);
  }

  private uploadFile(file: File): void {
    this.isUploading.set(true);

    this.uploadService.getPresignedUrl(file).subscribe({
      next: (response: PresignedUrlResponse) => {
        this.uploadToS3(response, file);
        console.log('Presigned URL response:', response);
      },
      error: () => this.resetUploadState(),
    });
  }

  private uploadToS3(response: PresignedUrlResponse, file: File): void {
    this.uploadService.uploadToS3(response.uploadUrl, file).subscribe({
      next: (event: HttpEvent<unknown>) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.updateProgress(event);
        }

        if (event.type === HttpEventType.Response) {
          this.onUploadComplete(response.fileUrl);
        }
      },
      error: (error) => {
        console.error('Upload to S3 failed:', error);
        this.resetUploadState();
      },
    });
  }

  private updateProgress(event: HttpEvent<unknown>): void {
    if (event.type !== HttpEventType.UploadProgress) {
      return;
    }

    const progressEvent = event as HttpProgressEvent;

    if (progressEvent.total == null) {
      return;
    }

    const percent: number = Math.round((progressEvent.loaded / progressEvent.total) * 100);

    this.uploadProgress.set(percent);
  }

  private onUploadComplete(fileUrl: string): void {
    this.uploadService.savePhoto(fileUrl).subscribe({
      next: () => {
        this.resetUploadState();

        // 🔄 Refresh photos after successful save
        const memberId = this.memberService.member()?.id;
        if (memberId) {
          this.photos$ = this.memberService.getMemberPhotos(memberId);
        }
      },
      error: (error) => {
        console.error('Failed to save photo to DB:', error);
        this.resetUploadState();
      },
    });
  }

  private resetUploadState(): void {
    this.isUploading.set(false);
    this.uploadProgress.set(null);
  }
}
