const Loader = ({ message = 'Loading...', size = 'w-10 h-10', fullPage = true }) => {
    const wrapper = fullPage
        ? 'flex flex-col items-center justify-center min-h-[60vh]'
        : 'flex flex-col items-center justify-center py-12';

    return (
        <div className={wrapper}>
            <div
                className={`${size} border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin`}
            />
            {message && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{message}</p>
            )}
        </div>
    );
};

export default Loader;
