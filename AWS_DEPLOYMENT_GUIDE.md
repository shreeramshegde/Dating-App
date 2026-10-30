# AWS EC2 Free Tier Deployment Guide - MeaowMatch Backend

This guide provides end-to-end instructions for deploying the **MeaowMatch Backend** container on an **AWS EC2 Free Tier** instance.

---

## 1. AWS EC2 Instance Creation

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Select your preferred region (e.g., `ap-south-1` (Mumbai), `us-east-1` (N. Virginia), etc.).
3. Navigate to **EC2** > **Instances** > **Launch instances**.
4. Configure the instance settings:
   - **Name**: `meaowmatch-backend`
   - **Application and OS Images (AMI)**: **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (64-bit x86).
   - **Instance type**: `t2.micro` (or `t3.micro` if eligible in your region) — **Free tier eligible** (750 hours/month).
   - **Key pair (login)**:
     - Click **Create new key pair**.
     - Name: `meaowmatch-ec2-key`.
     - Type: `RSA`, Private key format: `.pem`.
     - Download and save `meaowmatch-ec2-key.pem` on your local computer.
   - **Network settings (Security Group)**:
     - Choose **Create security group**.
     - Check **Allow SSH traffic from Anywhere (0.0.0.0/0)** (or My IP).
     - Check **Allow HTTP traffic from the internet**.
     - Check **Allow HTTPS traffic from the internet**.
   - **Configure storage**:
     - 1x **30 GiB gp3** root volume (AWS Free Tier includes up to 30 GB EBS).
5. Click **Launch instance**.

---

## 2. Configure EC2 Security Group (Port 8080)

Spring Boot runs on port `8080`. You must open inbound port `8080` in AWS:

1. In the EC2 Console, go to **Instances** and select your running instance.
2. In the bottom tabs, click **Security** > click the link under **Security groups** (`sg-xxxxxxxxx`).
3. Under **Inbound rules**, click **Edit inbound rules**.
4. Click **Add rule** and configure:
   - **Type**: `Custom TCP`
   - **Port range**: `8080`
   - **Source**: `0.0.0.0/0` (Anywhere-IPv4)
   - **Description**: `Spring Boot REST & STOMP WebSocket`
5. Click **Save rules**.

---

## 3. Connect to the EC2 Instance

On your local Linux/macOS machine, open your terminal:

```bash
# 1. Restrict permissions on the downloaded key pair (required by SSH)
chmod 400 ~/Downloads/meaowmatch-ec2-key.pem

# 2. Connect via SSH (replace with your EC2 Public IPv4 address)
ssh -i ~/Downloads/meaowmatch-ec2-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## 4. EC2 System Setup & 2GB Swap Space

`t2.micro` instances have 1 GB of RAM. Compiling Spring Boot or running Docker builds can exhaust memory. Adding a 2 GB swap file prevents Out-Of-Memory (OOM) crashes:

```bash
# Update Ubuntu packages
sudo apt update && sudo apt upgrade -y

# Configure 2GB Swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap is active
free -h
```

---

## 5. Install Docker & Docker Compose

Run the official Docker convenience script:

```bash
# Install Docker Engine & Compose plugin
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker ubuntu

# Apply new group membership
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## 6. Clone Repository & Setup Environment

```bash
# 1. Clone repository
git clone https://github.com/shreeramshegde/Dating-App.git
cd Dating-App

# 2. Create production environment file from template
cp .env.example .env.local

# 3. Edit .env.local with real credentials
nano .env.local
```

Inside `.env.local`, fill in your actual production values:
```properties
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# Neon Database Connection Pooling URL
SPRING_DATASOURCE_URL=jdbc:postgresql://<neon-hostname>:6543/neondb?sslmode=require
SPRING_DATASOURCE_USERNAME=<db-username>
SPRING_DATASOURCE_PASSWORD=<db-password>

# Neon S3-compatible Object Storage
AWS_ACCESS_KEY_ID=<your-neon-s3-access-key>
AWS_SECRET_ACCESS_KEY=<your-neon-s3-secret-key>
AWS_S3_ENDPOINT=https://storage.neon.tech
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=photos

# Security / JWT (Base64-encoded 256-bit secret)
JWT_SECRET=<your-base64-secret>
JWT_EXPIRATION_MS=86400000

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,*
```

Save with `Ctrl+O` -> `Enter` -> `Ctrl+X`.

---

## 7. Dynamic CORS Configuration (`update-cors.sh`)

Whenever your frontend teammate launches their frontend (locally, on Vercel/Netlify, or on another EC2 instance), run:

```bash
# Example with frontend IP:
./scripts/update-cors.sh 54.123.45.67

# Example with specific Vite port:
./scripts/update-cors.sh http://54.123.45.67:5173

# Example with domain:
./scripts/update-cors.sh https://dating-frontend.vercel.app
```

The script automatically:
1. Adds the frontend origin with HTTP, HTTPS, and wildcard port support.
2. Preserves localhost for local testing.
3. Automatically triggers `docker compose up -d` to restart the backend container with the updated CORS policy without downtime.

---

## 8. Launch the Backend Container

```bash
# Build and run container in detached mode
docker compose --env-file .env.local up -d --build

# Monitor startup logs
docker compose logs -f backend
```

Once you see:
```text
Started MeaowMatchApplication in X.XXX seconds
```
The backend is live! Press `Ctrl+C` to exit logs.

---

## 9. Verification & Live Endpoints

Test the endpoints directly from your browser or curl:

- **Health Check**:
  ```bash
  curl http://<YOUR_EC2_PUBLIC_IP>:8080/health
  # Expected Response: {"status":"UP","database":"CONNECTED","storage":"CONNECTED"}
  ```
- **Welcome / Root Endpoint**:
  ```bash
  curl http://<YOUR_EC2_PUBLIC_IP>:8080/
  ```
- **Interactive Swagger OpenAPI Documentation**:
  Visit in browser:
  `http://<YOUR_EC2_PUBLIC_IP>:8080/swagger-ui/index.html`

---

## 10. Frontend Connection Setup

Provide these parameters to your frontend teammate:

1. **REST Base URL**:
   ```env
   VITE_API_BASE_URL=http://<YOUR_EC2_PUBLIC_IP>:8080
   ```
2. **STOMP WebSocket URL**:
   ```text
   http://<YOUR_EC2_PUBLIC_IP>:8080/ws
   ```
   (Or `ws://<YOUR_EC2_PUBLIC_IP>:8080/ws` if using raw WebSockets).

---

## 11. AWS Dynamic IP Notes

- When you **Stop** and **Start** an EC2 instance, AWS assigns a new Public IPv4 address.
- When an IP change occurs:
  1. Note the new Public IPv4 address in the AWS EC2 Console.
  2. Share the new `VITE_API_BASE_URL=http://<NEW_EC2_IP>:8080` with your frontend teammate.
- *(Optional)*: AWS provides **1 Free Elastic IP** (static IP) per running EC2 instance under the Free Tier. As long as the Elastic IP remains attached to a running instance, it is free of charge.
