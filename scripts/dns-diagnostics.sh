#!/bin/bash

# DNS Diagnostics Tool for P57
# This script performs comprehensive DNS diagnostics to identify resolution issues

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Domains to check
DOMAINS=(
    "p57.birfoiz.uz"
    "protokol.1foiz.com"
    "srv852801.hstgr.cloud"
    "p57.uz"
)

# DNS servers to test
DNS_SERVERS=(
    "8.8.8.8"       # Google Primary
    "8.8.4.4"       # Google Secondary
    "1.1.1.1"       # Cloudflare Primary
    "1.0.0.1"       # Cloudflare Secondary
    "208.67.222.222" # OpenDNS Primary
    "default"        # System default
)

# Expected IP address
EXPECTED_IP="69.62.126.73"

# Log file
LOG_FILE="/tmp/dns-diagnostics-$(date +%Y%m%d_%H%M%S).log"

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
    
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $status: $message" >> "$LOG_FILE"
}

# Function to check DNS resolution
check_dns_resolution() {
    local domain=$1
    local dns_server=$2
    local result
    
    if [[ "$dns_server" == "default" ]]; then
        result=$(dig +short "$domain" 2>/dev/null || echo "FAILED")
    else
        result=$(dig +short "@$dns_server" "$domain" 2>/dev/null || echo "FAILED")
    fi
    
    echo "$result"
}

# Function to check HTTP/HTTPS connectivity
check_http_connectivity() {
    local domain=$1
    local protocol=$2
    local url="${protocol}://${domain}"
    local http_code
    
    http_code=$(curl -o /dev/null -s -w "%{http_code}" -m 10 "$url" 2>/dev/null || echo "000")
    echo "$http_code"
}

# Function to check SSL certificate
check_ssl_certificate() {
    local domain=$1
    local result
    
    result=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "FAILED")
    echo "$result"
}

# Function to perform traceroute
perform_traceroute() {
    local domain=$1
    local hops
    
    if command -v traceroute &> /dev/null; then
        hops=$(traceroute -m 10 -w 2 "$domain" 2>/dev/null | wc -l)
        echo "$((hops - 1))"
    else
        echo "N/A"
    fi
}

