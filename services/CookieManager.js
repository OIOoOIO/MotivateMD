import base64 from 'base-64';

export default class CookieManager {
  constructor(cookies) {
    if (typeof cookies === 'undefined') {
      if (typeof document !== 'undefined') {
        this.cookies = document.cookie;
      } else {
        this.cookies = '';
      }
    } else {
      this.cookies = cookies;
    }
  }
  
  getDocumentCookie(name) {
    if (typeof document !== 'undefined') {
      var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
    } else {
      console.log('document is undefined');
      return null;
    }
  }

  setDocumentCookie(name, value, days) {
    if (typeof document !== 'undefined') {
      var d = new Date;
      d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
      document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
    } else {
      console.log('document is undefined');
    }
  }

  deleteDocumentCookie(name) {
    this.setCookie(name, '', -1);
  }

  getIdToken() {
    return this.get('id_token');
  }
  decodeIdToken() {
    try {
      let id_token = this.get('id_token');
      return JSON.parse(base64.decode(id_token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
  loggedIn() {
    return this.decodeIdToken() !== null;
  }
  get(name) {
    var v = this.cookies.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
  }
}