#!/bin/bash

# Test DNS Resolution from Multiple Regions
# This script uses public DNS checking services to verify global DNS propagation

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Domains to test
DOMAINS=(
    "p57.birfoiz.uz"
    "protokol.1foiz.com" 
    "srv852801.hstgr.cloud"
    "p57.uz"
)

# Expected IP
EXPECTED_IP="69.62.126.73"

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "success")
            echo -e "${GREEN}✓${NC} $message"
            ;;
        "error")
            echo -e "${RED}✗${NC} $message"
            ;;
        "warning")
            echo -e "${YELLOW}⚠${NC} $message"
            ;;
        "info")
            echo -e "${BLUE}ℹ${NC} $message"
            ;;
    esac
}

# Function to test DNS using DNS checker APIs
test_dns_propagation() {
    local domain=$1
    
    echo -e "\n${BLUE}Testing DNS propagation for: $domain${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Test using different public DNS servers around the world
    local dns_servers=(
        "8.8.8.8:US-Google"
        "1.1.1.1:US-Cloudflare"
        "9.9.9.9:CH-Quad9"
        "208.67.222.222:US-OpenDNS"
        "8.26.56.26:US-Comodo"
        "77.88.8.8:RU-Yandex"
        "180.76.76.76:CN-Baidu"
        "1.2.4.8:CN-CNNIC"
        "101.226.4.6:CN-DNSPod"
        "168.95.1.1:TW-HiNet"
        "203.248.252.2:KR-LGU+"
        "164.124.101.2:JP-SoftBank"
        "203.119.26.12:AU-Telstra"
        "200.221.11.100:BR-Telefonica"
        "217.218.127.127:DE-Privacy"
        "193.110.81.9:UK-BT"
        "196.213.41.107:ZA-Internet-Solutions"
    )
    
    local total=0
    local success=0
    local failures=()
    
    for server_info in "${dns_servers[@]}"; do
        IFS=':' read -r server location <<< "$server_info"
        total=$((total + 1))
        
        printf "%-30s" "  $location ($server):"
        
        # Query DNS server
        local result=$(dig +short @"$server" "$domain" A 2>/dev/null | head -n1)
        
        if [[ -z "$result" ]]; then
            echo -e "${RED}No response${NC}"
            failures+=("$location: No response")
        elif [[ "$result" == "$EXPECTED_IP" ]]; then
            echo -e "${GREEN}$result ✓${NC}"
            success=$((success + 1))
        else
            echo -e "${YELLOW}$result (unexpected)${NC}"
            failures+=("$location: Resolved to $result")
        fi
    done
    
    # Summary
    echo
    local percentage=$((success * 100 / total))
    if [[ $percentage -ge 90 ]]; then
        print_status "success" "Global propagation: ${percentage}% (${success}/${total})"
    elif [[ $percentage -ge 70 ]]; then
        print_status "warning" "Partial propagation: ${percentage}% (${success}/${total})"
    else
        print_status "error" "Poor propagation: ${percentage}% (${success}/${total})"
    fi
    
    # Show failures if any
    if [[ ${#failures[@]} -gt 0 ]]; then
        echo -e "\n${YELLOW}Failed regions:${NC}"
        for failure in "${failures[@]}"; do
            echo "  - $failure"
        done
    fi
}

# Function to test using online DNS propagation checker
test_online_checker() {
    local domain=$1
    
    echo -e "\n${BLUE}Online DNS propagation checkers:${NC}"
    echo "  1. https://www.whatsmydns.net/#A/$domain"
    echo "  2. https://dnschecker.org/all-dns-records-of-domain.php?query=$domain&rtype=A"
    echo "  3. https://mxtoolbox.com/SuperTool.aspx?action=a%3a$domain"
    echo "  4. https://www.nslookup.io/domains/$domain/dns-records/"
}

# Function to check DNS response times
check_response_times() {
    local domain=$1
    
    echo -e "\n${BLUE}DNS response times for: $domain${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    local servers=("8.8.8.8" "1.1.1.1" "9.9.9.9")
    
    for server in "${servers[@]}"; do
        printf "  %-15s: " "$server"
        
        # Measure DNS query time
        local start_time=$(date +%s%N)
        dig +short @"$server" "$domain" A >/dev/null 2>&1
        local end_time=$(date +%s%N)
        
        local elapsed=$(( (end_time - start_time) / 1000000 ))
        
        if [[ $elapsed -lt 50 ]]; then
            echo -e "${GREEN}${elapsed}ms ✓${NC}"
        elif [[ $elapsed -lt 200 ]]; then
            echo -e "${YELLOW}${elapsed}ms${NC}"
        else
            echo -e "${RED}${elapsed}ms${NC}"
        fi
    done
}

# Function to generate report
generate_report() {
    local report_file="/tmp/dns-regional-test-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== DNS Regional Test Report ==="
        echo "Generated: $(date)"
        echo "Expected IP: $EXPECTED_IP"
        echo ""
        
        for domain in "${DOMAINS[@]}"; do
            echo "Domain: $domain"
            echo "------------------------"
            
            # Quick propagation check
            local results=()
            for server in "8.8.8.8" "1.1.1.1" "9.9.9.9" "208.67.222.222"; do
                local ip=$(dig +short @"$server" "$domain" A 2>/dev/null | head -n1)
                results+=("$server=$ip")
            done
            
            printf '%s\n' "${results[@]}"
            echo ""
        done
        
        echo "Recommendations:"
        echo "1. If propagation is incomplete, wait 24-48 hours"
        echo "2. Ensure TTL is set to 300 seconds for faster updates"
        echo "3. Check with DNS provider for any issues"
        echo "4. Consider using multiple DNS providers for redundancy"
        
    } > "$report_file"
    
    print_status "info" "Report saved to: $report_file"
}

# Main execution
main() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}    DNS Regional Testing Tool${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo
    print_status "info" "Testing DNS resolution from multiple regions worldwide"
    
    # Check prerequisites
    if ! command -v dig &> /dev/null; then
        print_status "error" "dig command not found. Please install dnsutils/bind-utils"
        exit 1
    fi
    
    # Test each domain
    for domain in "${DOMAINS[@]}"; do
        test_dns_propagation "$domain"
        check_response_times "$domain"
        test_online_checker "$domain"
    done
    
    # Generate report
    echo
    generate_report
    
    # Final recommendations
    echo -e "\n${BLUE}Summary & Recommendations${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo
    echo "1. ${YELLOW}For users experiencing issues:${NC}"
    echo "   - Switch to public DNS (8.8.8.8 or 1.1.1.1)"
    echo "   - Use backup domains if primary fails"
    echo "   - Clear browser and DNS cache"
    echo
    echo "2. ${YELLOW}For administrators:${NC}"
    echo "   - Monitor DNS propagation after changes"
    echo "   - Keep TTL low (300s) during migrations"
    echo "   - Have backup domains on different providers"
    echo "   - Set up automated monitoring"
    echo
    echo "3. ${YELLOW}If propagation is poor:${NC}"
    echo "   - Contact DNS provider support"
    echo "   - Check for DNSSEC issues"
    echo "   - Verify nameserver configuration"
    echo "   - Consider using a CDN for better global reach"
}

# Run main function
main "$@"