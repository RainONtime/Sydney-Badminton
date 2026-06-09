/** @param {{ value: number, onChange: (v: number) => void, max?: number }} props */
export default function QuantityStepper({ value, onChange, max = 3 }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center
                   text-gray-500 hover:border-gray-400 hover:text-gray-950
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-transform active:scale-90 text-base select-none"
      >−</button>
      <span className="w-8 text-center text-lg font-bold text-gray-950">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center
                   text-gray-500 hover:border-gray-400 hover:text-gray-950
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-transform active:scale-90 text-base select-none"
      >+</button>
    </div>
  )
}
