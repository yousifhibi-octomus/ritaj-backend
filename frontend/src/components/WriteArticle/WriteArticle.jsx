import React, { useState } from 'react';
import axios from '@/lib/axios';
import styles from './WriteArticle.module.css';

const WriteArticle = () => {
  // Architecture-focused preset tags in Arabic
  const presetTags = [
    'عمارة', 'هندسة معمارية', 'تصميم معماري', 'تخطيط عمراني', 'عمران',
    'تصميم داخلي', 'ديكور', 'أثاث', 'إضاءة', 'ألوان',
    'عمارة إسلامية', 'عمارة كلاسيكية', 'عمارة حديثة', 'عمارة معاصرة', 'عمارة مستدامة',
    'مواد البناء', 'خرسانة', 'حديد', 'خشب', 'زجاج', 'حجر',
    'رسومات معمارية', 'مخططات', 'مقاطع', 'واجهات', 'ثلاثي الأبعاد',
    'إنشاءات', 'هياكل', 'أساسات', 'أعمدة', 'جسور',
    'تكييف', 'تهوية', 'سباكة', 'كهرباء', 'أنظمة ذكية',
    'مساحات خضراء', 'حدائق', 'مناظر طبيعية', 'فناء', 'شرفة',
    'مشاريع سكنية', 'مشاريع تجارية', 'مشاريع عامة', 'مستشفيات', 'مدارس',
    'ترميم', 'حفظ تراث', 'إعادة تأهيل', 'صيانة', 'تطوير',
    'قوانين البناء', 'رخص البناء', 'مواصفات', 'معايير', 'سلامة',
    'كلفة البناء', 'ميزانية', 'جدولة', 'إدارة مشاريع', 'مقاولات',
    'برامج التصميم', 'أوتوكاد', 'ريفيت', 'سكتش أب', 'ثري دي ماكس',
    'عمارة بيئية', 'طاقة متجددة', 'عزل حراري', 'توفير الطاقة', 'مباني خضراء'
  ];

  const [article, setArticle] = useState({
    title: '',
    slug: '',
    text: '',
    headerImage: null,
    images: [],
    tags: []
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [published, setPublished] = useState(false); // flag after real submission

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArticle(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArticle(prev => ({ ...prev, headerImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];

    files.forEach(file => {
      newImages.push(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          file: file,
          preview: reader.result,
          name: file.name
        });
        
        if (newPreviews.length === files.length) {
          setAdditionalImages(prev => [...prev, ...newPreviews]);
          setArticle(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setArticle(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.trim()) {
      const filtered = presetTags.filter(tag => 
        tag.includes(value.trim()) && !article.tags.includes(tag)
      );
      setFilteredTags(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredTags([]);
      setShowSuggestions(false);
    }
  };

  const handleTagAdd = (tagToAdd = tagInput.trim()) => {
    if (tagToAdd && !article.tags.includes(tagToAdd)) {
      setArticle(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd]
      }));
      setTagInput('');
      setShowSuggestions(false);
      setFilteredTags([]);
    }
  };

  const handleSuggestionClick = (tag) => {
    handleTagAdd(tag);
  };

  const handleTagRemove = (tagToRemove) => {
    setArticle(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setArticle(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitArticle('publish');
  };

  const handleSaveDraft = async () => {
    await submitArticle('draft');
  };

  const submitArticle = async (status) => {
    if (!article.title.trim() || !article.text.trim()) {
      setError('يرجى ملء العنوان ومحتوى المقال');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      
      // Add basic article data
      formData.append('title', article.title);
      formData.append('slug', article.slug);
      formData.append('text', article.text);
      formData.append('tags', JSON.stringify(article.tags));
      
      // Add header image if selected
      if (article.headerImage) {
        formData.append('header_image', article.headerImage);
      }
      
      // Add additional images as files only (backend reads image_{i} keys)
      if (article.images.length > 0) {
        article.images.forEach((image, index) => {
          formData.append(`image_${index}`, image);
        });
      }

      // Optional extra fields if supported on backend
      if (article.photographer) formData.append('photographer', article.photographer);
      if (article.articleUrl) formData.append('article_url', article.articleUrl);

      // Determine endpoint based on status
      const endpoint = status === 'draft' ? '/article-requests/draft/' : '/article-requests/';
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (status === 'draft') {
        setSuccess('تم حفظ المقال كمسودة بنجاح');
      } else {
        setSuccess('تم إرسال المقال للمراجعة بنجاح');
        setPublished(true);
        // Reset form after successful publication
        setArticle({
          title: '',
          slug: '',
          text: '',
          headerImage: null,
          images: [],
          tags: []
        });
        setImagePreview(null);
        setAdditionalImages([]);
      }
      
    } catch (err) {
      console.error('Error submitting article:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('حدث خطأ أثناء إرسال المقال. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to reset for new article
  const handleNewArticle = () => {
    setPublished(false);
    setSuccess('');
    setArticle({ title: '', slug: '', text: '', headerImage: null, images: [], tags: [] });
    setImagePreview(null);
    setAdditionalImages([]);
    setError('');
  };

  // Popular architecture tags for quick selection
  const popularTags = ['عمارة', 'تصميم معماري', 'تصميم داخلي', 'مواد البناء', 'عمارة إسلامية', 'عمارة مستدامة', 'تخطيط عمراني', 'ديكور'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>كتابة مقال جديد</h1>
        <p>اكتب مقالك وشاركه مع القراء</p>
      </div>
      <div className={styles.content}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        {published ? (
          <div className={styles.publishedPanel}>
            <p>تم إرسال مقالك للمراجعة. سيتم إعلامك عند الموافقة.</p>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleNewArticle}>مقال جديد</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="title">عنوان المقال</label>
                <input type="text" id="title" name="title" value={article.title} onChange={handleTitleChange} placeholder="أدخل عنوان المقال" required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="slug">الرابط (Slug)</label>
                <input type="text" id="slug" name="slug" value={article.slug} onChange={handleInputChange} placeholder="article-slug" required />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="headerImage">الصورة الرئيسية</label>
              <input type="file" id="headerImage" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="additionalImages">صور إضافية للمقال</label>
              <input type="file" id="additionalImages" multiple accept="image/*" onChange={handleAdditionalImagesChange} className={styles.fileInput} />
              <p className={styles.helpText}>يمكنك إضافة عدة صور للمقال. سنرفعها كملفات وسيتم ربطها بالمقال بعد الموافقة.</p>
              {additionalImages.length > 0 && (
                <div className={styles.additionalImagesPreview}>
                  <h4>الصور المضافة:</h4>
                  <div className={styles.imagesGrid}>
                    {additionalImages.map((img, index) => (
                      <div key={index} className={styles.imageItem}>
                        <img src={img.preview} alt={`صورة ${index + 1}`} />
                        <div className={styles.imageOverlay}>
                          <span className={styles.imageName}>{img.name}</span>
                          <button type="button" onClick={() => removeAdditionalImage(index)} className={styles.removeImageBtn}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="tags">العلامات المعمارية (Tags)</label>
              <div className={styles.popularTags}>
                <span className={styles.popularTagsLabel}>العلامات المعمارية الشائعة:</span>
                <div className={styles.popularTagsList}>
                  {popularTags.map((tag, index) => (
                    <button key={index} type="button" onClick={() => handleTagAdd(tag)} className={`${styles.popularTag} ${article.tags.includes(tag) ? styles.tagSelected : ''}`} disabled={article.tags.includes(tag)}>{tag}</button>
                  ))}
                </div>
              </div>
              <div className={styles.tagsInputContainer}>
                <div className={styles.tagsInput}>
                  <input type="text" value={tagInput} onChange={handleTagInputChange} placeholder="ابحث عن علامة معمارية أو أضف جديدة..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())} onFocus={() => tagInput.trim() && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
                  <button type="button" onClick={() => handleTagAdd()} className={styles.addTagBtn}>إضافة</button>
                </div>
                {showSuggestions && filteredTags.length > 0 && (
                  <div className={styles.tagSuggestions}>
                    {filteredTags.slice(0, 8).map((tag, index) => (
                      <button key={index} type="button" onClick={() => handleSuggestionClick(tag)} className={styles.tagSuggestion}>{tag}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.tagsContainer}>
                {article.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                    <button type="button" onClick={() => handleTagRemove(tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="text">محتوى المقال</label>
              <textarea id="text" name="text" value={article.text} onChange={handleInputChange} placeholder="اكتب محتوى المقال هنا..." rows="20" required />
            </div>
              <div className={styles.formGroup}>
            <label htmlFor="articleUrl">رابط المقال</label>
            
  <input
    type="url"
    id="articleUrl"
    name="articleUrl"
    value={article.articleUrl || ''}
    onChange={handleInputChange}
    placeholder="أدخل رابط المقال"
  />
</div>
<div className={styles.formGroup}>
  <label htmlFor="photographer">اسم المصور</label>
  <input
    type="text"
    id="photographer"
    name="photographer"
    value={article.photographer || ''}
    onChange={handleInputChange}
    placeholder="أدخل اسم المصور"
  />
</div>
            <div className={styles.actions}>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleSaveDraft} disabled={loading}>{loading ? 'جارٍ الحفظ...' : 'حفظ كمسودة'}</button>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>{loading ? 'جارٍ الإرسال...' : 'نشر المقال'}</button>
            </div>
          
</form>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;