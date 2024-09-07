import { getAllOrganizations, getContext } from "../helper/index.js";

const initialHtml = `
  <ion-header>
    <ion-toolbar>
      <ion-title>Data Ingestion</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <h1>Setup Data</h1>
    <ion-button id="btn-create-org">Create Org</ion-button> 
  </ion-content>
`;





class DataIngestionsPage extends HTMLElement {
  connectedCallback() {
    this.render();
    this.updateView();
  }

  updateView() {
    this.querySelector('#btn-create-org').addEventListener('click', () => this.createOrg());
  }


  async createOrg() {

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


    const created = new Map()
    for (const item of rawInventory) {
      if(created.has(item.name)) {
        return 
      }

      await api.project.addThingToProject.mutate({
        name: item.name,
      }, getContext())

      created.set(item.name, true)
    }
  }


  render() {
    this.innerHTML = initialHtml;
  }
}

customElements.define('data-ingestion-page', DataIngestionsPage);



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