/**
 * Shared Toast component — renders a fixed-bottom-center notification banner.
 *
 * Props:
 *   toast: { message: string, type: 'success' | 'error' } | null
 *
 * Usage:
 *   const { toast, showToast } = useToast();
 *   return <Toast toast={toast} />;
 */
export default function Toast({ toast }) {
    if (!toast) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div
                className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white
                    ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
            >
                {toast.message}
            </div>
        </div>
    );
}
