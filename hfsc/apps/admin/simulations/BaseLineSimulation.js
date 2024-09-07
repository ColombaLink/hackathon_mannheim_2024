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

    calculateRemainingSum(items, n) {
        let remaining = n; // The amount to subtract
    
        for (let i = 0; i < items.length; i++) {
    
            if (remaining <= 0) break; // Exit loop if no remaining amount to subtract
    
            if (remaining <= items[i].available) {
                // If remaining amount is less than the item's available quantity
                items[i].available =  items[i].available - remaining;
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
        const start = new Date().getTime();

        // simulation step size
        const stepSize = 10
        for (let i = 0; i < stepSize; i++) {
            
            if (i === 0) {
                // Step 1: If i == 0, write all inventory items
                for (const item of inventory.values()) {
                    //console.log(item);
                    
                    let intialAggregatedItemQuantity = 0;
                    for (let subItem of item.items) {

                        intialAggregatedItemQuantity += subItem.available;
                    }
        
                    await client.call("datahub:events:push", {
                        headers: { 'x-monidas-uuid': item.UUID.replace("uuid/", "") },
                        payload: { time: start + i * 1000 * 60 * 60, quantity: intialAggregatedItemQuantity }
                    }).then(console.log).catch(console.log);
                }
            }else {

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
                    //console.log(item.items[0].available);
                    let s = 0
                    for (let j = 0; j < item.items.length; j++) {

                        s += item.items[j].available
                    }
                    console.log(`initial sum: ${s}`);
        
                    const randomAmount = Math.floor(Math.random() * 10);
                    console.log(`randomAmount: ${randomAmount}`);
                    let aggregatedItemQuantity = this.calculateRemainingSum(item.items, randomAmount);
                    console.log(`aggregatedItemQuantity: ${aggregatedItemQuantity}`);
        

                    await client.call("datahub:events:push", {
                        headers: { 'x-monidas-uuid': item.UUID.replace("uuid/", "") },
                        payload: { time: start + i * 1000 * 60 * 20, quantity: aggregatedItemQuantity }
                    }).then(console.log).catch(console.log);
                }
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