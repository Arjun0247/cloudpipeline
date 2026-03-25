# ── Provider ──────────────────────────────────────────────────────────────────
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }

  # Remote state — store in Azure Blob so CI/CD can access it
  # Uncomment after creating the storage account manually (one-time setup)
  # backend "azurerm" {
  #   resource_group_name  = "cloudpipeline-tfstate-rg"
  #   storage_account_name = "cloudpipelinetfstate"
  #   container_name       = "tfstate"
  #   key                  = "prod.terraform.tfstate"
  # }
}

provider "azurerm" {
  features {}
}

# ── Variables ──────────────────────────────────────────────────────────────────
variable "location" {
  description = "Azure region"
  default     = "East Asia"   # closest to India with free tier support
}

variable "resource_group_name" {
  description = "Resource group for all CloudPipeline resources"
  default     = "cloudpipeline-rg"
}

variable "dockerhub_username" {
  description = "DockerHub username for pulling images"
  type        = string
}

# ── Resource Group ─────────────────────────────────────────────────────────────
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    project     = "CloudPipeline"
    environment = "production"
    managed_by  = "terraform"
  }
}

# ── App Service Plan (Free tier F1) ───────────────────────────────────────────
resource "azurerm_service_plan" "main" {
  name                = "cloudpipeline-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "F1"   # Free tier — change to B1 for production
}

# ── Backend Web App (Node.js API) ──────────────────────────────────────────────
resource "azurerm_linux_web_app" "server" {
  name                = "cloudpipeline-server-api"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = false   # must be false on Free tier

    application_stack {
      docker_image_name   = "${var.dockerhub_username}/cloudpipeline-server:latest"
      docker_registry_url = "https://index.docker.io"
    }

    health_check_path                 = "/health"
    health_check_eviction_time_in_min = 2
  }

  app_settings = {
    NODE_ENV                     = "production"
    PORT                         = "5000"
    WEBSITES_PORT                = "5000"
    DOCKER_REGISTRY_SERVER_URL   = "https://index.docker.io"
  }

  tags = azurerm_resource_group.main.tags
}

# ── Frontend Web App (React + Nginx) ──────────────────────────────────────────
resource "azurerm_linux_web_app" "client" {
  name                = "cloudpipeline-client-app"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = false

    application_stack {
      docker_image_name   = "${var.dockerhub_username}/cloudpipeline-client:latest"
      docker_registry_url = "https://index.docker.io"
    }
  }

  app_settings = {
    REACT_APP_API_URL            = "https://cloudpipeline-server-api.azurewebsites.net"
    WEBSITES_PORT                = "80"
    DOCKER_REGISTRY_SERVER_URL   = "https://index.docker.io"
  }

  tags = azurerm_resource_group.main.tags
}

# ── Outputs ───────────────────────────────────────────────────────────────────
output "server_url" {
  description = "Backend API URL"
  value       = "https://${azurerm_linux_web_app.server.default_hostname}"
}

output "client_url" {
  description = "Frontend app URL"
  value       = "https://${azurerm_linux_web_app.client.default_hostname}"
}

output "health_check_url" {
  description = "API health check endpoint"
  value       = "https://${azurerm_linux_web_app.server.default_hostname}/health"
}
