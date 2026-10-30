# AWS EC2 Free Tier Frontend Deployment Guide - MeaowMatch

This guide provides end-to-end instructions for deploying the **React + Vite + Nginx** MeaowMatch Frontend container on an **AWS EC2 Free Tier** instance.

---

## 1. AWS EC2 Instance Creation

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Select your AWS region (e.g., `ap-south-1` (Mumbai), `us-east-1` (N. Virginia), etc. — ideally the **same region** as your backend EC2 instance for lowest latency).
3. Navigate to **EC2** > **Instances** > **Launch instances**.
4. Configure the instance settings:
   - **Name**: `meaowmatch-frontend`
   - **Application and OS Images (AMI)**: **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (64-bit x86).
   - **Instance type**: `t2.micro` (or `t3.micro` if eligible in your region) — **Free tier eligible** (750 hours/month).
   - **Key pair (login)**:
     - Select your existing `meaowmatch-ec2-key` or click **Create new key pair** (`RSA`, `.pem`).
     - Save the `.pem` file on your local machine.
   - **Network settings (Security Group)**:
     - Choose **Create security group**.
     - Check **Allow SSH traffic from Anywhere (0.0.0.0/0)** (or My IP).
     - Check **Allow HTTP traffic from the internet**.
     - Check **Allow HTTPS traffic from the internet**.
   - **Configure storage**:
     - 1x **30 GiB gp3** root volume (AWS Free Tier includes up to 30 GB EBS).
5. Click **Launch instance**.

---

## 2. Configure EC2 Security Group (Port 3000 & Port 80)

The frontend container serves traffic on port **`3000`** (and optionally port `80`):

1. In the EC2 Console, go to **Instances** and select your running `meaowmatch-frontend` instance.
2. In the bottom panel, click **Security** > click the Security Group link (`sg-xxxxxxxxx`).
3. Under **Inbound rules**, click **Edit inbound rules**.
4. Verify or add the following inbound rules:

| Type | Port Range | Source | Description |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | `0.0.0.0/0` (or My IP) | SSH terminal administration |
| **Custom TCP** | `3000` | `0.0.0.0/0` | Frontend Web UI (Default port) |
| **HTTP** | `80` | `0.0.0.0/0` | Standard Web HTTP |
| **HTTPS** | `443` | `0.0.0.0/0` | Secure HTTPS |

5. Click **Save rules**.

---

## 3. Connect to the Frontend EC2 Instance

From your local machine terminal:

```bash
# 1. Set read-only permissions on key pair
chmod 400 ~/Downloads/meaowmatch-ec2-key.pem

# 2. Connect via SSH (replace with your Frontend EC2 Public IPv4)
ssh -i ~/Downloads/meaowmatch-ec2-key.pem ubuntu@<YOUR_FRONTEND_EC2_PUBLIC_IP>
```

---

## 4. EC2 System Setup & 2GB Swap Space

`t2.micro` instances have 1 GB of RAM. Running Vite's production TypeScript compilation and bundling inside Docker needs ~500 MB of peak memory. Setting up a 2 GB swap prevents Out-Of-Memory (OOM) errors during image builds:

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

Install Docker Engine and Docker Compose using the official convenience installer:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group (run docker without sudo)
sudo usermod -aG docker ubuntu

# Apply group membership
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## 6. Clone Repository

```bash
# 1. Clone repository
git clone https://github.com/shreeramshegde/Dating-App.git
cd Dating-App

# 2. Ensure you are on the main branch
git checkout main
```

---

## 7. Point Frontend to Backend (`update-backend-url.sh`)

Run the automated endpoint configuration script from the repository root with your **Backend EC2 Public IP**:

```bash
./scripts/update-backend-url.sh <YOUR_BACKEND_EC2_PUBLIC_IP>
```

*Example:*
```bash
./scripts/update-backend-url.sh 3.25.130.67
```

The script automatically:
1. Normalizes the address into REST API (`http://3.25.130.67:8080/api/v1`) and STOMP WebSocket (`http://3.25.130.67:8080/ws`) endpoints.
2. Writes/updates `frontend/.env.local`.
3. Clears any conflicting container name (`meaowmatch-frontend`) automatically.
4. Builds and launches the frontend container on port **`3000`** via Docker Compose.

