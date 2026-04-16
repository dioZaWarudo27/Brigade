import React, { useState } from 'react';

interface PostCarouselProps {
  images: string[];
}

/**
 * Senior Dev Tip: 
 * We use 'scroll-snap-type' for a native-feeling swipe experience. 
 * It's much lighter than heavy slider libraries like Swiper or Slick.
 */
const PostCarousel: React.FC<PostCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentIndex(index);
  };

  return (
    <div className="post-carousel-wrapper" style={{ position: 'relative', width: '100%', marginBottom: '15px' }}>
      <div 
        className="post-carousel-container" 
        onScroll={handleScroll}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          borderRadius: '12px',
          background: '#000'
        }}
      >
        {images.map((url, idx) => (
          <div 
            key={idx} 
            style={{ 
              flex: '0 0 100%', 
              scrollSnapAlign: 'start',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: '1/1', // Forces Instagram-style square aspect ratio
              maxHeight: '500px'
            }}
          >
            <img 
              src={url} 
              alt={`Post content ${idx + 1}`} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain' // Ensures the full image is visible
              }} 
            />
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      {images.length > 1 && (
        <div className="carousel-dots" style={{
          position: 'absolute',
          bottom: '15px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
          padding: '6px 10px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '20px',
          pointerEvents: 'none'
        }}>
          {images.map((_, idx) => (
            <div 
              key={idx} 
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: currentIndex === idx ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>
      )}

      {/* Swipe Indicator for Deskstop */}
      {images.length > 1 && currentIndex === 0 && (
        <div className="swipe-hint" style={{
          position: 'absolute',
          right: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(99, 102, 241, 0.8)',
          color: '#fff',
          padding: '8px',
          borderRadius: '50%',
          fontSize: '0.8rem',
          animation: 'bounceRight 2s infinite'
        }}>
          <i className="fas fa-chevron-right"></i>
        </div>
      )}

      <style>{`
        .post-carousel-container::-webkit-scrollbar {
          display: none; // Safari/Chrome
        }
        @keyframes bounceRight {
          0%, 20%, 50%, 80%, 100% { transform: translate(0, -50%); }
          40% { transform: translate(-5px, -50%); }
          60% { transform: translate(-3px, -50%); }
        }
      `}</style>
    </div>
  );
};

export default PostCarousel;
