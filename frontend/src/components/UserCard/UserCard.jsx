import React from 'react';
import Link from 'next/link';
import styles from './UserCard.module.css';

export default function UserCard({ user }) {
  return (
    <div className={styles.userCard}>
      <Link href={`/profile/${user.username}`} className={styles.userLink}>
        <div className={styles.userAvatar}>
          <img 
            src={user.avatar || '/images/avatar.jpg'} 
            alt={user.name}
          />
        </div>
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>{user.name}</h3>
          <p className={styles.userRole}>{user.role}</p>
          {user.bio && (
            <p className={styles.userBio}>{user.bio}</p>
          )}
          {user.socials && user.socials.length > 0 && (
            <div className={styles.userSocials}>
              {user.socials.slice(0, 3).map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img 
                    src={`/icons/${social.name.toLowerCase()}.png`} 
                    alt={social.name}
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}