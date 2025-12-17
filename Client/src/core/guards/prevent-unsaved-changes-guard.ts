import { CanDeactivateFn } from '@angular/router';
import { MemberProfile } from '../../features/members/member-profile/member-profile';

export const preventUnsavedChangesGuard: CanDeactivateFn<MemberProfile> = (component) => {
  // We can check the component fields
  // For example here we will check if the component's form is dirty
  if (component.editForm?.dirty) {
    return confirm('Are you show you want to continue? All unsaved changes will be lost!');
  }

  return true;
};
