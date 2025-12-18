import { Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Observable } from 'rxjs';
import { Photo } from '../../../Types/Member';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { PhotoUploadService } from '../../../core/services/photo-upload-service';

@Component({
  selector: 'app-member-photos',
  imports: [AsyncPipe],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos {
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  public photos$?: Observable<Photo[]>;

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

    const file = input.files[0];
    console.log('Selected file:', file);

    // upload logic here
  }
}
