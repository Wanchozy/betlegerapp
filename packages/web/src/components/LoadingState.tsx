import { motion } from 'framer-motion'

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className="h-6 w-6 rounded-full border-2 border-cream-200 border-t-emerald-500"
      />
      <p className="text-sm">{label}</p>
    </div>
  )
}
