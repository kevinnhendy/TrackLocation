import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireStorage} from '@angular/fire/storage';

export interface User {
  uid: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User = null;

  constructor(
      public userFireAuth: AngularFireAuth,
      private userFireStore: AngularFirestore,
      private userFireStorage: AngularFireStorage,
  ) {
    this.authenticate();
  }

  async authenticate() {
    await this.userFireAuth.onAuthStateChanged(user => {
      this.currentUser = user;
    });
  }

  async register(user) {
    const credential = await this.userFireAuth.createUserWithEmailAndPassword(user.email, user.password);

    return this.userFireStore.doc(`users/${credential.user.uid}`).set({
      uid: credential.user.uid,
      email: user.email,
      name: user.firstname + ' ' + user.lastname,
      photo: 'account.svg',
    });
  }

  login({ email, password }) {
    return this.userFireAuth.signInWithEmailAndPassword(email, password);
  }

  logout() {
    return this.userFireAuth.signOut();
  }

}
