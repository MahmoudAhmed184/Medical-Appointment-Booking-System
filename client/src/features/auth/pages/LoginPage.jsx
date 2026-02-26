import LoginForm from '../components/LoginForm';

const LoginPage = () => {
    return (
        <div className="max-w-lg mx-auto mt-32 px-4">
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
                Sign In
            </h1>
            <LoginForm />
        </div>
    );
};

export default LoginPage;
