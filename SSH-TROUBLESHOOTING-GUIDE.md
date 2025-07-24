# SSH Troubleshooting Guide - Restore Access via Browser Terminal

This guide helps you systematically troubleshoot and restore SSH access when you can only access the server through a browser-based terminal.

## Prerequisites
- Access to browser-based terminal (e.g., VPS provider's console)
- Root or sudo privileges
- Basic understanding of Linux commands

## Step 1: Check SSH Service Status

First, verify if the SSH service is running:

```bash
# Check SSH service status
systemctl status ssh
# or on some systems:
systemctl status sshd

# If SSH is not running, start it:
systemctl start ssh
# or:
systemctl start sshd

# Enable SSH to start on boot:
systemctl enable ssh
# or:
systemctl enable sshd

# If the service fails to start, check for errors:
journalctl -u ssh -n 50
# or:
journalctl -u sshd -n 50
```

## Step 2: Verify SSH Configuration

Check the SSH configuration file for any issues:

```bash
# Test SSH configuration syntax
sshd -t

# View SSH configuration
cat /etc/ssh/sshd_config | grep -v "^#" | grep -v "^$"

# Check critical settings:
grep -E "^Port|^PermitRootLogin|^PubkeyAuthentication|^PasswordAuthentication|^ListenAddress" /etc/ssh/sshd_config

# Common issues to look for:
# - Port (default is 22)
# - PermitRootLogin (yes/no/prohibit-password)
# - PubkeyAuthentication yes
# - PasswordAuthentication (yes/no depending on your setup)
# - ListenAddress (0.0.0.0 or specific IP)
```

## Step 3: Check if SSH is Listening

Verify SSH is listening on the expected port:

```bash
# Check listening ports
netstat -tlnp | grep ssh
# or:
ss -tlnp | grep ssh

# Alternative method:
lsof -i :22
# or for custom port:
lsof -i :YOUR_SSH_PORT

# Check all listening services
netstat -tlnp
# or:
ss -tlnp
```

## Step 4: Verify Firewall Rules

Check if firewall is blocking SSH:

### For UFW (Ubuntu/Debian):
```bash
# Check UFW status
ufw status verbose

# Allow SSH if not already allowed
ufw allow 22/tcp
# or for custom port:
ufw allow YOUR_SSH_PORT/tcp

# If UFW is blocking everything, temporarily disable it for testing
ufw disable
# Remember to re-enable after fixing!
```

### For iptables:
```bash
# List all rules
iptables -L -n -v

# Check INPUT chain for SSH rules
iptables -L INPUT -n -v | grep -E "22|ssh"

# Add SSH allow rule if missing
iptables -I INPUT -p tcp --dport 22 -j ACCEPT

# Save iptables rules
# Debian/Ubuntu:
iptables-save > /etc/iptables/rules.v4
# CentOS/RHEL:
service iptables save
```

### For firewalld (CentOS/RHEL):
```bash
# Check status
firewall-cmd --state

# List all rules
firewall-cmd --list-all

# Add SSH service
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

# Or add specific port
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --reload
```

## Step 5: Check SSH Logs

Examine logs for connection attempts and errors:

```bash
# View recent SSH logs
tail -n 100 /var/log/auth.log | grep -i ssh
# or on CentOS/RHEL:
tail -n 100 /var/log/secure | grep -i ssh

# Follow logs in real-time (run this while attempting SSH)
tail -f /var/log/auth.log
# or:
journalctl -f -u ssh

# Check for specific errors
grep -i "error\|fail\|deny\|refuse" /var/log/auth.log | tail -50
```

## Step 6: Check Security Tools

### Fail2ban:
```bash
# Check if fail2ban is running
systemctl status fail2ban

# Check banned IPs
fail2ban-client status
fail2ban-client status sshd

# Unban specific IP
fail2ban-client set sshd unbanip YOUR_IP_ADDRESS

# Temporarily stop fail2ban for testing
systemctl stop fail2ban
```

### DenyHosts:
```bash
# Check if DenyHosts is installed
systemctl status denyhosts

# Check blocked hosts
cat /etc/hosts.deny

# Remove your IP from blocked list
sed -i '/YOUR_IP_ADDRESS/d' /etc/hosts.deny

# Restart DenyHosts
systemctl restart denyhosts
```

## Step 7: Test Network Connectivity

Verify network connectivity and DNS:

```bash
# Check network interfaces
ip addr show
# or:
ifconfig -a

# Check routing table
ip route show
# or:
route -n

# Test external connectivity
ping -c 4 8.8.8.8

# Check DNS resolution
nslookup google.com
# or:
dig google.com

# Check if you can reach yourself
ping -c 4 localhost
```

## Step 8: Advanced Diagnostics

### Check for SSH key issues:
```bash
# Check SSH key permissions
ls -la ~/.ssh/

# Fix permissions if needed
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# Check authorized_keys file
cat ~/.ssh/authorized_keys

# Check for SSH agent issues
ssh-add -l
```

### Test SSH locally:
```bash
# Test SSH connection to localhost
ssh -v localhost

# Test with specific key
ssh -v -i ~/.ssh/id_rsa localhost

# Very verbose output for debugging
ssh -vvv localhost
```

### Check system resources:
```bash
# Check disk space
df -h

# Check memory
free -m

# Check system load
uptime

# Check for zombie processes
ps aux | grep defunct
```

## Step 9: Emergency Recovery Actions

If all else fails, try these recovery steps:

### 1. Backup current SSH config:
```bash
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)
```

### 2. Create minimal working config:
```bash
cat > /etc/ssh/sshd_config.emergency << 'EOF'
Port 22
ListenAddress 0.0.0.0
Protocol 2
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key
PermitRootLogin yes
PubkeyAuthentication yes
PasswordAuthentication yes
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
EOF

# Test the emergency config
sshd -t -f /etc/ssh/sshd_config.emergency

# If test passes, use it
mv /etc/ssh/sshd_config.emergency /etc/ssh/sshd_config
systemctl restart ssh
```

### 3. Add emergency SSH key:
```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add a temporary SSH key (replace with your actual public key)
echo "YOUR_PUBLIC_SSH_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 4. Reset firewall to allow all (TEMPORARY):
```bash
# WARNING: This opens all ports - use only for emergency recovery
# UFW
ufw --force reset
ufw allow 22

# iptables
iptables -F
iptables -X
iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD ACCEPT
```

## Step 10: Verification Checklist

After making changes, verify:

```bash
# 1. SSH service is running
systemctl status ssh | grep "active (running)"

# 2. SSH is listening on expected port
netstat -tlnp | grep :22

# 3. No firewall blocking
ufw status | grep 22

# 4. No fail2ban blocks
fail2ban-client status sshd | grep "Currently banned" | wc -l

# 5. Test SSH locally
ssh localhost -p 22 echo "SSH Works Locally"

# 6. Check from browser terminal that external SSH should work
curl -I http://ipinfo.io/ip 2>/dev/null | grep -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}'
```

## Common Issues and Solutions

### Issue: "Connection refused"
- SSH service not running → Start SSH service
- Wrong port → Check sshd_config for Port setting
- Firewall blocking → Add firewall rule

### Issue: "Connection timeout"
- Network connectivity issue → Check routing and firewall
- SSH not listening on external interface → Check ListenAddress
- Cloud provider firewall → Check VPS control panel

### Issue: "Permission denied"
- Wrong credentials → Verify username/password/key
- Root login disabled → Check PermitRootLogin
- Key permissions wrong → Fix with chmod commands

### Issue: "Host key verification failed"
- Known hosts conflict → Remove old entry from ~/.ssh/known_hosts
- SSH key changed → Update or regenerate keys

## Final Notes

1. **Always backup** configuration files before making changes
2. **Test changes** locally before applying to remote connections
3. **Keep browser terminal open** until SSH access is restored
4. **Document changes** made for future reference
5. **Set up monitoring** to alert on SSH service failures

## Emergency Contacts

If you cannot restore access:
1. Contact your VPS provider support
2. Request KVM/console access
3. Consider requesting a server reboot in rescue mode
4. As last resort, request root password reset

---

Remember: The browser terminal is your lifeline. Don't close it until you've verified SSH access is fully restored from your local machine!