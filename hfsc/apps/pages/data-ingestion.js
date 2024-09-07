import { getAllOrganizations, getContext, loadMap, sanitizeNames as sanitizeName, saveMap } from "../helper/index.js";
import { BaselineSimulation } from "../simulations/BaseLineSimulation.js";
const initialHtml = `
  <ion-header>
    <ion-toolbar>
      <ion-title>Data Ingestion</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <h1>Setup Data</h1>
    <ion-button id="btn-create-org-and-ingest-data">Create Org</ion-button> 
    <ion-button id="btn-start-simulation">Start Baseline Simulation</ion-button>
    <ion-button id="btn-stop-simulation" style="visibility:hidden">Stop Baseline Simulation</ion-button>
    
    <div id="segment-baseline-simulation"> </div>
    
  </ion-content>
`;



class DataIngestionPage extends HTMLElement {
  connectedCallback() {
    this.render();
    this.updateView();
  }

  updateView() {
    this.querySelector('#btn-create-org-and-ingest-data').addEventListener('click', () => this.createOrgAndIngestData());
    this.querySelector('#btn-start-simulation').addEventListener('click', () => {
      // Check if the simulation is already running based on the button visibility
     
      if(window.simulation && window.simulation.isRunning) {
        console.info("Simulation is running.")
      } 
      
      // Hide the start button and show the stop button
      this.querySelector('#btn-start-simulation').style.visibility = 'hidden';
      this.querySelector('#btn-stop-simulation').style.visibility = 'visible';

      // Render the baseline simulation component
      this.querySelector('#segment-baseline-simulation').innerHTML = `<baseline-simulation></baseline-simulation>`;
      console.log("Baseline simulation started.");
    });

  }



  async createOrgAndIngestData() {

    /**
    * @typedef {import('@colombalink/app-backend-types').AppRouterType} AppRouterType
    * @typedef {import('./type.js').api} Api
    * @type {Api}
    */
    const api = window.api
    const orgs = await getAllOrganizations()

    for (const { alias } of orgs) {
      await api.organization.deleteOrganization.mutate({ orgAliasId: alias }, getContext())
    }

    const org = await api.organization.createOrganization.mutate(
      { name: 'Lidl Schweiz Rebergasse 20', alias: 'lidl-schweiz-rebgasse-20' },
      getContext()
    )

    const project = await api.project.createProject.mutate({
      alias: 'inventory',
      name: "Inventory",
    },
      getContext()
    )

    const rawInventory = await (await fetch("./data/inventoryItems.json")).json()
    console.log(rawInventory)



    await api.project.quotas.setQuota.mutate({
      limit: 1000000000000,
    }, getContext())



    const thingsMap = new Map()
    for (const item of rawInventory) {
      if (window.limits.inventoryCount > window.limits.maxInventory) {
        continue
      }
      item.name = sanitizeName(item.name)
      if (thingsMap.has(item.name)) {
        const thing = thingsMap.get(item.name)
        thing.available = thing.available + item.available
        continue
      }

      const thing = await api.project.addThingToProject.mutate({
        name: item.name,
      }, getContext())

      thingsMap.set(item.name, {
        available: item.available,
        ...thing
      })

      await api.thing.setPayloadSchema.mutate({
        thingAliasId: thing.alias,
        identifiers: [],
        tags: [],
        values: ["quantity"],
        propertyPaths: [{
          path: 'quantity',
          unitUri: 'http://sample.ch/units/Unitless'
        }],
        influxTags: [],
        properties: [
          {
            label: {
              en: 'Quantity',
              de: 'Quantität'
            },
            name: 'quantity',
            primitiveDataType: 'int',
            unit: {
              label: {
                en: '',
                de: ''
              },
              uri: 'http://sample.ch/units/Unitless',
              abbreviation: '',
              symbol: ''
            }
          },
        ]
      }, getContext())

      window.limits.inventoryCount++
      console.log(window.limits.inventoryCount)
    }

    saveMap("inventoryMap", thingsMap)
    loadMap("inventoryMap")
  }



  render() {
    this.innerHTML = initialHtml;
  }
}

customElements.define('data-ingestion-page', DataIngestionPage);



class PageTwo extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button></ion-back-button>
            </ion-buttons>
            <ion-title>Page Two</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <h1>Page Two</h1>
          <div>
            <ion-nav-link router-direction="forward" component="page-three">
              <ion-button>Go to Page Three</ion-button>
            </ion-nav-link>
          </div>
        </ion-content>
      `;
  }
}

customElements.define('page-two', PageTwo);