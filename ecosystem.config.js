module.exports = {
  apps: [
    {
      name: 'elearning-kesatria',
      script: 'node',
      args: 'dist/main',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3069,
      },
    },
  ],
};
