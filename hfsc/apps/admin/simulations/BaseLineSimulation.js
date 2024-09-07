import { getContext, loadMap } from '../helper/index.js';



const initialHtml = `
    Baseline Simulation
`;

function restock(item, simTime) {
    const start = new Date("2024-09-06T08:00:00.00Z").getTime();
    const inventory = loadMap("inventoryMap")
    item.items.push({
        ...inventory.get(item.name).items[0],
        expiresAt: inventory.get(item.name).items[0].expiresAt - start
    })
    console.log(item)

}

function calcSum(item) {
    let sum = 0
    for (let subItem of item.items) {
        sum += subItem.available;
    }
    return sum
}

function calculateRemainingSum(item, n) {
    const items = item.items
    let remaining = n; // The amount to subtract

    for (let i = 0; i < items.length; i++) {

        if (remaining <= 0) break; // Exit loop if no remaining amount to subtract

        if (remaining <= items[i].available) {
            // If remaining amount is less than the item's available quantity
            items[i].available = items[i].available - remaining;
            remaining = 0; // All of n is subtracted
        } else {
            // If remaining amount is greater than or equal to the item's available quantity
            remaining -= items[i].available; // Subtract the item's available quantity
            items[i].available = 0; // Set the item's available quantity to 0
        }
    }

    // Calculate the total sum of remaining available amounts
    //console.log("remaining\n"

    const totalRemainingSum = items.reduce((sum, item) => sum + item.available, 0);
    //console.log(totalRemainingSum)
    console.log(`totalRemainingSum: ${totalRemainingSum}`);
    return totalRemainingSum;
}


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
        const start = new Date("2024-09-06T08:00:00.00Z").getTime();

        // simulation step size
        const stepSize = 10;
        const oneHour = 1000 * 60 * 60

        for (const item of inventory.values()) {     
            await client.call("datahub:events:push", {
                headers: { 'x-monidas-uuid': item.UUID.replace("uuid/", "") },
                payload: { time: start, quantity: calcSum(item) }
            }).then(console.log).catch(console.log);
        }

        for (let i = 1; i < stepSize; i++) {
            const step = oneHour * i
            const simulationTime = start + step
            console.log(simulationTime)
            console.log(new Date(simulationTime).toISOString())


            // Step 2: If i > 0, randomly generate a shopping list from the inventory items
            const shoppingList = [];
                // Randomly select a number of items to be part of the shopping list
                const numItemsInList = Math.floor(Math.random() * inventory.size) + 1;
                // Randomly pick items from the inventory to form the shopping list
                const inventoryArray = Array.from(inventory.values());
                for (let j = 0; j < numItemsInList; j++) {
                    const randomItemIndex = Math.floor(Math.random() * inventoryArray.length);
                    const selectedItem = inventoryArray[randomItemIndex];
                    shoppingList.push(selectedItem);
                }

                // Write (log and push) only the items in the shopping list
                for (const item of shoppingList) {

                    const randomAmount = Math.floor(Math.random() * 10);
                    console.log(`randomAmount: ${randomAmount}`);
                    let aggregatedItemQuantity = calculateRemainingSum(item, randomAmount);
                    console.log(`aggregatedItemQuantity: ${aggregatedItemQuantity}`);

                    if(calcSum(item) < 10) {
                        restock(item, simulationTime)
                    }

                    await client.call("datahub:events:push", {
                        headers: { 'x-monidas-uuid': item.UUID.replace("uuid/", "") },
                        payload: { time: simulationTime, quantity: calcSum(item) }
                    }).then(console.log).catch(console.log);
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