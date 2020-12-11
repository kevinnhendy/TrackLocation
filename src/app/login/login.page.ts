import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {AlertController, LoadingController} from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form: FormGroup;
  hide = true;

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
}
