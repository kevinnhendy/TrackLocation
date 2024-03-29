import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingController, ToastController} from '@ionic/angular';
import { interval } from 'rxjs';
import {AuthService} from '../../auth.service';

declare var google: any;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit {
  userData: any;
  friendData: any;
  locationList: any = [];
  colorList = [
    'yellow', 'blue', 'green', 'ltblue', 'orange', 'pink', 'purple'
  ];

  map: any;
  form: FormGroup;
  infoWindow: any = new google.maps.InfoWindow();
  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;
  currentPos: any = {
    lat: -6.256081,
    lng: 106.618755
  };
  marker: any;
  sub: any;

  constructor(
      private fb: FormBuilder,
      private loadingController: LoadingController,
      private authService: AuthService,
      private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
    });
  }

  async ionViewWillEnter() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Updating location...',
    });
    await loading.present();

    this.authService.getUserData(null).subscribe(res => {
      this.userData = res;
      this.authService.getFriendList().subscribe(ref => {
        this.friendData = ref;

        let iterator = 0;
        let colorIterator = 0;

        for (iterator; iterator < ref.length; iterator++) {
          if (colorIterator >= this.colorList.length - 1) {
            colorIterator = 0;
          }

          this.locationList[iterator] = [
            this.friendData[iterator].name,
            this.friendData[iterator].location.lat,
            this.friendData[iterator].location.lng,
            this.friendData[iterator].location.title,
            this.colorList[colorIterator],
          ];
          colorIterator++;
        }

        this.locationList[iterator++] = [
          this.userData.name,
          this.userData.location.lat,
          this.userData.location.lng,
          this.userData.location.title,
          'red',
        ];

        this.showMap(this.currentPos).then(() => {
          loading.dismiss();
        });
      });
    });

    const timeUpdate = 600000;

    interval(timeUpdate).subscribe((val) => {
      this.showCurrentLoc().then(() => {
        this.saveLocation();
      });
    });
  }

  async showCurrentLoc() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {
        this.currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
          title: 'Automated check-in',
        };

        this.marker.setPosition(this.currentPos);
        this.map.setCenter(this.currentPos);
      });
    }
  }


  async showMap(pos: any) {
    const location = new google.maps.LatLng(pos.lat, pos.lng);

    const options = {
      center: location,
      zoom: 13,
      disableDefaultUI: true,
      // mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(this.mapRef.nativeElement, options);

    const locations = this.locationList;


    const infoWindow = new google.maps.InfoWindow();

    let iterator;

    const url = 'http://maps.google.com/mapfiles/ms/icons/';

    if (this.locationList.length > 0) {
      for (iterator = 0; iterator < locations.length; iterator++) {
        this.marker = new google.maps.Marker({
          position: new google.maps.LatLng(locations[iterator][1], locations[iterator][2]),
          map: this.map,
          icon: {
            url: url + locations[iterator][4] + '-dot.png',
          }
        });

        google.maps.event.addListener(this.marker, 'click', ((marker, iterator) => {
          return function() {
            infoWindow.setContent(locations[iterator][0]);
            infoWindow.open(this.map, marker);
          };
        })(this.marker, iterator));
      }
    }

    this.map.addListener('click', (mapsMouseEvent) => {
      this.infoWindow.close();
      const currDate = Date.now();

      this.marker.setPosition(mapsMouseEvent.latLng);
      this.currentPos = mapsMouseEvent.latLng.toJSON();
      this.currentPos.timestamp = currDate;
    });
  }

  async saveLocation() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Saving new location...',
    });
    await loading.present();

    if (this.form.value.title === '') {
      this.currentPos.title = 'Automated check-in';
    } else {
      this.currentPos.title = this.form.value.title;
    }

    this.form.setValue({
      title: ''
    });

    this.authService.addUserLocation(this.currentPos, 'add').then(() => {
      loading.dismiss();
    });

    const toast = await this.toastController.create({
      message: 'Lokasi anda berhasil dimasukkan!',
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }
}
