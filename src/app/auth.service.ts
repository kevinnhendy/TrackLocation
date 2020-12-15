import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireStorage} from '@angular/fire/storage';
import {Observable} from 'rxjs';
import firebase from 'firebase';

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
      photo: 'account.png',
    });
  }

  login({ email, password }) {
    return this.userFireAuth.signInWithEmailAndPassword(email, password);
  }

  logout() {
    return this.userFireAuth.signOut();
  }

  getUserData(userEmail): Observable<any> {
    if (!userEmail) {
      return this.userFireStore.collection('users').doc(this.currentUser.uid).valueChanges();
    }
    return this.userFireStore.collection<any>('users', ref => {
      return ref.where('email', '==', userEmail);
    }).valueChanges();
  }

  getUserPhotoUrl(imageName): Observable<any> {
    return this.userFireStorage.ref(`users/${imageName}`).getDownloadURL();
  }

  async uploadPhoto(imageString, email) {
    const storageRef = firebase.storage().ref(`users/${email}.png`);

    return await storageRef.putString(imageString, 'base64', {
      contentType: 'image/png'
    });
  }

  async editUserData(userEmail) {
    this.userFireStore.doc(`users/${this.currentUser.uid}`).update({
      photo: userEmail + '.png',
    });
  }

  getFriendList(): Observable<any[]> {
    return this.userFireStore.collection<any>('friendlist', ref => {
      return ref.where('friendof', '==', this.currentUser.uid);
    }).valueChanges();
  }

  async addFriend(user) {
    const id = this.userFireStore.createId();

    return await this.userFireStore.doc(`friendlist/${id}`).set({
      uid: user[0].uid,
      email: user[0].email,
      name: user[0].name,
      photo: user[0].photo,
      friendof: this.currentUser.uid,
      friendid: id,
    });
  }

  async deleteFriend(friendId) {
    return this.userFireStore.collection('friendlist').doc(friendId).delete();
  }
}
