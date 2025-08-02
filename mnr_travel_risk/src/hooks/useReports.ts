import { useCallback, useEffect, useState } from 'react';
import { RiskReport } from '@/generated/prisma';

export const useReports = () => {
  const [allReports, setAllReports] = useState<RiskReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const resp = await fetch('/api/report');
        if (!resp.ok) {
          console.error('Failed to fetch reports:', resp.status);
          setError(`Failed to fetch reports: ${resp.status}`);
          return;
        }
        const data = await resp.json();
        const reports: RiskReport[] = data || [];
        console.log('Loaded reports:', reports.length);
        setAllReports(reports);
      } catch (error) {
        console.error('Error loading reports:', error);
        setError('Error loading reports');
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadReports();
  }, []);

  return {
    allReports,
    loading,
    error,
    loadReports,
    setAllReports
  };
}; 