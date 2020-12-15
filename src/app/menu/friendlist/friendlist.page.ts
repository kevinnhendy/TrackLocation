import { Component, OnInit } from '@angular/core';
import {map} from 'rxjs/operators';
import {AngularFireStorage} from '@angular/fire/storage';
import {Router} from '@angular/router';
import {AuthService} from '../../auth.service';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.page.html',
  styleUrls: ['./friendlist.page.scss'],
})
export class FriendlistPage implements OnInit {
  public wisataList: any[];
  public wisataFilter: any[];

  constructor(
      private authService: AuthService,
      private alertController: AlertController,
    ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getWisataList();
  }

  getWisataList(order = null) {
    this.authService.getFriendList().pipe(
        map(async wisataList => {
          wisataList.map(wisata => {
            wisata.photo = this.authService.getUserPhotoUrl(wisata.photo);
            return wisata;
          });

          wisataList.sort((wisataA, wisataB) => {
            return wisataA.name - wisataB.name;
          });

          return wisataList;
        })
    ).subscribe(async wisataList => {
      this.wisataList = await wisataList;
      this.wisataFilter = await wisataList;
    });
  }

  async searchWisata($event) {
    const searchTerm = $event.srcElement.value;
    if (!searchTerm) {
      this.wisataFilter = this.wisataList;
      return;
    }
    this.wisataFilter = this.wisataList.filter(wisata => {
      if (wisata.name && searchTerm) {
        return (wisata.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
      }
    });
  }


  async deleteAlert(friend) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Menghapus pertemanan',
      subHeader: 'Yakin ingin menghapus pertemanan dengan ' + friend.name + '?',
      buttons: [
        {
          text: 'Ok',
          handler: data => {
            this.authService.deleteFriend(friend.friendid);
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
