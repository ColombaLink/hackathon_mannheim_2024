#!/bin/bash
set -e

export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)

terraform init
terraform plan -out=plan.out -var="AZURE_SUBSCRIPTION_ID=${ARM_SUBSCRIPTION_ID}" 

read -p "Are you sure you want to apply the changes? (yes/no): " response

if [[ $response == "yes" ]]; then
  # TF_LOG=debug terraform apply plan.out
  terraform apply plan.out
else
  echo "Aborted. No changes will be applied."
fi
