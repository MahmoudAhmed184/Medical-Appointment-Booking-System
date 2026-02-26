/**
 * Reusable loading spinner with optional message.
 *
 * @param {Object}  props
 * @param {string}  [props.message='Loading...'] - Text shown below the spinner
 * @param {string}  [props.size='w-10 h-10']     - Tailwind size classes for the spinner
 * @param {boolean} [props.fullPage=true]         - Whether to center in the full viewport
 */
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
