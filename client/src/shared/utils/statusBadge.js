/**
 * Unified status badge color map used across all features.
 * Follows the doctor feature's color scheme with full dark mode support.
 */
const STATUS_STYLES = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

/**
 * Returns Tailwind classes for a given appointment/status string.
 * Handles case-insensitive input (e.g. "Confirmed" or "confirmed").
 *
 * @param {string} status - The status string
 * @returns {string} Tailwind class string
 */
export function getStatusClasses(status) {
    return STATUS_STYLES[status?.toLowerCase()] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
}

export default STATUS_STYLES;
