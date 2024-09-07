
import { BasedClient, createTrpcClient } from 'https://app.sc.hack.monidas.com/libs/based-client.js';


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


window.api = await createTrpcClient(window.client, "monidas:app:api:v0.0.2")