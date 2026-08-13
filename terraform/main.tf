terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
    }
  }
}

# Provider

provider "aws" {
  region = var.aws_region
}

# Variables

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ssh_cidr" {
  description = "CIDR block allowed to SSH into the EC2 instance"
  type        = string
  default = "0.0.0.0/0"
}

variable "key_name" {
  description = "Name of the existing AWS EC2 Key Pair"
  type        = string
}

variable "instance_name" {
  description = "Name tag for the EC2 instance"
  type        = string
  default     = "my-app-server"
}

# Data Sources

data "aws_ami" "ubuntu" {
  most_recent = true

  owners = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

# Security Group

resource "aws_security_group" "web" {
  name        = "${var.instance_name}-sg"
  description = "Security group for web application EC2 instance"

  # SSH

  ingress {
    description = "SSH from trusted IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  # HTTP

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.instance_name}-sg"
  }
}

# EC2 Instance

resource "aws_instance" "app" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [
    aws_security_group.web.id
  ]

  # Root volume

  root_block_device {
    volume_size = 20
    volume_type = "gp3"

    delete_on_termination = true
  }

  tags = {
    Name = var.instance_name
  }
}

# Elastic IP

resource "aws_eip" "app" {
  domain = "vpc"

  tags = {
    Name = "${var.instance_name}-eip"
  }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}

# Outputs

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "instance_public_ip" {
  description = "Elastic IP address assigned to the EC2 instance"
  value       = aws_eip.app.public_ip
}

output "instance_public_dns" {
  description = "EC2 public DNS"
  value       = aws_instance.app.public_dns
}

output "ssh_command" {
  description = "SSH command"
  value       = "ssh -i YOUR_KEY.pem ubuntu@${aws_eip.app.public_ip}"
}

output "ubuntu_ami_id" {
  description = "Ubuntu 22.04 AMI ID used by the instance"
  value       = data.aws_ami.ubuntu.id
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.web.id
}