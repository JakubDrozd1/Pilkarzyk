import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MaskitoModule } from '@maskito/angular';
import { MaskitoElementPredicateAsync, MaskitoOptions } from '@maskito/core';
import { compareValidator } from 'src/app/controller/auth/validateConfirmPasswd';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, MaskitoModule, ReactiveFormsModule, FormsModule]
})
export class RegisterComponent implements OnInit {

  readonly phoneMask: MaskitoOptions = {
    mask: ['+', '4', '8', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/,],
  };
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();

  registrationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      login: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(25)]],
      confirmPassword: ['', [Validators.required, compareValidator('password')]],
      firstName: ['', [Validators.required, Validators.pattern("^[a-zA-Z]+$"), Validators.minLength(3), Validators.maxLength(25)]],
      lastName: ['', [Validators.required, Validators.pattern("^[a-zA-Z]+$"), Validators.minLength(3), Validators.maxLength(25)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(15)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() { }

  onSubmit() {
    console.log(this.registrationForm.value);
  }
}
