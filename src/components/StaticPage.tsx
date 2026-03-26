import React from 'react';
import { motion } from 'motion/react';

interface StaticPageProps {
  title: string;
  content: React.ReactNode;
}

export default function StaticPage({ title, content }: StaticPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100"
      >
        <h1 className="text-5xl font-black text-gray-900 mb-12">{title}</h1>
        <div className="prose prose-lg prose-orange max-w-none text-gray-600 font-medium leading-relaxed space-y-6">
          {content}
        </div>
      </motion.div>
    </div>
  );
}
