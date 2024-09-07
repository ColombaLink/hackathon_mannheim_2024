class LoginPage extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <ion-header>
          <ion-toolbar>
            <ion-title>Login Page</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
        <h1>Page One</h1>
          <ion-nav-link router-direction="forward" component="page-two">
            <ion-button>Go to Page Two</ion-button>
          </ion-nav-link>
        </ion-content>
      `;
    }
  }
  customElements.define('login-page', LoginPage);