'use client';

import { PatientMedia } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Image as ImageIcon, Film, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaTimelineProps {
  media: PatientMedia[];
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function MediaTimeline({ media, canDelete, onDelete }: MediaTimelineProps) {
  
  if (!media || media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Media Available</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          There are currently no uploaded images or videos for this patient's clinical record.
        </p>
      </div>
    );
  }

  // Optimize Image using Cloudinary parameters
  const getOptimizedUrl = (url: string) => {
    if (!url.includes('res.cloudinary.com')) return url;
    // Inject optimization parameters
    const splitUrl = url.split('/upload/');
    if (splitUrl.length === 2) {
      return `${splitUrl[0]}/upload/w_400,c_fill,q_auto,f_auto/${splitUrl[1]}`;
    }
    return url;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Clock className="h-5 w-5 text-sky-500" />
        Media Portfolio
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {media.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden group">
                  {item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      controls 
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={getOptimizedUrl(item.url)} 
                      alt="Patient Media" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {item.type === 'image' && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white p-1.5 rounded-md backdrop-blur-sm">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white p-1.5 rounded-md backdrop-blur-sm pointer-events-none">
                      <Film className="h-4 w-4" />
                    </div>
                  )}
                  {canDelete && (
                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button 
                         variant="destructive" 
                         size="icon" 
                         className="h-8 w-8 rounded-full shadow-lg"
                         onClick={() => {
                           if(confirm('Are you sure you want to delete this media?')) {
                             onDelete(item.id);
                           }
                         }}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                  )}
                </div>
                <CardContent className="p-4">
                  {item.note && (
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      {item.note}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                      By {item.uploadedBy.toLowerCase()}
                    </span>
                    <span>
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
