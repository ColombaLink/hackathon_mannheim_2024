
import { BasedClient } from 'https://app.sc.hack.monidas.com/libs/based-client.js';

const afterLogout = () => {
    localStorage.removeItem("authState");
    document.getElementById("login").style.visibility = 'visible'
    document.getElementById("logout").style.visibility = 'hidden'
}

const afterLogin = () => {
    document.getElementById("login").style.visibility = 'hidden'
    document.getElementById("logout").style.visibility = 'visible'
}

/**
    * @typedef {import('@based/client').BasedClient} BasedClientType
    */

/**
 * @type {BasedClientType}
 */
window.client = new BasedClient()
window.client.connect({
    url: `wss://api.sc.hack.monidas.com/hub/ws/`
})

const authState = JSON.parse(localStorage.getItem("authState"))
if (authState) {
    window.client.setAuthState(authState)
    console.log("after login")
    afterLogin()
}


document.getElementById("login").onclick = async () => {
    await window.client.call('login', {
        email: 'alice@demo.com',
        password: '1234'
    }).then(() => {
        localStorage.setItem("authState", JSON.stringify(client.authState));
        afterLogin()
    }).catch(console.error)
}


document.getElementById("logout").onclick = async () => {
    await window.client.call('logout').then(afterLogout).catch(console.error)
}



