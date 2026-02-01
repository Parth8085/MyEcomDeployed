# Deployment Troubleshooting: Part 12 (The Azure Gate is Locked)

## 🔒 Confirmed: The Door is Bolt-Locked
Your `Test-NetConnection` failed. This proves the issue is **NOT** related to your code, Docker, or database password.
The issue is purely **Network configuration**. The packet is hitting a wall before it enters the VM.

## 🛠 Fix The Azure Firewall (NSG)

The issue is 99% likely in the **Azure Portal**.

1. **Go to Azure Portal** -> Select your **VM**.
2. Click **Networking** (left sidebar).
3. Look at the **Inbound port rules** list.
4. **Delete any existing 3306 rule** (to start fresh) or Click **Add inbound port rule** if missing.
5. **ENTER EXACTLY THIS:**
   - **Source**: `Any`
   - **Source port ranges**: `*`
   - **Destination**: `Any`
   - **Service**: `Custom`
   - **Destination port ranges**: `3306`
   - **Protocol**: `TCP`
   - **Action**: `Allow`
   - **Priority**: `300` (Make sure this number is **smaller** than the "Deny all" rule at the bottom, which is usually 65500).
   - **Name**: `ForceMySQLOpen`
6. Click **Add**.

## 🔄 Verify Again
Wait 30 seconds after adding the rule.
Run the PowerShell command on your PC again:
```powershell
Test-NetConnection -ComputerName 134.149.96.6 -Port 3306
```
**Do not proceed until this says `TcpTestSucceeded : True`**.
If this fails, the Web App will definitely fail.
