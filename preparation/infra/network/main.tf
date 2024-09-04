variable "AZURE_SUBSCRIPTION_ID" {
  default = ""
}

terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
    }
  }


}
provider "azurerm" {
  subscription_id = var.AZURE_SUBSCRIPTION_ID
  features {}
}

# Resource group
resource "azurerm_resource_group" "hackfestival_rg" {
  name     = "hackfestival-resources"
  location = "Sweden Central" # Set location to Sweden Central
}

# Virtual Network
resource "azurerm_virtual_network" "hackfestival_vnet" {
  name                = "hackfestival-vnet"
  location            = azurerm_resource_group.hackfestival_rg.location
  resource_group_name = azurerm_resource_group.hackfestival_rg.name
  address_space       = ["10.0.0.0/16"]
}

# Subnet for the Azure Search Service
resource "azurerm_subnet" "hackfestival_subnet" {
  name                 = "hackfestival-subnet"
  resource_group_name  = azurerm_resource_group.hackfestival_rg.name
  virtual_network_name = azurerm_virtual_network.hackfestival_vnet.name
  address_prefixes     = ["10.0.1.0/24"]
  service_endpoints = ["Microsoft.CognitiveServices"]
}

# Network Security Group (optional)
resource "azurerm_network_security_group" "hackfestival_nsg" {
  name                = "hackfestival-nsg"
  location            = azurerm_resource_group.hackfestival_rg.location
  resource_group_name = azurerm_resource_group.hackfestival_rg.name
}

# Associate NSG with Subnet
resource "azurerm_subnet_network_security_group_association" "hackfestival_nsg_association" {
  subnet_id                 = azurerm_subnet.hackfestival_subnet.id
  network_security_group_id = azurerm_network_security_group.hackfestival_nsg.id
}

# Azure Search Service
resource "azurerm_search_service" "hackfestival_search" {
  name                = "hackfestivalsearchservice"
  resource_group_name = azurerm_resource_group.hackfestival_rg.name
  location            = azurerm_resource_group.hackfestival_rg.location
  sku                 = "basic"
  partition_count     = 1
  replica_count       = 1

  identity {
    type = "SystemAssigned"
  }


  depends_on = [
    azurerm_virtual_network.hackfestival_vnet,
    azurerm_subnet.hackfestival_subnet
  ]
}

# Azure AI Services Account
resource "azurerm_ai_services" "hackfestival_ai" {
   name                = "hackfestival-ai"
   resource_group_name = azurerm_resource_group.hackfestival_rg.name
   location            = azurerm_resource_group.hackfestival_rg.location
   sku_name            = "S0"
   custom_subdomain_name = "hackfestival-ai"
   fqdns = []

   network_acls {
     default_action = "Deny"
     ip_rules = []

     virtual_network_rules {
       ignore_missing_vnet_service_endpoint = false
       subnet_id = azurerm_subnet.hackfestival_subnet.id
     }
   }

}



# Output the Search Service name
output "search_service_name" {
  value = azurerm_search_service.hackfestival_search.name
}
