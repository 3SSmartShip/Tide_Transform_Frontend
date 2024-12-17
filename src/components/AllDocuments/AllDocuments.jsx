import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import Layout from '../Layout/Layout'

export default function AllDocuments() {
  return (
    <Layout>
      <div className="h-screen px-8 flex flex-col">
        <h1 className="text-2xl font-semibold text-white mb-6">All Documents</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center max-w-md"
          >
            <Clock className="w-16 h-16 text-[#EEFF00] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Coming Soon</h2>
            <p className="text-gray-400 text-lg">
              We're working hard to bring you the best document management experience.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}