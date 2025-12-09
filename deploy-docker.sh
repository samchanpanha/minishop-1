#!/bin/bash

# MiniShop Docker Deployment Script
set -e

echo "🚀 MiniShop Docker Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Create necessary directories
setup_directories() {
    print_status "Setting up directories..."
    
    mkdir -p data
    mkdir -p logs
    
    # Set proper permissions
    chmod 755 data logs
    
    print_success "Directories created successfully"
}

# Copy environment file if it doesn't exist
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env from .env.example"
        else
            print_warning "No .env file found. Using default values."
        fi
    else
        print_success "Using existing .env file"
    fi
}

# Build and start the application
deploy_application() {
    print_status "Building and starting application..."
    
    # Stop any existing containers
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Build the images
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start the application
    print_status "Starting containers..."
    docker-compose up -d
    
    print_success "Application deployed successfully!"
}

# Wait for the application to be ready
wait_for_application() {
    print_status "Waiting for application to be ready..."
    
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000 &> /dev/null; then
            print_success "Application is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Application failed to start within expected time"
    return 1
}

# Run database initialization
init_database() {
    print_status "Initializing database..."
    
    # Wait a bit more for the app to fully start
    sleep 5
    
    # Run database seed if needed
    docker-compose exec -T minishop-app npm run db:seed 2>/dev/null || print_warning "Database seed failed or not needed"
    
    print_success "Database initialization completed"
}

# Show deployment status
show_status() {
    echo ""
    print_success "🎉 Deployment Complete!"
    echo "=================================="
    echo "📱 Application: http://localhost:3000"
    echo "🔧 Adminer (DB): http://localhost:8080"
    echo "📊 Container Status:"
    docker-compose ps
    echo ""
    print_success "To stop the application, run: docker-compose down"
    print_success "To view logs, run: docker-compose logs -f"
    echo ""
}

# Main deployment flow
main() {
    echo ""
    check_dependencies
    setup_directories
    setup_environment
    deploy_application
    wait_for_application
    init_database
    show_status
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        print_status "Stopping application..."
        docker-compose down
        print_success "Application stopped"
        ;;
    "restart")
        print_status "Restarting application..."
        docker-compose down
        docker-compose up -d
        wait_for_application
        print_success "Application restarted"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        print_status "Application status:"
        docker-compose ps
        ;;
    "clean")
        print_warning "This will remove all containers and data. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            docker-compose down --volumes --remove-orphans
            rm -rf data/* logs/*
            print_success "Cleaned up containers and data"
        else
            print_status "Cleanup cancelled"
        fi
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  stop     - Stop the application"
        echo "  restart  - Restart the application"
        echo "  logs     - Show application logs"
        echo "  status   - Show container status"
        echo "  clean    - Remove containers and data"
        exit 1
        ;;
esac