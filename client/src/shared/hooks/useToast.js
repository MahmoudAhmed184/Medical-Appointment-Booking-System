import { useState, useCallback } from 'react';

/**
 * Shared toast hook — provides showToast(message, type) and toast state.
 * Auto-dismisses after the specified duration (default 4s).
 *
 * Usage:
 *   const { toast, showToast } = useToast();
 *   showToast('Saved successfully');
 *   showToast('Something went wrong', 'error');
 *
 *
 */
export function useToast(duration = 4000) {
    const [toast, setToast] = useState(null);

    const showToast = useCallback(
        (message, type = 'success') => {
            setToast({ message, type });
            setTimeout(() => setToast(null), duration);
        },
        [duration]
    );

    return { toast, showToast };
}
