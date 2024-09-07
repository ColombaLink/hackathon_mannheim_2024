const loggedInHtml = `
  <ion-header>
    <ion-toolbar>
      <ion-title>Logged in</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <h1>You are logged in.</h1>
    <ion-button id="logout-button">Logout</ion-button> 
  </ion-content>
`;

const loggedOutHtml = `
  <ion-header>
    <ion-toolbar>
      <ion-title>Logged out</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <h1>You are logged out.</h1>
    <ion-button id="login-button">Login</ion-button> 
  </ion-content>
`;

class LoginPage extends HTMLElement {
  connectedCallback() {
    this.render();
    this.updateView();
  }

  // Update the view depending on the authState
  updateView() {
    const authState = JSON.parse(localStorage.getItem('authState'));
    if (authState && authState.userId) {
      this.innerHTML = loggedInHtml;
      this.querySelector('#logout-button').addEventListener('click', () => this.logout());
    } else {
      this.innerHTML = loggedOutHtml;
      this.querySelector('#login-button').addEventListener('click', () => this.login());
    }
  }

  async login() {
    try {
      localStorage.setItem('authState', 'loggedIn');

      await window.client.call('login', {
        email: 'alice@demo.com',
        password: '1234'
      });

      localStorage.setItem('authState', JSON.stringify(window.client.authState));
      this.updateView(); // Re-render the component to show logged-in state
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async logout() {
    try {
      await window.client.call('logout');
      localStorage.removeItem('authState');
      this.updateView(); // Re-render the component to show logged-out state
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Initial render
  render() {
    this.innerHTML = loggedOutHtml;
  }
}

customElements.define('login-page', LoginPage);
