// Simple API helper for competitions
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';

export async function fetchCompetitions(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, v);
  });
  const url = `${API_BASE}/competitions/${qs.toString() ? '?' + qs.toString() : ''}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to load competitions');
  return res.json();
}

export async function registerParticipant(competitionId, data){
  const url = `${API_BASE}/competitions/${competitionId}/register/`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(data) });
  if(!res.ok){
    const err = await res.json().catch(()=>({detail:'Error'}));
    throw new Error(err.detail || err.email || 'Registration failed');
  }
  return res.json();
}
