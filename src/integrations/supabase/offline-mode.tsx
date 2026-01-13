import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const OfflineModeBanner = () => {
  return (
    <Alert className="m-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">
        Supabase Project Restoring
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        Your Supabase project is currently being restored. Some features may be unavailable.
        The project should be accessible shortly. Please check your Supabase dashboard for status.
      </AlertDescription>
    </Alert>
  );
};