---

## 8. Launch the Frontend Container Manually (Optional)

If you ran the script in Step 7, your container is **already running**!

If you prefer to start or restart it manually at any time:

### Option A: Using Docker Compose (Recommended)

```bash
# If a conflicting container exists, remove it first:
docker rm -f meaowmatch-frontend 2>/dev/null || true

cd frontend
docker compose up -d --build

# View live container startup logs:
docker compose logs -f
```

*(Press `Ctrl+C` to exit log streaming; the container continues running in the background).*

### Option B: Using Standalone Dockerfile

```bash
# Remove old container if running
docker rm -f meaowmatch-frontend 2>/dev/null || true

cd frontend

# Build image with injected backend endpoints
docker build \
  --build-arg VITE_API_BASE_URL="http://<YOUR_BACKEND_EC2_PUBLIC_IP>:8080/api/v1" \
  --build-arg VITE_WS_URL="http://<YOUR_BACKEND_EC2_PUBLIC_IP>:8080/ws" \
  -t meaowmatch-frontend .

# Run container on port 3000
docker run -d --name meaowmatch-frontend -p 3000:80 --restart unless-stopped meaowmatch-frontend
```

---

## 9. Crucial: Allow Frontend in Backend CORS

Now connect the two servers together! 

1. SSH into your **Backend EC2 instance**:
   ```bash
   ssh -i meaowmatch-ec2-key.pem ubuntu@<YOUR_BACKEND_EC2_PUBLIC_IP>
   ```
2. Run the backend CORS update script with your **Frontend EC2 Public IP**:
   ```bash
   cd Dating-App
   ./scripts/update-cors.sh <YOUR_FRONTEND_EC2_PUBLIC_IP>
   ```

*Example:*
```bash
./scripts/update-cors.sh 13.235.77.10
```

The backend container will automatically reload its CORS configuration to accept requests from your frontend.

---

## 10. Verification & Live App Access

Open your web browser and navigate to:

👉 **`http://<YOUR_FRONTEND_EC2_PUBLIC_IP>:3000`**

### What to Verify:
1. **Target Backend Indicator**:
   - In the top navbar, click the server icon / settings.
   - Confirm the target backend displays `http://<YOUR_BACKEND_EC2_PUBLIC_IP>:8080/api/v1`.
2. **Account Creation & User Roles**:
   - Register choosing your role: **Adopter**, **Rehomer**, or **Rescuer**.
   - Create a test account (e.g. `adopter@example.com` / `password123`).
3. **Pet Listings & Photos**:
   - Add a pet profile (Dogs, Cats, Birds, Reptiles, Small Animals) with pre-signed S3 photos.
   - Specify species, age, breed, gender, and listing type (Adoption / Foster / Rescue Alert).
4. **Discovery & Real-Time Coordination Chat**:
   - Adopters discover and swipe on pet cards.
   - Rescuers view emergency rescue alerts nearby.
   - When an adoption match or rescue response is initiated, verify real-time messaging over STOMP WebSockets (`ws://`).

---

## 11. Updating Frontend When Code Changes

Whenever you push new frontend code to GitHub:

```bash
cd ~/Dating-App
git pull origin main
cd frontend
docker compose up -d --build
```
Vite will rebuild the production bundle and Nginx will seamlessly reload in under 15 seconds.

---

## 12. Dynamic IP Handling (When EC2 Restarts)

If either EC2 instance is stopped and restarted, AWS assigns new dynamic Public IPv4 addresses:

1. **If Backend IP changes**:
   On Frontend EC2:
   ```bash
   cd ~/Dating-App
   ./scripts/update-backend-url.sh <NEW_BACKEND_EC2_IP>
   ```
2. **If Frontend IP changes**:
   On Backend EC2:
   ```bash
   cd ~/Dating-App
   ./scripts/update-cors.sh <NEW_FRONTEND_EC2_IP>
   ```
