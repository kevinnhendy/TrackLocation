import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth.service';
import {AlertController, LoadingController} from '@ionic/angular';
import {AngularFirestore} from '@angular/fire/firestore';
import {Plugins, CameraResultType} from '@capacitor/core';
import {Router} from '@angular/router';

const { Camera } = Plugins;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userProfile: any;
  photo: any = {
    userPhoto: '',
    oldPhoto: '',
    oldPhotoName: '',
    base64Photo: '',
  };

  constructor(
      private authService: AuthService,
      private loadingController: LoadingController,
      private alertController: AlertController,
      private router: Router,
    ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.getUserData(null).subscribe(ref => {
      this.authService.getUserPhotoUrl(ref.photo).subscribe(res => {
        loading.dismiss();

        this.userProfile = ref;
        this.photo.userPhoto = res;
        this.photo.oldPhoto = res;
        this.photo.base64Photo = res;
        this.photo.oldPhotoName = ref.photo;
      });
    });
  }

  async takePicture() {
    try {
      const profilePicture = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Base64,
      });
      this.photo.base64Photo = profilePicture.base64String;
      this.photo.userPhoto = 'data:image/png;base64,' + this.photo.base64Photo;

      const loading = await this.loadingController.create();
      await loading.present();

      if (this.userProfile.photo !== this.photo.oldPhoto) {
        await this.authService.uploadPhoto(this.photo.base64Photo, this.userProfile.email).then(() => {
          this.authService.editUserData(this.userProfile.email).then(() => {
            loading.dismiss();
          });
        });
        this.userProfile.photo = this.userProfile.email + '.png';
      }
    } catch (error) {
    }
  }

  async deleteLocation() {
    const alert = await this.alertController.create({
      header: 'Sukses!',
      message: 'Berhasil menghapus lokasi',
      buttons: ['OK'],
      backdropDismiss: false,
    });

    await alert.present();
  }

  async logout() {
    const loading = await this.loadingController.create();
    await loading.present();

    await this.authService.logout().then(() => {
      loading.dismiss();
    });
    return this.router.navigateByUrl('/', { replaceUrl: true });
  }

  async logoutAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Logout',
      subHeader: 'Yahh... Yakin nih mau keluar?',
      message: `<img src="https://www.clipartmax.com/png/middle/64-644307_sad-emoji-png-clipart-sad-emoji-png-clipart.png"></img>`,
      buttons: [
        {
          text: 'Gajadi deh, demi kamu...',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Ntar pasti login lagi kok!',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }
}
