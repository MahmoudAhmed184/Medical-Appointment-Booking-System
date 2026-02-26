import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
    return (
        <div className="max-w-lg mx-auto mt-32 px-4">
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
                Create Account
            </h1>
            <RegisterForm />
        </div>
    );
};

export default RegisterPage;
