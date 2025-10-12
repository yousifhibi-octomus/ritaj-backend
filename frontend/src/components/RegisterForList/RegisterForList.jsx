"use client";
import React from "react";
import styles from "./RegisterForList.module.css";

// Build API base once (ensure trailing /api if using external URL)
const API_BASE_RAW = (process.env.NEXT_PUBLIC_DJANGO_API_URL || "").replace(/\/$/, "");
const API = API_BASE_RAW
  ? `${API_BASE_RAW}${/\/api$/.test(API_BASE_RAW) ? '' : '/api'}`
  : (typeof window !== 'undefined' ? `${window.location.origin}/api` : "/api");

export default function RegisterForList() {
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState("");
  const [err, setErr] = React.useState("");
  const [csrfToken, setCsrfToken] = React.useState("");

  const [countries, setCountries] = React.useState([]);
  // Arabic localized country names and sorting
  const regionNamesAr = React.useMemo(() => {
    try {
      if (typeof Intl !== "undefined" && Intl.DisplayNames) {
        return new Intl.DisplayNames(["ar"], { type: "region" });
      }
    } catch {}
    return null;
  }, []);
  const collatorAr = React.useMemo(() => {
    try {
      if (typeof Intl !== "undefined" && Intl.Collator) {
        return new Intl.Collator("ar", { usage: "sort", sensitivity: "base" });
      }
    } catch {}
    return null;
  }, []);
  const sortedCountries = React.useMemo(() => {
    const display = (c) => (regionNamesAr?.of(String(c.iso_code || "").toUpperCase()) || c.name || "").trim();
    const arr = Array.isArray(countries) ? [...countries] : [];
    if (collatorAr) {
      arr.sort((a, b) => collatorAr.compare(display(a), display(b)));
    } else {
      arr.sort((a, b) => display(a).localeCompare(display(b)));
    }
    return arr;
  }, [countries, regionNamesAr, collatorAr]);
  const [specializations, setSpecializations] = React.useState([]);

  // Offices
  const [offices, setOffices] = React.useState([]);
  const [officeEndpoint, setOfficeEndpoint] = React.useState(null);
  const [officeMode, setOfficeMode] = React.useState("select"); // 'select' | 'add'
  const [officeId, setOfficeId] = React.useState("");
  const [officeForm, setOfficeForm] = React.useState({
    company_name: "",
    street_address: "",
    city: "",
    state_province: "",
    country: "",
    postal_code: "",
    latitude: "",
    longitude: "",
    phone: "",
    email: "",
    location_type: "branch",
  });

  const [form, setForm] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    company: "",
    country: "", // id
    city: "",
    state_province: "",
    street_address: "",
    postal_code: "",
    location_visibility: "area",
    years_experience: "",
    hourly_rate: "",
    is_freelancer: false,
    availability: "available",
    professional_summary: "",
    bio: "",
    languages: "",
    website_url: "",
    linkedin_url: "",
    specializations: [],
    latitude: "",
    longitude: "",
    profile_photo: null,
  });

  // Load countries and specializations (paginate all specializations)
  React.useEffect(() => {
    let on = true;
    (async () => {
      try {
        const cRes = await fetch(`${API}/countries/`);
        if (on && cRes.ok) {
          const cs = await cRes.json();
          setCountries(Array.isArray(cs) ? cs : cs.results || []);
        }

        // Fetch all specialization pages if paginated
        let specs = [];
        let page = 1;
        while (true) {
          const sRes = await fetch(`${API}/specializations/?page=${page}&page_size=100`);
          if (!sRes.ok) break;
          const sData = await sRes.json();
          const items = Array.isArray(sData) ? sData : sData.results || [];
          specs = specs.concat(items);
          const nextUrl = sData.next || null;
          if (!nextUrl || items.length === 0) break;
          page += 1;
          if (page > 25) break; // safety cap
        }
        if (on) setSpecializations(specs);
      } catch {}
    })();
    return () => { on = false; };
  }, []);

  // Fetch CSRF token once on mount (and set cookie) so we can include it in POSTs
  React.useEffect(() => {
    let on = true;
    (async () => {
      try {
        const r = await fetch(`${API}/auth/csrf/`, { credentials: "include" });
        if (!on) return;
        if (r.ok) {
          const data = await r.json().catch(() => ({}));
          const tokenFromApi = data?.csrfToken || data?.token || "";
          let token = tokenFromApi;
          if (!token && typeof document !== "undefined") {
            const m = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/);
            token = m ? decodeURIComponent(m[1]) : "";
          }
          setCsrfToken(token);
        }
      } catch {}
    })();
    return () => { on = false; };
  }, []);

  const refreshCsrf = React.useCallback(async () => {
    try {
      const r = await fetch(`${API}/auth/csrf/`, { credentials: "include" });
      if (r.ok) {
        const data = await r.json().catch(() => ({}));
        const tokenFromApi = data?.csrfToken || data?.token || "";
        let token = tokenFromApi;
        if (!token && typeof document !== "undefined") {
          const m = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/);
          token = m ? decodeURIComponent(m[1]) : "";
        }
        setCsrfToken(token);
        return token;
      }
    } catch {}
    return "";
  }, []);

  // Load offices from whichever endpoint exists
  React.useEffect(() => {
    let on = true;
    (async () => {
      const candidates = [`${API}/offices/`, `${API}/office-locations/`];
      for (const ep of candidates) {
        try {
          const r = await fetch(ep + `?page_size=100`);
          if (r.ok) {
            const data = await r.json();
            const list = Array.isArray(data) ? data : data.results || [];
            if (on) {
              setOffices(list);
              setOfficeEndpoint(ep.replace(/\?page_size=100$/, ""));
            }
            break;
          }
        } catch {}
      }
    })();
    return () => { on = false; };
  }, []);

  const handle = (k) => (e) => {
    const v = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };
  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, profile_photo: file }));
  };
  const toggleSpec = (id) =>
    setForm((f) => {
      const has = f.specializations.includes(id);
      return {
        ...f,
        specializations: has ? f.specializations.filter((x) => x !== id) : [...f.specializations, id],
      };
    });

  const handleOffice = (k) => (e) => setOfficeForm((o) => ({ ...o, [k]: e.target.value }));

  const ensureOfficeId = async () => {
    if (officeMode === "select") return officeId || "";
    if (!officeEndpoint) throw new Error("لا يمكن تحميل مكاتب الشركات حالياً.");
    if (!csrfToken) await refreshCsrf();
    const payload = {
      company_name: officeForm.company_name,
      street_address: officeForm.street_address,
      city: officeForm.city,
      state_province: officeForm.state_province,
  country_id: officeForm.country || null,
      postal_code: officeForm.postal_code,
      phone: officeForm.phone,
      email: officeForm.email,
      location_type: officeForm.location_type || "branch",
      is_verified: false,
    };
    const res = await fetch(officeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || "فشل إنشاء المكتب");
    }
    const created = await res.json();
    const id = created.id ?? created.pk ?? "";
    if (!id) throw new Error("لم يتم إرجاع معرّف للمكتب الجديد.");
    setOffices((prev) => [{ ...created }, ...prev]);
    return String(id);
  };

  // Specialization creation
  const [newSpecName, setNewSpecName] = React.useState("");
  const [newSpecDiscipline, setNewSpecDiscipline] = React.useState("");
  const [specErr, setSpecErr] = React.useState("");
  const [specLoading, setSpecLoading] = React.useState(false);

  const addSpecialization = async () => {
    setSpecErr("");
    const name = newSpecName.trim();
    const discipline = newSpecDiscipline.trim() || "";
    if (!name) {
      setSpecErr("أدخل اسم المجال");
      return;
    }
    setSpecLoading(true);
    try {
      if (!csrfToken) await refreshCsrf();
      const res = await fetch(`${API}/specializations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        body: JSON.stringify({ name, discipline }),
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const created = await res.json();
      setSpecializations((prev) => [{ ...created }, ...prev]);
      setForm((f) => ({ ...f, specializations: [...f.specializations, created.id] }));
      setNewSpecName("");
      setNewSpecDiscipline("");
    } catch (e) {
      setSpecErr(typeof e?.message === "string" ? e.message : "تعذر إضافة المجال");
    } finally {
      setSpecLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOk("");
    setErr("");
    try {
      if (!csrfToken) await refreshCsrf();
      const finalOfficeId = await ensureOfficeId().catch((er) => {
        if (officeMode === "add") throw er;
        return "";
      });

      const fd = new FormData();
      fd.append("first_name", form.first_name);
      fd.append("last_name", form.last_name);
      fd.append("email", form.email);
      if (form.phone) fd.append("phone", form.phone);
      if (form.profile_photo) fd.append("profile_photo", form.profile_photo);

      fd.append("job_title", form.job_title);
  // Removed: company no longer submitted
      if (form.years_experience !== "") fd.append("years_experience", String(Number(form.years_experience)));
      if (form.hourly_rate !== "") fd.append("hourly_rate", String(form.hourly_rate));
      fd.append("is_freelancer", String(!!form.is_freelancer));
      fd.append("availability", form.availability || "available");

      if (form.country) fd.append("country", String(form.country));
      if (form.city) fd.append("city", form.city);
      if (form.state_province) fd.append("state_province", form.state_province);
      if (form.street_address) fd.append("street_address", form.street_address);
      if (form.postal_code) fd.append("postal_code", form.postal_code);
      fd.append("location_visibility", form.location_visibility || "area");
      if (form.latitude) fd.append("latitude", String(form.latitude));
      if (form.longitude) fd.append("longitude", String(form.longitude));

      if (finalOfficeId) fd.append("office_location", String(finalOfficeId));

  // Removed: professional_summary no longer submitted
      if (form.bio) fd.append("bio", form.bio);
      if (form.languages) fd.append("languages", form.languages);
      if (form.website_url) fd.append("website_url", form.website_url);
      if (form.linkedin_url) fd.append("linkedin_url", form.linkedin_url);

      for (const id of form.specializations) fd.append("specializations", String(id));

      const res = await fetch(`${API}/engineers/`, {
        method: "POST",
        headers: {
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        body: fd,
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      setOk("تم استلام طلبك بنجاح.");
      setForm((f) => ({
        ...f,
        first_name: "", last_name: "", email: "", phone: "",
        job_title: "", company: "", country: "", city: "", state_province: "",
        street_address: "", postal_code: "", years_experience: "", hourly_rate: "",
        professional_summary: "", bio: "", languages: "", website_url: "", linkedin_url: "",
        specializations: [], latitude: "", longitude: "", profile_photo: null,
      }));
      setOfficeMode("select");
      setOfficeId("");
      setOfficeForm({
        company_name: "", street_address: "", city: "", state_province: "",
        country: "", postal_code: "", latitude: "", longitude: "",
        phone: "", email: "", location_type: "branch",
      });
    } catch (e) {
      setErr(typeof e?.message === "string" ? e.message : "فشل الإرسال. تحقق من الحقول ثم حاول مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} dir="rtl">
      <h2 className={styles.title}>انضم إلى قائمة المهندسين</h2>
      <p className={styles.description}>املأ بياناتك ليظهر ملفك في نتائج البحث.</p>

      <form className={styles.form} onSubmit={submit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>الصورة الشخصية</label>
            <input className={styles.input} type="file" accept="image/*" onChange={handleFile} />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>الاسم الأول</label>
            <input className={styles.input} value={form.first_name} onChange={handle("first_name")} required />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>اسم العائلة</label>
            <input className={styles.input} value={form.last_name} onChange={handle("last_name")} required />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>الوضيفة</label>
            <input className={styles.input} value={form.job_title} onChange={handle("job_title")} required />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>البريد الإلكتروني</label>
            <input type="email" className={styles.input} value={form.email} onChange={handle("email")} required />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>الهاتف</label>
            <input className={styles.input} value={form.phone} onChange={handle("phone")} />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>الدولة</label>
            <select className={styles.input} value={form.country} onChange={handle("country")}>
              <option value="">اختر الدولة</option>
              {sortedCountries.map((c) => (
                <option key={c.id} value={c.id}>
                  {regionNamesAr?.of(String(c.iso_code || '').toUpperCase()) || c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>المدينة</label>
            <input className={styles.input} value={form.city} onChange={handle("city")} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>المحافظة/المنطقة</label>
            <input className={styles.input} value={form.state_province} onChange={handle("state_province")} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>العنوان</label>
            <input className={styles.input} value={form.street_address} onChange={handle("street_address")} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>الرمز البريدي</label>
            <input className={styles.input} value={form.postal_code} onChange={handle("postal_code")} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>إظهار الموقع</label>
            <select className={styles.input} value={form.location_visibility} onChange={handle("location_visibility")}>
              <option value="full">العنوان كامل</option>
              <option value="area">المدينة/المنطقة فقط</option>
              <option value="hidden">إخفاء الموقع</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>سنوات الخبرة</label>
            <input type="number" min="0" className={styles.input} value={form.years_experience} onChange={handle("years_experience")} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>الأجر بالساعة (اختياري)</label>
            <input type="number" min="0" step="0.01" className={styles.input} value={form.hourly_rate} onChange={handle("hourly_rate")} />
          </div>
        </div>


        <div className={styles.row}>
          <div className={styles.field}>
            <label>الحالة</label>
            <select className={styles.input} value={form.availability} onChange={handle("availability")}>
              <option value="available">متاح</option>
              <option value="limited">محدود</option>
              <option value="unavailable">غير متاح</option>
            </select>
          </div>
        </div>

        {/* Office section */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label>المكتب</label>
            <div className={styles.radios}>
              <label className={styles.radio}>
                <input type="radio" name="officeMode" value="select" checked={officeMode === "select"} onChange={(e) => setOfficeMode(e.target.value)} />
                <span>اختيار مكتب من القائمة</span>
              </label>
              <label className={styles.radio}>
                <input type="radio" name="officeMode" value="add" checked={officeMode === "add"} onChange={(e) => setOfficeMode(e.target.value)} />
                <span>إضافة مكتب جديد</span>
              </label>
            </div>
          </div>
        </div>

        {officeMode === "select" && (
          <div className={styles.row}>
            <div className={styles.field}>
              <select className={styles.input} value={officeId} onChange={(e) => setOfficeId(e.target.value)}>
                <option value="">— اختر مكتباً (اختياري) —</option>
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.company_name} — {o.city}{o.country?.name ? `، ${o.country.name}` : ""}
                  </option>
                ))}
              </select>
              <div className={styles.hint}>يمكنك تركه فارغاً إن لم يكن لديك مكتب.</div>
            </div>
          </div>
        )}

        {officeMode === "add" && (
          <>
            <div className={styles.row}><div className={styles.field}><label>اسم الشركة/المكتب</label><input className={styles.input} value={officeForm.company_name} onChange={handleOffice('company_name')} required /></div></div>
         
            <div className={styles.row}><div className={styles.field}><label>العنوان</label><input className={styles.input} value={officeForm.street_address} onChange={handleOffice('street_address')} /></div></div>
           <div className={styles.row}><div className={styles.field}><label>الدولة</label><select className={styles.input} value={officeForm.country} onChange={handleOffice('country')}><option value="">اختر الدولة</option>{sortedCountries.map((c) => (<option key={c.id} value={c.id}>{regionNamesAr?.of(String(c.iso_code || '').toUpperCase()) || c.name}</option>))}</select></div></div>
            <div className={styles.row}><div className={styles.field}><label>المدينة</label><input className={styles.input} value={officeForm.city} onChange={handleOffice('city')} /></div></div>
         
            <div className={styles.row}><div className={styles.field}><label>المحافظة/المنطقة</label><input className={styles.input} value={officeForm.state_province} onChange={handleOffice('state_province')} /></div></div>
          
            <div className={styles.row}><div className={styles.field}><label>الرمز البريدي</label><input className={styles.input} value={officeForm.postal_code} onChange={handleOffice('postal_code')} /></div></div>
            <div className={styles.row}><div className={styles.field}><label>الهاتف</label><input className={styles.input} value={officeForm.phone} onChange={handleOffice('phone')} /></div></div>
            <div className={styles.row}><div className={styles.field}><label>البريد الإلكتروني</label><input className={styles.input} type="email" value={officeForm.email} onChange={handleOffice('email')} /></div></div>
            <div className={styles.row}><div className={styles.field}><label>نوع الموقع</label><select className={styles.input} value={officeForm.location_type} onChange={handleOffice('location_type')}><option value="headquarters">المقر الرئيسي</option><option value="branch">فرع</option><option value="regional">مكتب إقليمي</option></select></div></div>
            {/* Removed: الإحداثيات (اختياري) */}
            <div className={styles.row}><div className={styles.field}><div className={styles.hint}>سيتم إنشاء المكتب أولاً ثم ربطه بملفك.</div></div></div>
          </>
        )}

        {/* Removed: نبذة قصيرة (professional_summary) */}
        <div className={styles.field}>
          <label>نبذة مفصلة</label>
          <textarea className={styles.textarea} value={form.bio} onChange={handle("bio")} rows={4} />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>اللغات (افصل بينها بفاصلة)</label>
            <input className={styles.input} value={form.languages} onChange={handle("languages")} placeholder="العربية، الإنجليزية" />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>LinkedIn</label>
            <input className={styles.input} type="url" value={form.linkedin_url} onChange={handle("linkedin_url")} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>الموقع الشخصي</label>
            <input className={styles.input} type="url" value={form.website_url} onChange={handle("website_url")} />
          </div>
        </div>

        <div className={styles.field}>
          <label>المجالات</label>
          <div className={styles.checkboxList}>
            {specializations.map((s) => (
              <label key={s.id} className={styles.checkboxItem}>
                <input type="checkbox" checked={form.specializations.includes(s.id)} onChange={() => toggleSpec(s.id)} />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
          <div className={styles.addSpecBox}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
              <input className={styles.input} placeholder="اسم المجال الجديد" value={newSpecName} onChange={(e) => setNewSpecName(e.target.value)} />
              <input className={styles.input} placeholder="التخصص/المجال" value={newSpecDiscipline} onChange={(e) => setNewSpecDiscipline(e.target.value)} />
              <button type="button" className={styles.button} onClick={addSpecialization} disabled={specLoading}>
                {specLoading ? "جارٍ الإضافة..." : "إضافة"}
              </button>
            </div>
            {specErr && <div className={styles.error} style={{ marginTop: 8 }}>{specErr}</div>}
          </div>
        </div>

        {err && <div className={styles.error}>{err}</div>}
        {ok && <div className={styles.success}>{ok}</div>}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
        </button>
      </form>
    </div>
  );
}