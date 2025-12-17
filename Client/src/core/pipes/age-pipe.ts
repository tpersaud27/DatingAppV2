import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'age',
  standalone: true,
})
export class AgePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): number | null {
    if (!value) {
      return null;
    }

    const today = new Date();
    let birthDate = new Date();

    // Converting input to a date safely
    if (typeof value === 'string') {
      const [year, month, day] = value.split('-').map(Number);
      birthDate = new Date(year, month - 1, day);
    } else {
      birthDate = value;
    }

    // This is the age of the user but we need to check if the birthday has happened for that year or not
    let age = today.getFullYear() - birthDate.getFullYear();

    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    // If they havent had their birthday we need to reduce their age by 1 year
    if (!hasHadBirthdayThisYear) {
      age--;
    }

    return age;
  }
}
