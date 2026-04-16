import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from './Dashboard';
import { follow, deleteFollower, likePost, unlikePost } from '../api';

// --- REUSABLE CAROUSEL COMPONENT ---
const PostCarousel = ({ images }: { images: string[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
      setActiveIndex(index);
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="post-carousel-wrapper" style={{ position: 'relative', margin: '10px 0', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar"
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          aspectRatio: '1/1',
        }}
      >
        {images.map((url, idx) => (
          <div 
            key={idx} 
            style={{ 
              minWidth: '100%', 
              height: '100%',
              scrollSnapAlign: 'start',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img 
              src={url} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
          background: 'rgba(0,0,0,0.3)',
          padding: '5px 10px',
          borderRadius: '20px',
          backdropFilter: 'blur(4px)',
          zIndex: 10
        }}>
          {images.map((_, idx) => (
            <div 
              key={idx}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: activeIndex === idx ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const UserProfile = ({ onLogout }: { onLogout: () => void }) => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  const fetchInitialData = async () => {
    try {
      // 1. Get current logged in user info
      const meRes = await fetch('/api/me', { credentials: 'include' });
      const meData = await meRes.json();
      setCurrentUser(meData);
      // 2. Get target profile data
      const response = await fetch(`/api/users/${id}/profile`, { credentials: 'include' });
      const result = await response.json();
      setData(result);
      setPosts(result.posts || []);
    } catch (err) {
      console.error("Failed to load profile data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const handleFollowToggle = async () => {
    try {
      if (data.profile.is_following) {
        await deleteFollower(parseInt(id!));
      } else {
        await follow(parseInt(id!));
      }
      
      // Refresh only profile data to update follow status
      const response = await fetch(`/api/users/${id}/profile`, { credentials: 'include' });
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Follow action failed", err);
    }
  };

  const handleLike = async (postItem: any) => {
    try {
      if (postItem.is_liked) {
        await unlikePost(postItem.id);
      } else {
        await likePost(postItem.id);
      }
      
      // Update the local 'posts' state manually for immediate feedback
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postItem.id
            ? { 
                ...p, 
                is_liked: !p.is_liked, 
                like_count: (parseInt(p.like_count) || 0) + (p.is_liked ? -1 : 1) 
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  }; 

  if (loading) return <div className="loading-screen">Loading Athlete Profile...</div>;
  if (!data) return <Layout title="Not Found" onLogout={onLogout}><div className="card">User not found</div></Layout>;

  const isOwnProfile = currentUser?.id === parseInt(id!);

  return (
    <Layout title={`${data.profile.username}'s Profile`} onLogout={onLogout}>
      <div className="profile-wrapper">
        {/* User Hero Card */}
        <div className="profile-card-hero">
          <div className="hero-content">
            <div className="avatar-container">
              <img 
                src={`https://ui-avatars.com/api/?name=${data.profile.username}&background=6366f1&color=fff&size=150&bold=true`} 
                alt="Avatar" 
                className="hero-avatar" 
              />
            </div>
            <div className="hero-info">
              <h1>{data.profile.username}</h1>
              <p className="email-tag">{data.profile.email}</p>
              <div className="badge-row" style={{ marginBottom: '20px' }}>
                <span className="profile-badge indigo">{data.profile.total_workouts} Workouts</span>
                <span className="profile-badge emerald">Athlete</span>
              </div>
              
              {!isOwnProfile && (
                <button 
                  className={data.profile.is_following ? "outline-btn" : "primary-btn"} 
                  onClick={handleFollowToggle}
                  style={{ width: 'fit-content', padding: '10px 30px' }}
                >
                  {data.profile.is_following ? "Following" : "Follow"}
                </button>
              )}
              {isOwnProfile && (
                <span className="profile-badge goal">Viewing your own profile</span>
              )}
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <h2 style={{ marginTop: '20px' }}>Recent Activity</h2>
        <div className="posts-list">
          {posts.map((post: any) => (
            <div key={post.id} className="card post-card">
              <div className="post-header">
                <img src={`https://ui-avatars.com/api/?name=${data.profile.username}&background=random`} alt="Avatar" className="post-avatar" />
                <div className="post-user-info">
                  <h4>{data.profile.username}</h4>
                  <span className="post-time">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="post-content">
                <p>{post.content}</p>
              </div>

              {/* --- DISPLAY MULTIPLE IMAGES IN CAROUSEL --- */}
              {post.images && post.images.length > 0 && (
                <PostCarousel images={post.images} />
              )}

              {/* --- DISPLAY ATTACHED WORKOUTS --- */}
              {post.attached_workouts && post.attached_workouts.length > 0 && (
                <div className="post-workouts-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {post.attached_workouts.map((w: any) => (
                    <div key={w.id} className="workout-badge">
                      <i className="fas fa-dumbbell"></i>
                      <div className="workout-details">
                        <span>{w.exercise}</span>
                        <small>{w.sets} x {w.reps} @ {w.weight}kg</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="post-footer">
                <button 
                  className={`post-action-btn like ${post.is_liked ? 'liked' : ''}`}
                  onClick={() => handleLike(post)}
                >
                  <i className={`${post.is_liked ? 'fas' : 'far'} fa-heart`}></i> {post.like_count || 0} Likes
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-muted">No posts yet from this athlete.</p>}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
