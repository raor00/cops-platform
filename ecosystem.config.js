// PM2 ecosystem — COPS Platform en VPS Hetzner
// Uso: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "cops-web",
      cwd: "./apps/web",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "512M",
      restart_delay: 3000,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
    {
      name: "cops-cotizaciones",
      cwd: "./apps/cotizaciones",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      max_memory_restart: "512M",
      restart_delay: 3000,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
    {
      name: "cops-tickets",
      cwd: "./apps/tickets",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
      },
      max_memory_restart: "512M",
      restart_delay: 3000,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
}
