import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../auth.service';
import {map} from 'rxjs/operators';
import {LoadingController, ToastController} from '@ionic/angular';

@Component({
  selector: 'app-addfriend',
  templateUrl: './addfriend.page.html',
  styleUrls: ['./addfriend.page.scss'],
})
export class AddfriendPage implements OnInit {
  friendData: any;
  friendList: any;
  friendAdded = false;
  isUser = false;

  constructor(
      private authService: AuthService,
      private toastController: ToastController,
      private loadingController: LoadingController,
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
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
    });
  }

  async searchFriend($event) {
    const searchTerm = $event.srcElement.value.trim();
    if (searchTerm) {
      this.authService.getUserData(searchTerm).pipe(
          map(async friendData => {
            friendData.map(friend => {
              friend.photoUrl = this.authService.getUserPhotoUrl(friend.photo);
              return friend;
            });

            return friendData;
          })
      ).subscribe(async friendData => {
        this.friendData = await friendData;
        if (this.friendData.length !== 0) {
          this.friendAdded = false;

          this.friendList.map((friend) => {
            if (friend.uid === this.friendData[0].uid) {
              return this.friendAdded = true;
            }
          });
        }
      });
      return;
    }
  }

  async addFriend() {
    const toast = await this.toastController.create({
      message: 'Friend added successfully!',
      duration: 2000,
      color: 'success',
    });

    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });

    if (this.friendData[0].uid === this.authService.currentUser.uid) {
      const failedToast = await this.toastController.create({
        message: 'Sorry you can\'t add yourself :(',
        duration: 2000,
        color: 'danger',
      });
      failedToast.present();
    } else {
      loading.present();

      this.friendAdded = !this.friendAdded;
      this.authService.addFriend(this.friendData).then(() => {
        loading.dismiss();
        toast.present();
      });
    }
  }
}
