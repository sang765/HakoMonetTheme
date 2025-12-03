#!/bin/bash
# HakoMonetTheme Local Development Server Launcher
# Make this file executable with: chmod +x run_local_host.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to get Codespaces URL
get_codespaces_url() {
    local port=$1
    if [ ! -z "$CODESPACE_NAME" ] && [ ! -z "$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN" ]; then
        echo "https://$CODESPACE_NAME-$port.$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"
        return 0
    fi
    return 1
}

# Function to show access URLs
show_access_urls() {
    local port=$1
    local server_type=$2
    echo "[ACCESS] http://localhost:$port"
    if get_codespaces_url $port; then
        echo "[CODESPACE] $(get_codespaces_url $port)"
        print_info "In Github Codespaces - use the CODESPACE URL for external access"
    fi
    echo "[STOP] Press Ctrl+C to stop the $server_type server"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        kill $pid 2>/dev/null
        sleep 1
        if kill -0 $pid 2>/dev/null; then
            kill -9 $pid 2>/dev/null
            print_warning "Force killed process $pid on port $port"
        else
            print_success "Killed process $pid on port $port"
        fi
    fi
}

# Main menu loop
show_menu() {
    echo ""
    echo "========================================"
    echo "  HakoMonetTheme Local Development Server"
    echo "========================================"
    echo ""
    echo "Choose your preferred server:"
    echo "[1] Python HTTP Server (Port 8000)"
    echo "[2] Node.js HTTP Server (Port 8080)"
    echo "[3] Check Server Status"
    echo "[4] Kill Running Servers"
    echo "[5] Exit"
    echo ""
    echo "Note: For Github Codespaces, use the userscript menu (🔧 Cấu hình Server URL)"
    echo "to configure the forwarded URL after starting the server."
    echo ""
}

while true; do
    show_menu
    read -p "Enter your choice (1-5): " choice

    case $choice in
        1)
            print_info "Checking Python installation..."
            if command -v python3 &> /dev/null; then
                PYTHON_CMD="python3"
            elif command -v python &> /dev/null; then
                PYTHON_CMD="python"
            else
                print_error "Python is not installed or not in PATH."
                print_info "Please install Python (python3) from your package manager"
                print_info "Or choose a Node.js option."
                continue
            fi

            print_success "Python found"
            if check_port 8000; then
                print_warning "Port 8000 is already in use. Attempting to free it..."
                kill_port 8000
            fi

            print_info "Starting Python HTTP server on port 8000..."
            show_access_urls 8000 "Python HTTP"
            echo ""
            $PYTHON_CMD -m http.server 8000
            echo ""
            print_info "Python server stopped"
            ;;
        2)
            print_info "Checking Node.js installation..."
            if ! command -v node &> /dev/null; then
                print_error "Node.js is not installed or not in PATH."
                print_info "Please install Node.js from https://nodejs.org"
                print_info "Or from your package manager (e.g., apt install nodejs npm)"
                continue
            fi

            print_success "Node.js found"
            if check_port 8080; then
                print_warning "Port 8080 is already in use. Attempting to free it..."
                kill_port 8080
            fi

            print_info "Starting Node.js HTTP server on port 8080..."
            show_access_urls 8080 "Node.js HTTP"
            echo "[NOTE] http-server will be installed automatically if not present"
            echo ""
            npx http-server -p 8080 -c-1 --cors
            echo ""
            print_info "Node.js HTTP server stopped"
            ;;
        3)
            echo ""
            print_info "Checking server status..."
            echo ""

            if check_port 8000; then
                print_success "Python server is ACTIVE on port 8000"
                pid=$(lsof -ti:8000)
                if [ ! -z "$pid" ]; then
                    echo "  PID: $pid"
                fi
            else
                print_info "Python server is INACTIVE on port 8000"
            fi

            if check_port 8080; then
                print_success "Node.js server is ACTIVE on port 8080"
                pid=$(lsof -ti:8080)
                if [ ! -z "$pid" ]; then
                    echo "  PID: $pid"
                fi
            else
                print_info "Node.js server is INACTIVE on port 8080"
            fi
            echo ""
            read -p "Press Enter to continue..."
            ;;
        4)
            echo ""
            print_info "Killing running servers..."
            echo ""

            if check_port 8000; then
                kill_port 8000
            else
                print_info "No Python server running on port 8000"
            fi

            if check_port 8080; then
                kill_port 8080
            else
                print_info "No Node.js server running on port 8080"
            fi
            echo ""
            read -p "Press Enter to continue..."
            ;;
        5)
            echo ""
            print_info "Exiting HakoMonetTheme Development Server"
            echo "Goodbye! 👋"
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please select 1-5."
            sleep 2
            ;;
    esac
done