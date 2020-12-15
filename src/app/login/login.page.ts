import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {AlertController, LoadingController} from '@ionic/angular';
import {ConfirmPasswordValidator} from './confirm-password.validator';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form: FormGroup;
  formSignUp: FormGroup;
  hide = true;
  confirmHide = true;
  passwordHide = true;

  constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private authService: AuthService,
      private alertController: AlertController,
      private loadingController: LoadingController,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.formSignUp = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required, Validators.minLength(6)]],
    }, {
      validator: ConfirmPasswordValidator('password', 'confirm'),
    });

    const container = document.querySelector('#container');
    setTimeout(() => {
      container.classList.add('sign-in')
    }, 200);
  }

  toggle() {
    const container = document.querySelector('#container');

    container.classList.toggle('sign-in');
    container.classList.toggle('sign-up');
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.login(this.form.value).then(user => {
      loading.dismiss();
      this.router.navigateByUrl('/menu/tabs/maps', { replaceUrl: true });
    }, async err => {
      loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Login akun gagal',
        message: err.message,
        buttons: ['OK'],
      });

      await alert.present();
    });
  }

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.register(this.formSignUp.value).then(user => {
      loading.dismiss();
      this.router.navigateByUrl('/menu/tabs/maps', { replaceUrl: true });
    }, async err => {
      loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Registrasi akun gagal',
        message: err.message,
        buttons: ['OK'],
      });

      await alert.present();
    });
  }
}
