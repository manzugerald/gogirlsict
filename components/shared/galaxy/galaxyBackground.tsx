'use client';
import '@/assets/styles/galaxy.css'; 
export default function GalaxyBackground() {
  return (
    <div className="galaxy-background">
      <div className="nebula" />
      <div className="clusters" />
      <div className="stars" />
      <div className="twinkling-stars" />
      <div className="twinkling" />
      <div className="clouds" />
    </div>
  );
}
