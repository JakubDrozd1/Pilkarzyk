import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'
import { USERS } from 'libs/api-client'

export function ComparePasswordValidator(
  controlNameToCompare: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controlToCompare = control.root.get(controlNameToCompare)

    if (controlToCompare && control.value !== controlToCompare.value) {
      return { compare: true }
    }

    return null
  }
}

export function UserValidator(users: USERS[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const inputValue = control.value
    if (!inputValue) {
      return null
    }
    const [inputFirstName, inputSurname] = inputValue.split(' ')
    const userExists = users.some(
      (user) =>
        user.FIRSTNAME === inputFirstName && user.SURNAME === inputSurname
    )
    return userExists ? null : { userNotExist: true }
  }
}
