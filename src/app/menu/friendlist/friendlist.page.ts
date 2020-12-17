import { Component, OnInit } from '@angular/core';
import {map} from 'rxjs/operators';
import {AuthService} from '../../auth.service';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.page.html',
  styleUrls: ['./friendlist.page.scss'],
})
export class FriendlistPage implements OnInit {
  public friendList: any[];
  public friendFilter: any[];

  constructor(
      private authService: AuthService,
      private alertController: AlertController,
      private loadingController: LoadingController,
      private toastController: ToastController,
    ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getFriendList();
  }

  async getFriendList(order = null) {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Loading friend data...',
    });
    await loading.present();

    this.authService.getFriendList().pipe(
        map(async friendList => {
          friendList.map(friend => {
            friend.photo = this.authService.getUserPhotoUrl(friend.photo);
            return friend;
          });

          friendList.sort((friendA, friendB) => {
            return friendA.name - friendB.name;
          });

          return friendList;
        })
    ).subscribe(async friendList => {
      this.friendList = await friendList;
      this.friendFilter = await friendList;
      loading.dismiss();
    });
  }

  async searchFriend($event) {
    const searchTerm = $event.srcElement.value;
    if (!searchTerm) {
      this.friendFilter = this.friendList;
      return;
    }
    this.friendFilter = this.friendList.filter(friend => {
      if (friend.name && searchTerm) {
        return (friend.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
      }
    });
  }

  async deleteAlert(friend) {
    const toast = await this.toastController.create({
      message: 'Friend deleted successfully!',
      duration: 2000,
      color: 'success',
    });

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Delete friend',
      subHeader: 'Are you sure you want to unfriend ' + friend.name + '?',
      buttons: [
        {
          text: 'Ok',
          handler: data => {
            this.authService.deleteFriend(friend.friendid).then(() => {
              toast.present();
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
}
