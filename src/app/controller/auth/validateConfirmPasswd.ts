import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function compareValidator(controlNameToCompare: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const controlToCompare = control.root.get(controlNameToCompare);
  
      if (controlToCompare && control.value !== controlToCompare.value) {
        return { compare: true };
      }
  
      return null;
    };
  }