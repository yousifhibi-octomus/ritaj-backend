"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./AmbientMusic.module.css";

const AmbientMusic = () => {
  const [playing, setPlaying] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current.volume = 0.6;
    audioRef.current.play().catch((err) => {
      console.log("Autoplay blocked:", err);
      setPlaying(false);
    });
  }, []);

  const toggleMusic = () => {
    if (!playing) {
      audioRef.current.play().catch(err => console.log(err));
    } else {
      audioRef.current.pause();
    }
    setPlaying(!playing);
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/audio/The-Racer.mp3" type="audio/mpeg" />
      </audio>

      <div className={styles.container}>
        <button className={styles.button} onClick={toggleMusic}>
          <img
            src={playing ? "/icons/BGM-on.png" : "/icons/BGM-off.png"}
            alt={playing ? "Speaker on" : "Speaker off"}
            className={styles.icon}
          />
        </button>
      </div>
    </>
  );
};

export default AmbientMusic;
