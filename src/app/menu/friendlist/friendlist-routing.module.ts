import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FriendlistPage } from './friendlist.page';

const routes: Routes = [
  {
    path: '',
    component: FriendlistPage
  },
  {
    path: 'addfriend',
    loadChildren: () => import('./addfriend/addfriend.module').then( m => m.AddfriendPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FriendlistPageRoutingModule {}
