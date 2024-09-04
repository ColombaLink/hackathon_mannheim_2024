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
  service_endpoints    = ["Microsoft.CognitiveServices"]
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
  name                  = "hackfestival-ai"
  resource_group_name   = azurerm_resource_group.hackfestival_rg.name
  location              = azurerm_resource_group.hackfestival_rg.location
  sku_name              = "S0"
  custom_subdomain_name = "hackfestival-ai"
  fqdns                 = []

  network_acls {
    default_action = "Deny"
    ip_rules       = []

    virtual_network_rules {
      ignore_missing_vnet_service_endpoint = false
      subnet_id                            = azurerm_subnet.hackfestival_subnet.id
    }
  }

}


# Define a single Azure Linux Virtual Machine
resource "azurerm_linux_virtual_machine" "hackfestival_vm" {
  name                = "hackfestival-vm"
  location            = azurerm_resource_group.hackfestival_rg.location
  resource_group_name = azurerm_resource_group.hackfestival_rg.name
  size                = "Standard_D16s_v3"
  admin_username      = "hacker"

  # Add SSH Key
  admin_ssh_key {
    username   = "hacker"
    public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDOST+RLBLs62n0HowEK8a7pjPPBYm85bRtwK5HmA69BL1TE/75915VylC3my9oqDL7CPOtBdD9JaBQJ0vICNruDkJ/98XO/XMcC6hOTnUlfM/Hnw5pe/OGlaTnA9xcNtX+yLuqcKrliVHogkc9YtGpHDpO+mH/LwZpc7/QbK59lPG84N1azMAimbX++dqdPND5XBF9EL0qlfZV9ai0sA74m3dLd6CK+EcQ7RaM7W/Y2wZcoXLl6/PDf10A1ZXtPlgNRJpZfcXZXtnByNPB/lf1FWo5zBBUcDkzs2jMZVxvJ7RanACm9rQdhRqtcm/fGrxbTAkup68D//CgpX2SA8Ho+XplG40wbe8NXmoap41OTK7hSEPkuQYYyfeJSyJkfgwrPziPaBUF1fRoQ67R1CSPrt/j/+t0EYAg9khVqwYrtBhzaUKHrc/yNCd8OnYsvZPP2b0N1Y4JD0TsFVk9zIve2Gdu3Pg9naf6rIHxxtdk05dttZU7RQmA9D3GAeuvQ5E= fp@fp"
  }

  # OS Disk Configuration
  os_disk {
    name                 = "hackfestival_os_disk"
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 30
  }

  # Data Disk Configuration

  # data_disk {
  #   lun                 = 0
  #   caching             = "ReadOnly"
  #   disk_size_gb        = 1024
  #   storage_account_type = "Premium_LRS"
  # }

  # Network Interface
  network_interface_ids = [
    azurerm_network_interface.hackfestival_vm_nic.id,
  ]

  # Source Image Reference
  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts-gen2"
    version   = "latest"
  }
}

# Public IP for the VM
resource "azurerm_public_ip" "hackfestival_vm_ip" {
  name                = "hackfestival-vm-ip"
  location            = azurerm_resource_group.hackfestival_rg.location
  resource_group_name = azurerm_resource_group.hackfestival_rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

# Network Interface for the VM
resource "azurerm_network_interface" "hackfestival_vm_nic" {
  name                = "hackfestival-vm-nic"
  location            = azurerm_resource_group.hackfestival_rg.location
  resource_group_name = azurerm_resource_group.hackfestival_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.hackfestival_subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.hackfestival_vm_ip.id
  }

  
}





# Output the Search Service name
output "search_service_name" {
  value = azurerm_search_service.hackfestival_search.name
}
