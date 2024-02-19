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

export function customValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value: string = control.value
    if (value && value.trim().length > 0) {
      const trimmedValue = value.trim()
      if (trimmedValue.length < 3) {
        return { minLength: true }
      }
      if (trimmedValue.length > 40) {
        return { maxLength: true }
      }
      if (trimmedValue.charAt(0) === ' ') {
        return { leadingSpace: true }
      }
      if (trimmedValue.charAt(trimmedValue.length - 1) === ' ') {
        return { trailingSpace: true }
      }
    } else {
      return { onlySpace: true }
    }
    return null
  }
}
