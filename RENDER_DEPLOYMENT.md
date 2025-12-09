# Deploying MiniShop to Render (SQLite)

This guide explains how to deploy your MiniShop e-commerce application to Render using **SQLite** and a **Persistent Disk**.

## Prerequisites

1.  A [Render](https://render.com) account.
2.  Payment method configured (Persistent Disks are a paid feature).
3.  This code pushed to a Git repository.

## Deployment Steps

1.  **Log in to Render** and go to your Dashboard.
2.  Click **New +** and select **Blueprint**.
3.  Connect your repository.
4.  Render will detect `render.yaml`.
5.  **Important**: It will configure a **Persistent Disk** named `sqlite-data` (1GB).
6.  Click **Apply**.

## Data Persistence

- Your database is stored on the Persistent Disk mounted at `/app/data`.
- This ensures your `dev.db` file is saved between deployments and restarts.
- **Backups**: Render snapshots disks daily (check Render documentation for details).

## Environment Variables

Go to the **Environment** tab of your `minishop-ecommerce` web service in Render and add:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Local Development (Docker)

To run locally with Docker (Standalone):

```bash
docker-compose up --build
```

This uses a local volume `./data` mapped to the container to persist your local database.
