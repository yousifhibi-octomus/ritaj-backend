
"use client";

import React, { useState, useEffect } from "react";
import styles from "./Comments.module.css";
import axios from "@/lib/axios";
import Image from "next/image";


const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:8000";

function normalizePhoto(url) {
  if (!url) return "/images/default-avatar.png";
  if (url.startsWith("/media/")) return `${API_ORIGIN}${url}`;
  return url;
}
export default function Comments({ id: articleId }) {


const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyBoxes, setReplyBoxes] = useState({});
  const [error, setError] = useState("");

  const enhanceComment = (c) => ({
    ...c,
    user_photo: normalizePhoto(c.user_photo),
    replies: (c.replies || []).map(r => ({
      ...r,
      user_photo: normalizePhoto(r.user_photo),
    })),
  });

  useEffect(() => {
    if (!articleId) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`/articles/${articleId}/comments/`);
        setComments(data.map(enhanceComment));
      } catch {
        setError("تعذر تحميل التعليقات");
      } finally {
        setLoading(false);
      }
    })();
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !articleId) return;
    setSubmitting(true);
    setError("");
    try {
      const { data } = await axios.post(`/articles/${articleId}/comments/`, {
        text: commentText.trim(),
      });
      setComments(prev => [enhanceComment(data), ...prev]);   // unified enhancement
      setCommentText("");
    } catch {
      setError("تعذر إضافة التعليق");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId) => {
    const text = replyBoxes[parentId]?.trim();
    if (!text) return;
    setReplyBoxes(p => ({ ...p, [parentId]: "" }));
    try {
      const { data } = await axios.post(`/comments/${parentId}/reply/`, { text });
      const replyEnhanced = enhanceComment(data);
      setComments(prev =>
        prev.map(c =>
          c.id === parentId
            ? { ...c, replies: [replyEnhanced, ...(c.replies || [])] }
            : c
        )
      );
    } catch {
      setError("تعذر إضافة الرد");
    }
  };

  const toggleReplyBox = (id) =>
    setReplyBoxes(p => ({ ...p, [id]: p[id] !== undefined ? p[id] : "" }));

   
  return (
    <div id={articleId}>
      <div className={styles.container}>
        <h2 className={styles.mainTitle}>أضف تعليقك</h2>

        <form className={styles.commentForm} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            rows="4"
            placeholder="اكتب تعليقك هنا..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={submitting}
          />
          <div className={styles.toolbar}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting || !commentText.trim()}
            >
              {submitting ? "جارٍ..." : "نشر التعليق"}
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </form>

        {loading && <p className={styles.loading}>جارٍ التحميل...</p>}

        <div className={styles.commentsContainer}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.avatarWrapper}>
                <img
                  src={
                    comment.user_photo ||
                    "/images/default-avatar.png"
                  }
                  alt={comment.user_name || "user"}
                  className={styles.avatar}
                />
              </div>
              <div className={styles.commentContent}>
                <div className={styles.commentMeta}>
                  <span className={styles.commentAuthor}>
                    {comment.user_name || "مستخدم"}
                  </span>
                  <span className={styles.commentTime}>
                    {comment.created_at}
                  </span>
                </div>

                <p className={styles.commentText}>{comment.text}</p>

                <div className={styles.commentActions}>
                  <div className={styles.likesDislikes}>
                    
                    <button
                      type="button"
                      className={styles.replyButton}
                      onClick={() => toggleReplyBox(comment.id)}
                    >
                      رد
                    </button>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className={styles.replies}>
                    {comment.replies.map((r) => (
                      <div key={r.id} className={styles.reply}>
                        <img
                          src={r.user_photo || "/images/default-avatar.png"}
                          alt={r.user_name || "user"}
                          className={styles.replyAvatar}
                        />
                        <div className={styles.replyBody}>
                          <div className={styles.replyMeta}>
                            <span className={styles.replyAuthor}>
                              {r.user_name || "مستخدم"}
                            </span>
                            <span className={styles.replyTime}>
                              {r.created_at  }
                            </span>
                          </div>
                          <p className={styles.replyText}>{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply form */}
                {replyBoxes[comment.id] !== undefined && (
                  <div className={styles.replyForm}>
                    <textarea
                      rows="2"
                      value={replyBoxes[comment.id]}
                      onChange={(e) =>
                        setReplyBoxes((p) => ({
                          ...p,
                          [comment.id]: e.target.value,
                        }))
                      }
                      placeholder="اكتب ردك..."
                      className={styles.replyTextarea}
                    />
                    <div className={styles.replyActions}>
                      <button
                        type="button"
                        className={styles.replySubmit}
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={!replyBoxes[comment.id]?.trim()}
                      >
                        إرسال
                      </button>
                      <button
                        type="button"
                        className={styles.replyCancel}
                        onClick={() =>
                          setReplyBoxes((p) => {
                            const cp = { ...p };
                            delete cp[comment.id];
                            return cp;
                          })
                        }
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {!loading && comments.length === 0 && (
            <p className={styles.empty}>لا توجد تعليقات بعد.</p>
          )}
        </div>
      </div>
    </div>
  );
}