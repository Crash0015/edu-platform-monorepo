'use client';

import { useEffect, useState } from 'react';
import { apiFetchAuth } from '../lib/api';

type Profile = {
  id: string;
  email: string;
  roles: string[];
  mfaEnabled: boolean;
  status: string;
};

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiFetchAuth<Profile>('/gateway/auth/me');
        setProfile(response);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo cargar el perfil.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { profile, loading, error };
};
