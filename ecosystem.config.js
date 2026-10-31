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
        PORT: 5055,
        MONGODB_URI: 'mongodb://127.0.0.1:27017/enromatics',
      },
    },
    {
      name: 'enromatics-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3005',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
        EXPRESS_BACKEND_URL: 'http://127.0.0.1:5055',
        NEXT_PUBLIC_BACKEND_URL: 'http://127.0.0.1:5055',
        NEXT_PUBLIC_API_URL: 'https://enromatics.com',
      },
    },
  ],
};