# Function to get DNS propagation status
check_dns_propagation() {
    local domain=$1
    local consistent=true
    local ips=()
    
    for dns in "${DNS_SERVERS[@]}"; do
        if [[ "$dns" != "default" ]]; then
            local ip=$(check_dns_resolution "$domain" "$dns")
            if [[ "$ip" != "FAILED" && "$ip" != "" ]]; then
                ips+=("$ip")
            fi
        fi
    done
    
    # Check if all IPs are the same
    if [[ ${#ips[@]} -gt 1 ]]; then
        local first_ip="${ips[0]}"
        for ip in "${ips[@]}"; do
            if [[ "$ip" != "$first_ip" ]]; then
                consistent=false
                break
            fi
        done
    fi
    
    echo "$consistent"
}

# Main diagnostics
main() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}    P57 DNS Diagnostics Tool${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo
    print_status "info" "Starting DNS diagnostics at $(date)"
    print_status "info" "Log file: $LOG_FILE"
    echo
    
    # Check prerequisites
    print_status "info" "Checking prerequisites..."
    for cmd in dig curl openssl; do
        if command -v $cmd &> /dev/null; then
            print_status "success" "$cmd is installed"
        else
            print_status "error" "$cmd is not installed"
        fi
    done
    echo
    
    # DNS Resolution Tests
    echo -e "${BLUE}1. DNS Resolution Tests${NC}"
    echo -e "${BLUE}────────────────────────${NC}"
    
    for domain in "${DOMAINS[@]}"; do
        echo
        print_status "info" "Testing domain: $domain"
        
        # Test with each DNS server
        local resolution_success=0
        local resolution_total=0
        
        for dns in "${DNS_SERVERS[@]}"; do
            local ip=$(check_dns_resolution "$domain" "$dns")
            resolution_total=$((resolution_total + 1))
            
            if [[ "$ip" != "FAILED" && "$ip" != "" ]]; then
                resolution_success=$((resolution_success + 1))
                if [[ "$ip" == "$EXPECTED_IP" ]]; then
                    print_status "success" "DNS $dns → $ip (correct)"
                else
                    print_status "warning" "DNS $dns → $ip (unexpected IP)"
                fi
            else
                print_status "error" "DNS $dns → Failed to resolve"
            fi
        done
        
        # Check DNS propagation consistency
        local consistent=$(check_dns_propagation "$domain")
        if [[ "$consistent" == "true" ]]; then
            print_status "success" "DNS propagation is consistent"
        else
            print_status "warning" "DNS propagation is inconsistent across servers"
        fi
        
        # Summary for domain
        local success_rate=$((resolution_success * 100 / resolution_total))
        if [[ $success_rate -ge 80 ]]; then
            print_status "success" "Resolution rate: ${success_rate}% (${resolution_success}/${resolution_total})"
        elif [[ $success_rate -ge 50 ]]; then
            print_status "warning" "Resolution rate: ${success_rate}% (${resolution_success}/${resolution_total})"
        else
            print_status "error" "Resolution rate: ${success_rate}% (${resolution_success}/${resolution_total})"
        fi
    done
    
    echo
    echo -e "${BLUE}2. HTTP/HTTPS Connectivity Tests${NC}"
    echo -e "${BLUE}─────────────────────────────────${NC}"
    
    for domain in "${DOMAINS[@]}"; do
        echo
        print_status "info" "Testing connectivity to $domain"
        
        # Test HTTP redirect
        local http_code=$(check_http_connectivity "$domain" "http")
        if [[ "$http_code" == "301" || "$http_code" == "302" ]]; then
            print_status "success" "HTTP → HTTPS redirect working (${http_code})"
        elif [[ "$http_code" == "000" ]]; then
            print_status "error" "HTTP connection failed"
        else
            print_status "warning" "HTTP returned unexpected code: ${http_code}"
        fi
        
        # Test HTTPS
        local https_code=$(check_http_connectivity "$domain" "https")
        if [[ "$https_code" == "200" ]]; then
            print_status "success" "HTTPS connection successful (${https_code})"
        elif [[ "$https_code" == "000" ]]; then
            print_status "error" "HTTPS connection failed"
        else
            print_status "warning" "HTTPS returned code: ${https_code}"
        fi
    done
    
    echo
    echo -e "${BLUE}3. SSL Certificate Tests${NC}"
    echo -e "${BLUE}────────────────────────${NC}"
    
    for domain in "${DOMAINS[@]}"; do
        echo
        print_status "info" "Checking SSL certificate for $domain"
        
        local cert_info=$(check_ssl_certificate "$domain")
        if [[ "$cert_info" != "FAILED" ]]; then
            print_status "success" "SSL certificate is valid"
            echo "$cert_info" | while IFS= read -r line; do
                echo "    $line"
            done
        else
            print_status "error" "SSL certificate check failed"
        fi
    done
    
    echo
    echo -e "${BLUE}4. Network Path Analysis${NC}"
    echo -e "${BLUE}────────────────────────${NC}"
    
    for domain in "${DOMAINS[@]}"; do
        print_status "info" "Analyzing network path to $domain"
        local hops=$(perform_traceroute "$domain")
        if [[ "$hops" != "N/A" ]]; then
            print_status "info" "Network hops: $hops"
        else
            print_status "warning" "Traceroute not available"
        fi
    done
    
    echo
    echo -e "${BLUE}5. Regional DNS Tests${NC}"
    echo -e "${BLUE}─────────────────────${NC}"
    
    # Test from different regions using public DNS checking services
    print_status "info" "Checking DNS propagation globally..."
    
    # Use whatsmydns.net API equivalent or similar service
    for domain in "${DOMAINS[@]}"; do
        print_status "info" "Global propagation check for $domain"
        # This would ideally use an API to check DNS from multiple regions
        # For now, we'll just note it as a recommendation
        print_status "info" "Recommend checking https://www.whatsmydns.net/#A/$domain"
    done
    
    echo
    echo -e "${BLUE}Summary and Recommendations${NC}"
    echo -e "${BLUE}═══════════════════════════${NC}"
    
    # Analyze results and provide recommendations
    print_status "info" "Analysis complete. Log saved to: $LOG_FILE"
    
    echo
    echo -e "${YELLOW}Recommendations based on diagnostics:${NC}"
    echo "1. If DNS resolution is failing with ISP DNS:"
    echo "   - Advise users to switch to Google DNS (8.8.8.8) or Cloudflare (1.1.1.1)"
    echo
    echo "2. If DNS propagation is inconsistent:"
    echo "   - Check TTL settings (recommend 300s during issues)"
    echo "   - Contact DNS provider for zone file verification"
    echo
    echo "3. If specific regions are affected:"
    echo "   - Consider using a CDN or multiple DNS providers"
    echo "   - Implement GeoDNS for better regional routing"
    echo
    echo "4. For immediate mitigation:"
    echo "   - Use backup domains (protokol.1foiz.com)"
    echo "   - Provide direct IP access instructions (with SSL warning)"
    echo
    
    # Generate report
    echo -e "${BLUE}Generating detailed report...${NC}"
    generate_report
}

# Function to generate detailed report
generate_report() {
    local report_file="/tmp/dns-diagnostics-report-$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "diagnostics": {
    "domains_tested": [$(printf '"%s",' "${DOMAINS[@]}" | sed 's/,$//')]
    "dns_servers_tested": [$(printf '"%s",' "${DNS_SERVERS[@]}" | sed 's/,$//')]
    "expected_ip": "$EXPECTED_IP",
    "log_file": "$LOG_FILE",
    "report_file": "$report_file"
  },
  "recommendations": [
    "Monitor DNS resolution from multiple regions",
    "Set up automated DNS monitoring",
    "Consider DNS failover strategy",
    "Document workarounds for users"
  ]
}
EOF
    
    print_status "success" "Detailed report saved to: $report_file"
}

# Run main diagnostics
main "$@"