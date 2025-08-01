# EdgePlug Marketplace Backend

A production-ready marketplace SaaS backend for EdgePlug agents, built with Go, PostgreSQL, and modern infrastructure components.

## Prerequisites

- Go 1.21+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
- k6 (for load testing)
- Node.js 18+ (for desktop app)

## Installation

### Quick Start with Docker Compose

```bash
# Clone the repository
git clone https://github.com/fraware/edgeplug/marketplace.git
cd marketplace

# Start all services
docker-compose up -d

# The application will be available at:
# - API: http://localhost:8080
# - Grafana: http://localhost:3000 (admin/admin)
# - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
```

### Manual Installation

1. **Database Setup**
```bash
# Create PostgreSQL database
createdb edgeplug_marketplace

# Run migrations
psql -d edgeplug_marketplace -f migrations/001_initial_schema.sql
```

2. **Configuration**
```bash
# Copy and edit configuration
cp config.yaml.example config.yaml
# Edit config.yaml with your settings
```

3. **Build and Run**
```bash
# Install dependencies
go mod download

# Build the application
go build -o marketplace .

# Run the application
./marketplace
```

## Configuration

The application uses environment variables and configuration files. Key settings:

```yaml
# Server Configuration
server:
  port: "8080"
  host: "0.0.0.0"

# Database Configuration
database:
  host: "localhost"
  port: 5432
  user: "edgeplug"
  password: "your_password"
  dbname: "edgeplug_marketplace"

# JWT Configuration
jwt:
  secret: "your-super-secret-jwt-key"
  expiration: "24h"

# Storage Configuration
storage:
  type: "minio"  # or "s3", "local"
  minio:
    endpoint: "localhost:9000"
    access_key_id: "minioadmin"
    secret_access_key: "minioadmin"
    bucket: "edgeplug-marketplace"
```

## API Documentation

### Authentication Endpoints

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/profile
PUT  /api/v1/profile
```

### Agent Endpoints

```http
GET    /api/v1/agents
GET    /api/v1/agents/{id}
POST   /api/v1/agents
PUT    /api/v1/agents/{id}
DELETE /api/v1/agents/{id}
GET    /api/v1/agents/{id}/reviews
POST   /api/v1/agents/{id}/reviews
```

### Admin Endpoints

```http
GET /api/v1/admin/stats
GET /api/v1/admin/users
PUT /api/v1/admin/users/{id}/status
```

## Testing

### Unit Tests
```bash
go test ./...
```

### Load Testing with k6

```bash
# Install k6
# macOS: brew install k6
# Linux: https://k6.io/docs/getting-started/installation/

# Run load test
k6 run load-testing/k6-load-test.js

# Run stress test
k6 run load-testing/k6-stress-test.js

# Run with custom parameters
k6 run --env BASE_URL=http://localhost:8080 load-testing/k6-load-test.js
```

### Performance Benchmarks

The load testing suite includes:
- **Load Test**: Gradual ramp-up to 100 users
- **Stress Test**: Up to 1000 users to find breaking points
- **Custom Metrics**: Response time, throughput, error rates
- **Realistic Scenarios**: User registration, agent browsing, purchases

## SBOM Generation

Generate Software Bill of Materials using CycloneDX:

```bash
# Make script executable
chmod +x sbom/generate-sbom.sh

# Generate SBOM
./sbom/generate-sbom.sh
```

This generates:
- Go module dependencies SBOM
- Application SBOM
- Docker image SBOM
- Comprehensive project SBOM

## Desktop Application

The Electron desktop application provides:

### Features
- **Native Integration**: File system access, native dialogs
- **Auto-Updates**: Automatic update checking and installation
- **Security**: Context isolation, CSP, secure IPC
- **Cross-Platform**: Windows, macOS, Linux support

### Development
```bash
cd desktop
npm install
npm run dev
```

### Building
```bash
# Build for all platforms
npm run dist

# Build for specific platform
npm run dist:win
npm run dist:mac
npm run dist:linux
```

## Monitoring & Observability

### Metrics
- **Application Metrics**: Request rates, response times, error rates
- **Business Metrics**: User registrations, agent uploads, purchases
- **System Metrics**: CPU, memory, disk usage

### Dashboards
- **Grafana**: Pre-configured dashboards for monitoring
- **Prometheus**: Time-series metrics collection
- **Health Checks**: Application and dependency health

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: Debug, Info, Warn, Error
- **Log Rotation**: Automatic log file management


## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale marketplace=3
```

### Production Deployment
```bash
# Build production image
docker build -t edgeplug-marketplace:latest .

# Run with production config
docker run -d \
  --name edgeplug-marketplace \
  -p 8080:8080 \
  -e EDGEPLUG_DATABASE_HOST=your-db-host \
  -e EDGEPLUG_JWT_SECRET=your-secret \
  edgeplug-marketplace:latest
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n edgeplug-marketplace
```

## Development

### Project Structure
```
marketplace/
├── config/           # Configuration management
├── handlers/         # HTTP request handlers
├── middleware/       # Custom middleware
├── models/          # Database models
├── services/        # Business logic
├── migrations/      # Database migrations
├── load-testing/    # k6 load tests
├── sbom/           # SBOM generation
├── desktop/        # Electron app
├── monitoring/     # Prometheus/Grafana config
└── docker-compose.yml
```

### Development Workflow
1. **Local Development**: `go run main.go`
2. **Testing**: `go test ./...`
3. **Load Testing**: `k6 run load-testing/k6-load-test.js`
4. **SBOM Generation**: `./sbom/generate-sbom.sh`
5. **Desktop Development**: `cd desktop && npm run dev`

### Code Quality
- **Linting**: ESLint for TypeScript/JavaScript
- **Formatting**: Prettier for consistent code style
- **Testing**: Unit tests with Go testing framework
- **Coverage**: Test coverage reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
