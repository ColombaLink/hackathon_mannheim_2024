import { getContext, loadMap } from '../helper/index.js';



const initialHtml = `
    Baseline Simulation
`;



export class BaselineSimulation extends HTMLElement {

    connectedCallback() {
        this.render();
        this.updateView();
    }

    updateView() {
        document.querySelector('#btn-stop-simulation').addEventListener('click', () => {
            // Stop the simulation (assumes `BaselineSimulation` has a `stop` method)

            this.stop();

            // Show the start button and hide the stop button
            document.querySelector('#btn-start-simulation').style.visibility = 'visible';
            document.querySelector('#btn-stop-simulation').style.visibility = 'hidden';

            // Clear the simulation segment
            document.querySelector('#segment-baseline-simulation').innerHTML = '';
            console.log("Baseline simulation stopped.");
        }, { once: true });
    }



    async start() {

        /**
        * @typedef {import('@colombalink/app-backend-types').AppRouterType} AppRouterType
        * @typedef {import('../pages/type.js').api} Api
        * @type {Api}
        */
        const api = window.api


        /**
        * @typedef {import('@based/client').BasedClient} Client 
        * @type {Client}
        */
        const client = window.client;

        const inventory = loadMap("inventoryMap")
        const start = new Date().getTime()
        for (let i = 0; i < 10; i++) {
            for (const item of inventory.values()) {
                console.log(item)
                console.log(item)
                let aggregatedItemQuantity = 0
                for(let i of item.items) {
                    aggregatedItemQuantity += i.available
                }

                await client.call("datahub:events:push", {
                    headers: { 'x-monidas-uuid': item.UUID.replace("uuid/", "") },
                    payload: { time: start + i * 1000 * 60, quantity: aggregatedItemQuantity * Math.random() * 10 }
                }).then(console.log).catch(console.log)
            }
        }

    }

    async stop() {

    }


    render() {
        this.innerHTML = initialHtml

        if (!window.simulation.isRunning) {
            this.start()
            window.simulation.isRunning = true
            console.log("Wee need to start.")
        }
    }
}

customElements.define('baseline-simulation', BaselineSimulation);