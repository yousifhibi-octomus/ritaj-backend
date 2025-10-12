"use client";

import React from "react";
import styles from "./Footer.module.css";
import Link from 'next/link';
import SocialIcons from "../SocialIcons/SocialIcons";
import { useState } from "react";
import axios from "@/lib/axios";

const Footer = () => {

const [email, setEmail] = useState('');
const [errMsg, setErrMsg] = useState('');
const [successMsg, setSuccessMsg] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrMsg('');
  setSuccessMsg('');
  const val = email.trim().toLowerCase();
  if (!val) {
    setErrMsg('أدخل بريدك الإلكتروني');
    return;
  }
  try {
    setLoading(true);
    const { data } = await axios.post('/newsletter/subscribe/', { email: val });
    setSuccessMsg(`تم الاشتراك: ${data.email}`);
    setEmail('');
  } catch (err) {
    setErrMsg(err.response?.data?.detail || 'خطأ في الاشتراك');
  } finally {
    setLoading(false);
  }
};
  return (
    <footer className={styles.footer} dir="rtl">
      <div className= {styles.overlay }>
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <Link href="/" className={styles.logo} >
           <img className={styles.logoImg} src="/images/Ritaj.png" alt="Ritaj logo" />
          </Link>
        </div>

        <div className={styles.footerNav}>
          <h3>روابط سريعة</h3>
          <ul>
            <li>
              <a href="/">الرئيسية</a>
            </li>
            <li>
              <a href="/news">أخبار واحداث</a>
            </li>
            <li>
              <a href="/_not-found_">مسابقات</a>
            </li>
            {/* <li> 
              <a href="/jobs">وظائف</a>
            </li>*/}
            <li>
              <a href="/podcast">بودكاست</a>
            </li>
            <li>
              <a href="/about">تواصل معنا</a>
            </li>
          </ul>
        </div>
        <div className={styles.footerNav}>
          <h3>مشاريع</h3>
          <ul>
            <li>
              <a href="/projects/عمارة">عمارة</a>
            </li>
            <li>
              <a href="/projects/تصميم%20داخلي">تصميم داخلي</a>
            </li>
            <li>
              <a href="/projects/تصميم%20صناعي">تصميم صناعي</a>
            </li>
            <li>
              <a href="/projects/تصميم%20مدينة">تصميم مدني</a>
            </li>
            <li>
              <a href="/projects/تصميم%20رقمي">تصميم رقمي</a>
            </li>
          </ul>
        </div>
        <div className={styles.footerNewsletter}>
          <h3>النشرة الإخبارية</h3>
          <form onSubmit={handleSubmit}>
  <input
    type="email"
    name="newsletterEmail"
    
    placeholder="بريدك الإلكتروني"
    className={styles.footerInput}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    disabled={loading}
    required
  />
  <button type="submit" disabled={loading}>
    {loading ? '...' : 'اشتراك'}
  </button>
  {errMsg && <p className={styles.errorMsg}>{errMsg}</p>}
  {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
</form>
          
          <div className={styles.footerSocial}>
            <h3>تابعنا</h3>
            <div className={styles.socialIcons}>
              <SocialIcons />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        &copy; 2025 رتاج. جميع الحقوق محفوظة.
      </div>
      </div>
    </footer>
  );
};

export default Footer;