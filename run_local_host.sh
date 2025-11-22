#!/bin/bash
# Make this file executable with: chmod +x run_local_host.sh

echo "========================================"
echo "HakoMonetTheme Local Development Server"
echo "========================================"
echo ""
echo "Choose your preferred server:"
echo "1. Python (recommended)"
echo "2. Node.js"
echo "3. Exit"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "Checking Python..."
        if command -v python3 &> /dev/null; then
            PYTHON_CMD="python3"
        elif command -v python &> /dev/null; then
            PYTHON_CMD="python"
        else
            echo "Python is not installed or not in PATH."
            echo "Please install Python (python3) from your package manager"
            echo "Or choose Node.js option."
            exit 1
        fi

        echo "Starting Python HTTP server on port 8000..."
        echo "Access your files at: http://localhost:8000"
        echo "Press Ctrl+C to stop the server"
        echo ""
        $PYTHON_CMD -m http.server 8000
        ;;
    2)
        echo "Checking Node.js..."
        if ! command -v node &> /dev/null; then
            echo "Node.js is not installed or not in PATH."
            echo "Please install Node.js from https://nodejs.org"
            echo "Or from your package manager (e.g., apt install nodejs npm)"
            exit 1
        fi

        echo "Starting Node.js HTTP server on port 8080..."
        echo "Access your files at: http://localhost:8080"
        echo "Press Ctrl+C to stop the server"
        echo ""
        echo "Note: http-server will be installed automatically if not present"
        npx http-server -p 8080 -c-1 --cors
        ;;
    3)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Please run again."
        exit 1
        ;;
esac

echo ""
echo "Server stopped."