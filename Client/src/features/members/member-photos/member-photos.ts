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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-member-photos',
  imports: [MatProgressBarModule, MatIconModule, MatButtonModule],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos {
  public photos = signal<Photo[]>([]);
  public isUploading = signal(false);
  public uploadProgress = signal<number | null>(null);

  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private uploadService: PhotoUploadService) {
    const memberId = this.memberService.member()?.id;
    if (memberId) {
      this.memberService.getMemberPhotos(memberId).subscribe({
        next: (photos) => this.photos.set(photos),
      });
    }

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

  public onDeletePhoto(photo: Photo): void {
    console.log('Deleting photo:', photo);
    const confirmed = confirm('Delete this photo?');

    if (!confirmed) return;

    // 🔥 Optimistic UI update
    this.photos.update((current) => current.filter((p) => p.id !== photo.id));

    this.uploadService.deletePhoto(photo.id).subscribe({
      next: () => {
        console.log('Photo deleted successfully');
      },
      error: (err) => {
        console.error('Failed to delete photo', err);
        // rollback if delete fails
        this.photos.update((current) => [...current, photo]);
      },
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);

    this.uploadMultipleFiles(files);

    // reset input so same file can be selected again later
    input.value = '';
  }

  private uploadMultipleFiles(files: File[]): void {
    this.isUploading.set(true);

    let completed = 0;
    const total = files.length;

    files.forEach((file) => {
      this.uploadService.getPresignedUrl(file).subscribe({
        next: (response) => {
          this.uploadToS3(response, file, () => {
            completed++;
            this.uploadProgress.set(Math.round((completed / total) * 100));

            if (completed === total) {
              this.resetUploadState();
            }
          });
        },
        error: () => {
          console.error('Failed to get presigned URL');
          completed++;
        },
      });
    });
  }

  private uploadToS3(response: PresignedUrlResponse, file: File, onComplete: () => void): void {
    this.uploadService.uploadToS3(response.uploadUrl, file).subscribe({
      next: (event: HttpEvent<unknown>) => {
        if (event.type === HttpEventType.Response) {
          this.onUploadComplete(response.fileUrl, onComplete);
        }
      },
      error: (error) => {
        console.error('Upload to S3 failed:', error);
        onComplete();
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

  private onUploadComplete(fileUrl: string, onComplete: () => void): void {
    this.uploadService.savePhoto(fileUrl).subscribe({
      next: () => {
        const memberId = this.memberService.member()?.id;
        if (memberId) {
          this.memberService.getMemberPhotos(memberId).subscribe({
            next: (photos) => this.photos.set(photos),
          });
        }
      },
      error: (error) => {
        console.error('Failed to save photo to DB:', error);
        onComplete();
      },
    });
  }

  private resetUploadState(): void {
    this.isUploading.set(false);
    this.uploadProgress.set(null);
  }
}
