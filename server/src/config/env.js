const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET',
];

const optionalVars = [
    { name: 'PORT', default: '5000' },
    { name: 'NODE_ENV', default: 'development' },
    { name: 'JWT_EXPIRES_IN', default: '7d' },
    { name: 'EMAIL_HOST', default: 'smtp.gmail.com' },
    { name: 'EMAIL_PORT', default: '587' },
    { name: 'EMAIL_USER', default: '' },
    { name: 'EMAIL_PASS', default: '' },
    { name: 'EMAIL_FROM', default: '' },
];

const validateEnv = () => {
    const missing = requiredVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        console.error('Please check your .env file against .env.example');
        process.exit(1);
    }

    for (const { name, default: defaultValue } of optionalVars) {
        if (!process.env[name]) {
            process.env[name] = defaultValue;
        }
    }
};

export { validateEnv };
