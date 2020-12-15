import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapsPageRoutingModule } from './maps-routing.module';

import { MapsPage } from './maps.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MapsPageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [MapsPage]
})
export class MapsPageModule {}
