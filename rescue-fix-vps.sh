#!/bin/bash
# VPS Rescue Mode Recovery Script
# Created: 2025-07-21

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}=== VPS RESCUE MODE RECOVERY SCRIPT ===${NC}"
echo -e "Server IP: ${BLUE}69.62.126.73${NC}"
echo -e "Temp Password: ${BLUE}Kechirasiz21${NC}"
echo ""

echo -e "${GREEN}STEP 1: Connect to VPS in Rescue Mode${NC}"
echo "Run this command in a new terminal:"
echo -e "${BLUE}ssh root@69.62.126.73${NC}"
echo "Password: Kechirasiz21"
echo ""

echo -e "${GREEN}STEP 2: Once Connected, Run These Commands:${NC}"
echo ""

cat << 'EOF'
# 1. Find and mount your main filesystem
echo "=== Finding main filesystem ==="
fdisk -l
# Look for your main partition (usually /dev/sda1 or /dev/vda1)

# 2. Mount the filesystem
echo "=== Mounting filesystem ==="
mkdir -p /mnt/rescue
mount /dev/sda1 /mnt/rescue  # Or /dev/vda1 depending on fdisk output

# 3. Check SSH configuration
echo "=== Checking SSH configuration ==="
cat /mnt/rescue/etc/ssh/sshd_config | grep -E "Port|PermitRootLogin|PasswordAuthentication"

# 4. Fix SSH if needed
echo "=== Fixing SSH configuration ==="
cat > /mnt/rescue/etc/ssh/sshd_config.d/rescue.conf << 'SSHCONF'
Port 22
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
SSHCONF

# 5. Check and disable firewall
echo "=== Checking firewall status ==="
chroot /mnt/rescue /bin/bash << 'CHROOT'
# Check UFW status
ufw status
# Disable UFW
ufw disable
# Check iptables
iptables -L -n
# Clear iptables if needed
iptables -F
iptables -X
iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
exit
CHROOT

# 6. Check fail2ban
echo "=== Checking fail2ban ==="
if [ -f /mnt/rescue/etc/fail2ban/jail.conf ]; then
    # Temporarily disable fail2ban
    mv /mnt/rescue/etc/fail2ban/jail.conf /mnt/rescue/etc/fail2ban/jail.conf.backup
    echo "Fail2ban temporarily disabled"
fi

# 7. Check network configuration
echo "=== Checking network configuration ==="
cat /mnt/rescue/etc/netplan/*.yaml 2>/dev/null || echo "No netplan config found"
cat /mnt/rescue/etc/network/interfaces 2>/dev/null || echo "No interfaces config found"

# 8. Ensure SSH service is enabled
echo "=== Ensuring SSH service is enabled ==="
chroot /mnt/rescue /bin/bash << 'CHROOT'
systemctl enable ssh
systemctl enable sshd
exit
CHROOT

# 9. Check recent logs for issues
echo "=== Recent system logs ==="
chroot /mnt/rescue /bin/bash << 'CHROOT'
journalctl -xe --since "2 hours ago" | grep -E "ssh|fail2ban|firewall|network" | tail -20
exit
CHROOT

# 10. Fix Docker if needed
echo "=== Checking Docker ==="
if [ -d /mnt/rescue/opt/protokol57 ]; then
    echo "Protokol57 directory found"
    ls -la /mnt/rescue/opt/protokol57/
fi

echo ""
echo "=== RECOVERY COMPLETE ==="
echo "Exit rescue mode and reboot:"
echo "1. Type 'exit' to leave chroot"
echo "2. Type 'reboot' to restart the VPS"
echo ""
echo "After reboot, the VPS should be accessible via SSH again."
EOF

echo ""
echo -e "${YELLOW}=== MANUAL STEPS ===${NC}"
echo "1. Copy and paste the commands above into your SSH session"
echo "2. After running all commands, exit rescue mode"
echo "3. Ask Hostinger support to boot the VPS normally"
echo ""
echo -e "${RED}IMPORTANT:${NC} Save this output before proceeding!"