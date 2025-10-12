"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CompetitionCard from "../CompetitionCard";
import { fetchCompetitions } from "../../Competitions/api";
import styles from "./CompetitionsGrid.module.css";

const PAGE_SIZE = 21;

export default function CompetitionsGrid() {
  const params = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, parseInt(params.get("page") || "1", 10));

  const [data, setData] = useState(null);   // raw API response
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Build query for API (passes page + page_size if backend supports it)
  const queryObj = useMemo(() => {
    const q = Object.fromEntries(params.entries());
    q.page = String(page);
    q.page_size = String(PAGE_SIZE);
    return q;
  }, [params, page]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCompetitions(queryObj)
      .then((json) => setData(json))
      .catch((e) => setError(e.message || "Failed"))
      .finally(() => setLoading(false));
  }, [queryObj]);

  // Normalize items and total
  const items = useMemo(() => {
    if (Array.isArray(data)) return data; // non-paginated
    if (data && Array.isArray(data.results)) return data.results; // DRF paginated
    return [];
  }, [data]);

  const total = useMemo(() => {
    if (typeof data?.count === "number") return data.count; // DRF total
    if (Array.isArray(data)) return data.length;            // non-paginated total
    return items.length;
  }, [data, items]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // If backend isn't paginating, slice client-side to 21/page
  const pageItems = useMemo(() => {
    if (Array.isArray(data) && total > PAGE_SIZE) {
      const start = (page - 1) * PAGE_SIZE;
      return items.slice(start, start + PAGE_SIZE);
    }
    return items;
  }, [data, items, page, total]);

  const goToPage = (p) => {
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.set("page", String(p));
    router.push(`?${sp.toString()}`);
  };

  if (loading) return <SkeletonGrid />;
  if (error) return <div className={styles.error}>فشل التحميل: {error}</div>;
  if (!pageItems.length) return <div className={styles.empty}>لا توجد مسابقات مطابقة حالياً</div>;

  return (
    <>
      <div id="grid" className={styles.grid}>
        {pageItems.map((c) => (
          <div key={c.id} className={styles.item}>
            <CompetitionCard comp={c} />
          </div>
        ))}
      </div>

      <nav className={styles.pagination} aria-label="التصفح">
        <button
          className={styles.pageBtn}
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          التالي
        </button>
       
        <span className={styles.pageInfo}>
          صفحة {page} من {totalPages}
        </span>
  <button
          className={styles.pageBtn}
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          السابق
        </button>

        
      </nav>
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className={`${styles.grid} ${styles.loading}`}>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div key={i} className={styles.item}>
          <div className={styles.skeleton} />
        </div>
      ))}
    </div>
  );
}