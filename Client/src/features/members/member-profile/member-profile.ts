import {
  Component,
  inject,
  signal,
  OnInit,
  ViewChild,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditableMemberFields, Member } from '../../../Types/Member';
import { MemberService } from '../../../core/services/member-service';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { SnackBar } from '../../../core/services/snack-bar-service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-member-profile',
  imports: [
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatFormFieldModule,
  ],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit, OnDestroy {
  @ViewChild('editForm') editForm?: NgForm;
  @HostListener('window:beforeunload', ['$event']) notify($event: BeforeUnloadEvent) {
    if (this.editForm?.dirty) {
      $event.preventDefault();
    }
  }
  public member = signal<Member | undefined>(undefined);
  public memberService = inject(MemberService);
  public snackBarService = inject(SnackBar);
  public editableMemberFields: EditableMemberFields = {
    displayName: '',
    description: '',
    city: '',
    country: '',
  };

  private route = inject(ActivatedRoute);

  constructor() {}

  public ngOnInit(): void {
    // Getting access to our member
    this.route.parent?.data.subscribe((data) => {
      this.member.set(data['member']);
    });

    this.editableMemberFields = {
      displayName: this.member()?.displayName || '',
      description: this.member()?.description || '',
      city: this.member()?.city || '',
      country: this.member()?.country || '',
    };
  }

  public ngOnDestroy(): void {
    // When user navigates away from profile component and edit mode is enabled we should toggle it to false
    // This will occur when the component is destroyed
    if (this.memberService.editMode()) {
      this.memberService.editMode.set(false);
    }
  }

  public onUpdateProfile(): void {
    if (!this.member()) {
      return;
    }

    const updatedMember = { ...this.member(), ...this.editableMemberFields };

    console.log('updatedMember ', updatedMember);
    this.snackBarService.openGenericSuccessSnackBar('User Profile Updated');
    // Toggle edit mode back to false
    this.memberService.editMode.set(false);

    console.log('Form Status ', this.editForm);
  }
}
