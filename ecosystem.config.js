module.exports = {
  apps: [
    {
      name: 'enromatics-backend',
      cwd: './backend',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5050,
      },
    },
    {
      name: 'enromatics-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1.5G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
