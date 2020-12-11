import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/menu/tabs/maps',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    component: MenuPage,
    children: [
      {
        path: 'maps',
        loadChildren: () => import('./maps/maps.module').then( m => m.MapsPageModule)
      },
      {
        path: 'friendlist',
        loadChildren: () => import('./friendlist/friendlist.module').then( m => m.FriendlistPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuPageRoutingModule {}
