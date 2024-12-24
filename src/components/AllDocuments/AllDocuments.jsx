import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import Layout from '../Layout/Layout';

export default function AllDocuments() {
  return (
    <Layout>

          <div className="px-32px py-32px">
            {/* Header aligned to the left */}
            <h1 className="text-2xl font-semibold text-white">All Documents</h1>


                <div className="flex-1 flex items-center justify-center pt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Clock className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Coming Soon</h2>
                <p className="text-gray-400 text-lg">
                  We're working hard to bring you the best document management experience.
                </p>
              </motion.div>
            </div>
      </div>
    </Layout>
  );
}
