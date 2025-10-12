import React, { useEffect, useState } from 'react';
import styles from './CompetitionRegistration.module.css';
import djangoAPI from '../../lib/axios';

const CompetitionRegistration = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch competitions from the backend
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await djangoAPI.get('competitions/');
        const data = res.data;
        const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
        setCompetitions(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error fetching competitions:', error?.response || error);
        setCompetitions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  // Download participants as CSV
  const handleDownload = async (competitionId) => {
    try {
      const response = await djangoAPI.get(`competitions/${competitionId}/participants/export/`, {
        responseType: 'blob',
        headers: { Accept: 'text/csv' },
      });

      // Try to get filename from Content-Disposition header; fallback to CSV
      const cd = response.headers?.['content-disposition'] || '';
      const match = cd.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `participants_${competitionId}.csv`;

      const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'text/csv;charset=utf-8',
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV file:', error?.response || error);
    }
  };

return (
  <div className={styles.registrationContainer}>
    <h2 className={styles.registrationTitle}>المسابقات</h2>

    {loading ? (
      <p>جاري التحميل...</p>
    ) : competitions.length === 0 ? (
      <p>لا توجد مسابقات.</p>
    ) : (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">العنوان</th>
              <th scope="col">تحميل</th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((competition) => (
              <tr key={competition.id}>
                <td>{competition.title}</td>
                <td>
                  <button
                    className={styles.downloadButton}
                    onClick={() => handleDownload(competition.id)}
                  >
                    تحميل ملف CSV
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
};

export default CompetitionRegistration;