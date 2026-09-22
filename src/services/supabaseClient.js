import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('your-project-id')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Uploads a file to a Supabase storage bucket
 * @param {string} bucket - 'construction-photos' | 'construction-receipts' | 'construction-documents'
 * @param {string} path - path within bucket (e.g. `userId/projectId/filename.jpg`)
 * @param {File} file - File object from input
 */
export const uploadStorageFile = async (bucket, path, file) => {
  if (!supabase) {
    // Return a mock base64 data URL for demo mode
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          data: {
            path,
            publicUrl: reader.result,
          },
          error: null
        });
      };
      reader.readAsDataURL(file);
    });
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) return { data: null, error };

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return {
    data: {
      path: data.path,
      publicUrl: publicUrlData.publicUrl
    },
    error: null
  };
};
