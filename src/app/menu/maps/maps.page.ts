import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { LoadingController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit {
  map: any;
  form: FormGroup;
  infoWindow: any = new google.maps.InfoWindow();
  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;
  currentPos: any = {
    lat: -6.256081,
    lng: 106.618755
  };
  marker: any;

  constructor(
      private fb: FormBuilder,
      private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
    });
  }

  ionViewWillEnter() {
    this.showMap(this.currentPos);
  }

  showCurrentLoc() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {
        this.currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log(this.currentPos);
        // this.infoWindow.setPosition(pos);
        this.marker.setPosition(this.currentPos);
        // this.infoWindow.setContent('Your Current Location');
        // this.infoWindow.open(this.map);
        this.map.setCenter(this.currentPos);
      });
    }
  }


  showMap(pos: any) {
    const location = new google.maps.LatLng(pos.lat, pos.lng);

    const options = {
      center: location,
      zoom: 13,
      disableDefaultUI: true,
      // mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(this.mapRef.nativeElement, options);

    const locations = [
      ['Wilson Philips', -6.252381, 106.618712, 'blue'],
      ['Benny Richardson', -6.250681, 106.618655, 'yellow'],
      ['You', -36.256081, 198.618758, 'red'],
    ];

    const colorList = [
        'yellow', 'blue', 'green', 'ltblue', 'orange', 'pink', 'purple'
    ];

    const infoWindow = new google.maps.InfoWindow();

    let i;

    const url = 'http://maps.google.com/mapfiles/ms/icons/';

    for (i = 0; i < locations.length; i++) {
      this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
        map: this.map,
        icon: {
          url: url + locations[i][3] + '-dot.png',
        }
      });

      google.maps.event.addListener(this.marker, 'click', ((marker, i) => {
        return function() {
          infoWindow.setContent(locations[i][0]);
          infoWindow.open(this.map, marker);
        };
      })(this.marker, i));
    }

    this.map.addListener('click', (mapsMouseEvent) => {
      this.infoWindow.close();

      // this.infoWindow = new google.maps.InfoWindow({
      //   position: mapsMouseEvent.latLng,
      // });
      // this.infoWindow.setContent(
      //     JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
      // );
      // this.infoWindow.open(this.map);
      this.marker.setPosition(mapsMouseEvent.latLng);
      this.currentPos = mapsMouseEvent.latLng.toJSON();

      console.log('Pinned String: ', JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2));
      console.log('Pinned JSON: ', mapsMouseEvent.latLng.toJSON());
      console.log('Current Pos: ', this.currentPos);
    });
  }

  // showMap(pos: any) {
  //   console.log('position', pos);
  //   const location = new google.maps.LatLng(pos.lat, pos.lng);
  //   const options = {
  //     center: location,
  //     zoom: 13,
  //     disableDefaultUI: true
  //   };
  //   this.map = new google.maps.Map(this.mapRef.nativeElement, options);
  //
  //   this.marker = new google.maps.Marker({
  //     position: this.firstPos,
  //     map: this.map,
  //   });
  //
  //   // this.infoWindow = new google.maps.InfoWindow({
  //   //   content: 'Click the map to get Lat/Lng!',
  //   //   position: this.firstPos,
  //   // });
  //   // this.infoWindow.open(this.map);
  //
  //   this.map.addListener('click', (mapsMouseEvent) => {
  //     this.infoWindow.close();
  //
  //     // this.infoWindow = new google.maps.InfoWindow({
  //     //   position: mapsMouseEvent.latLng,
  //     // });
  //     // this.infoWindow.setContent(
  //     //     JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
  //     // );
  //     // this.infoWindow.open(this.map);
  //     this.marker.setPosition(mapsMouseEvent.latLng);
  //   });
  // }

  async saveLocation() {
    // const loading = await this.loadingController.create();
    // await loading.present();

    console.log('Current Position: ', this.currentPos);
  }
}
