import { Component, inject, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
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
import { AccountService } from '../../../core/services/account-service';

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
  public memberService = inject(MemberService);
  public snackBarService = inject(SnackBar);
  public editableMemberFields: EditableMemberFields = {
    displayName: '',
    description: '',
    city: '',
    country: '',
  };

  private accountService = inject(AccountService);

  public ngOnInit(): void {
    this.editableMemberFields = {
      displayName: this.memberService.member()?.displayName || '',
      description: this.memberService.member()?.description || '',
      city: this.memberService.member()?.city || '',
      country: this.memberService.member()?.country || '',
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
    if (!this.memberService.member()) {
      return;
    }

    const updatedMember = { ...this.memberService.member(), ...this.editableMemberFields };
    this.memberService.updateMemberDetails(this.editableMemberFields).subscribe({
      next: () => {
        // Update the member with the new details
        this.memberService.member.set(updatedMember as Member);
        // Reset the form with the new updatedMember
        // This resets our dirty flag back to false
        this.editForm?.reset(updatedMember);
        // Updating the currentUser object so the displayName is updated also
        const currentUser = this.accountService.currentUser();
        if (currentUser && updatedMember.displayName !== currentUser?.displayName) {
          currentUser.displayName = updatedMember.displayName;
          this.accountService.setCurrentUser(currentUser);
        }
        // Toggle edit mode back to false
        this.memberService.editMode.set(false);
        this.snackBarService.openGenericSuccessSnackBar('User Profile Updated');
      },
    });
  }
}
