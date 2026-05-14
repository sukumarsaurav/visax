/**
 * Accessible star rating display.
 * Screen readers announce "4.5 out of 5 stars" instead of repeating "star" 5 times.
 */
export default function StarRating({ rating = 0, max = 5, size = 'text-[16px]', className = '' }) {
    return (
        <div
            className={`flex text-amber-500 ${className}`}
            role="img"
            aria-label={`${rating} out of ${max} stars`}
        >
            {[...Array(max)].map((_, i) => (
                <span
                    key={i}
                    className={`material-symbols-outlined material-filled ${size}`}
                    aria-hidden="true"
                >
                    {i < Math.floor(rating) ? 'star' : i < rating ? 'star_half' : 'star'}
                </span>
            ))}
        </div>
    )
}
