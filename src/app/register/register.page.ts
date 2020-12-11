import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {AlertController, LoadingController} from '@ionic/angular';
import {ConfirmPasswordValidator} from './confirm-password.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  form: FormGroup;
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
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required, Validators.minLength(6)]],
    }, {
      validator: ConfirmPasswordValidator('password', 'confirm'),
    });
  }

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.register(this.form.value).then(user => {
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
