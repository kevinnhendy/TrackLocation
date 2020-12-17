import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth.service';
import {AlertController, LoadingController, PopoverController, ToastController} from '@ionic/angular';
import {Plugins, CameraResultType} from '@capacitor/core';
import {Router} from '@angular/router';
import {PopoverComponent} from './popover/popover.component';

const { Camera } = Plugins;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userProfile: any;
  userLocationList: any;
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
      private toastController: ToastController,
      private popoverController: PopoverController,
      private router: Router,
    ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Loading your data...',
    });
    await loading.present();

    this.authService.getUserData(null).subscribe(ref => {
      this.authService.getUserPhotoUrl(ref.photo).subscribe(res => {
        this.authService.getUserLocationList().subscribe(result => {
          loading.dismiss();

          this.userProfile = ref;
          this.photo.userPhoto = res;
          this.photo.oldPhoto = res;
          this.photo.base64Photo = res;
          this.photo.oldPhotoName = ref.photo;

          this.userLocationList = result;
        });
      });
    });
  }

  show(){
    const modal = document.querySelector('.imagePreview');
    modal.classList.add('show');
  }

  close(){
    const modal = document.querySelector('.imagePreview');
    modal.classList.remove('show');
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

      const loading = await this.loadingController.create({
        cssClass: 'my-custom-class',
        message: 'Please wait...',
      });
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
      subHeader: 'Are you sure want to logout?',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.logout().then(() => {
              this.router.navigateByUrl('/login', { replaceUrl: true });
            });
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteAlert(locationData) {
    const toast = await this.toastController.create({
      message: 'Your location has been deleted successfully!',
      duration: 2000,
      color: 'success',
    });

    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Deleting check-in history',
      subHeader: 'Are you sure to delete this location: ' + locationData.location.title + '?',
      buttons: [
        {
          text: 'Ok',
          handler: data => {
            loading.present();
            this.authService.deleteLocation(locationData.uid).then(() => {
              let location = null;

              if (this.userLocationList.length === 0) {
                location = locationData.location;
              } else {
                location = this.userLocationList[0].location;
              }
              this.authService.addUserLocation(location, 'update').then(() => {
                loading.dismiss();
                toast.present();
              });
            });
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }
      ],
      backdropDismiss: false,
    });

    await alert.present();
  }

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      cssClass: 'my-custom-class',
      translucent: true,
    });
    return await popover.present();
  }
}
