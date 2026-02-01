# 📦 Best Way to Deploy MySQL (No Docker)

Since you want to avoid the Docker/Firewall complexity, here are the two best options. **Option 1 is the Industry Standard "Best Way"** for Azure.

---

## 🏆 Option 1: Azure Database for MySQL (Recommended)
**Why?** It is a managed service. Microsoft handles the network, backups, and up-time. You just click "Allow Azure Services" and it works.

### 1. Create the Database
1. Go to **Azure Portal** -> Create a resource -> **"Azure Database for MySQL - Flexible Server"**.
2. **Basics**:
   - Resource Group: Same as your Web App.
   - Name: `smartkart-db-production` (example).
   - Region: Same as your Web App (Canada Central).
   - Workload type: **Development** (cheapest) or **Production**.
3. **Authentication**:
   - Create a username (e.g., `adminuser`) and password. **Write these down.**
4. **Networking (Crucial Step)**:
   - Connectivity method: **Public access (allowed IP addresses)**.
   - **Check the box**: `Allow public access from any Azure service within Azure to this server`.
     - *This single checkbox solves 100% of the connection issues you just faced.*
   - Click **Add current client IP address** (so you can connect from your home PC to upload data).
5. Review + Create. (Takes ~5-10 mins).

### 2. Connect Your Web App
1. Go to your **Azure Web App** -> **Environment variables**.
2. Update `DefaultConnection`:
   ```text
   Server=smartkart-db-production.mysql.database.azure.com;Port=3306;Database=ecommerce_db;User=adminuser;Password=<your_password>;
   ```
3. Save & Restart.

### 3. Import Your Data
1. Open **MySQL Workbench** on your Local PC.
2. Connect to the new Azure Database URL.
3. Open your Script/Dump file and run it.

---

## 💻 Option 2: Install Native MySQL on your VM
**Why?** You already paid for the VM. This removes Docker "bridge network" issues but keeps the Firewall requirements.

### 1. Install MySQL Server
1. RDP into your VM.
2. Download **MySQL Installer for Windows** (community).
3. Run the installer -> Select **Server Only**.
4. **Config Type**: Server Computer.
5. **Port**: 3306.
6. **Authentication**: Set a specific Root Password.
7. **Windows Service**: Keep defaults.

### 2. Open Firewall (Standard)
Since it's a VM, you *still* need to do the firewall steps, but they are simpler without Docker:
1. **VM Internal**: Search "Windows Defender Firewall with Advanced Security" -> Inbound Rules -> New Rule -> Port -> 3306 -> Allow.
2. **Azure Portal**: VM -> Networking -> Add Inbound Rule -> 3306 -> Allow.

### 3. Connect User
You might need to create a user that allows remote access:
```sql
CREATE USER 'remote_user'@'%' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON *.* TO 'remote_user'@'%';
FLUSH PRIVILEGES;
```
---

## 💡 Recommendation
Use **Option 1 (Azure Database for MySQL)**. It costs a little more than a raw VM, but it saves hours of debugging firewalls and is much more stable for a production app.
