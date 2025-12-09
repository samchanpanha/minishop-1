# MiniShop Docker Deployment Guide (SQLite)

This guide explains how to deploy the MiniShop e-commerce application using Docker with **SQLite**.

## 🚀 Quick Start

### Automated Deployment

```bash
./deploy-docker.sh deploy
```

### Manual Deployment

```bash
# 1. Create data directory
mkdir -p data

# 2. Build and start container
docker-compose up -d --build
```

## 🔧 Configuration

### Database
- The application uses **SQLite** stored in `./data/dev.db`.
- This file is mapped to the container volume, so data persists locally.

### Environment Variables
Ensure `.env` has:
```env
DATABASE_URL="file:./data/dev.db"
```