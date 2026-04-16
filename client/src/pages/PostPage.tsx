import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from './Dashboard';
import { getPost, getComments, postComment, likePost, unlikePost, getProfile } from '../api';
import { useRef } from 'react';

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

// Simplified Comment Item for PostPage
const CommentItem = ({ comment, onReply }: { comment: any, onReply: (parentId: number, text: string) => void }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText("");
    setShowReplyForm(false);
  };

  return (
    <div className="comment-item" style={{ marginLeft: comment.parent_id ? '20px' : '0', marginTop: '10px' }}>
      <div className="comment-main" style={{ display: 'flex', gap: '10px' }}>
        <img 
          src={`https://ui-avatars.com/api/?name=${comment.username}&size=30&background=random`} 
          alt="" 
          style={{ borderRadius: '50%', width: '30px', height: '30px' }} 
        />
        <div className="comment-bubble" style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '18px', flex: 1 }}>
          <h5 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>{comment.username}</h5>
          <p style={{ margin: '2px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{comment.content}</p>
        </div>
      </div>
      
      <div className="comment-actions" style={{ marginLeft: '40px', marginTop: '2px' }}>
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)}
          style={{ background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          Reply
        </button>
      </div>

      {showReplyForm && (
        <form onSubmit={handleSubmit} style={{ marginLeft: '40px', marginTop: '8px', display: 'flex', gap: '8px' }}>
          <input 
            value={replyText} 
            onChange={(e) => setReplyText(e.target.value)} 
            placeholder="Write a reply..." 
            style={{ flex: 1, padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', fontSize: '0.85rem', color: 'var(--text-main)' }}
          />
          <button type="submit" className="primary-btn" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Post</button>
        </form>
      )}

      {comment.replies && comment.replies.map((reply: any) => (
        <CommentItem key={reply.id} comment={reply} onReply={onReply} />
      ))}
    </div>
  );
};

const buildCommentTree = (flatComments: any[]) => {
  const map: any = {};
  const tree: any[] = [];

  flatComments.forEach(comment => {
    map[comment.id] = { ...comment, replies: [] };
  });

  flatComments.forEach(comment => {
    if (comment.parent_id) {
      if (map[comment.parent_id]) {
        map[comment.parent_id].replies.push(map[comment.id]);
      }
    } else {
      tree.push(map[comment.id]);
    }
  });

  return tree;
};

const PostPage = ({ onLogout }: { onLogout: () => void }) => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postData, commentData, profileData] = await Promise.all([
          getPost(id!),
          getComments(parseInt(id!)),
          getProfile()
        ]);
        setPost(postData);
        setComments(commentData);
        setUser(profileData);
      } catch (err) {
        console.error("Failed to fetch post data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleLike = async () => {
    try {
      if (post.is_liked) {
        await unlikePost(post.id);
        setPost({ ...post, is_liked: false, like_count: Math.max(0, parseInt(post.like_count) - 1) });
      } else {
        await likePost(post.id);
        setPost({ ...post, is_liked: true, like_count: (parseInt(post.like_count) || 0) + 1 });
      }
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleCommentSubmit = async (text: string, parentId?: number) => {
    try {
      const newComment = await postComment({ post_id: parseInt(id!), content: text, parent_id: parentId });
      setComments([...comments, newComment]);
      if (!parentId) setCommentInput("");
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  if (loading) return <div className="loading-screen">Loading Post...</div>;
  if (!post) return <Layout title="Not Found" onLogout={onLogout}><div className="card">Post not found</div></Layout>;

  return (
    <Layout title="View Post" onLogout={onLogout}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="card post-card">
          <div className="post-header">
            <Link to={`/user/${post.user_id}`}>
              <img 
                src={`https://ui-avatars.com/api/?name=${post.username}&background=random`} 
                alt="Avatar" 
                className="post-avatar" 
              />
            </Link>
            <div className="post-user-info">
              <Link to={`/user/${post.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h4>{post.username}</h4>
              </Link>
              <span className="post-time">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="post-content">
            <p>{post.content}</p>
          </div>

          {/* --- DISPLAY MULTIPLE IMAGES IN CAROUSEL --- */}
          {post.images && post.images.length > 0 && (
            <PostCarousel images={post.images} />
          )}

          {post.attached_workouts && post.attached_workouts.length > 0 && (
            <div className="post-workouts-list" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
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
            <button className="post-action-btn like" onClick={handleLike}>
              <i className={post.is_liked ? "fas fa-heart" : "far fa-heart"} style={{ color: post.is_liked ? '#ef4444' : 'inherit' }}></i> 
              {post.like_count || 0}
            </button>
            <button className="post-action-btn">
              <i className="far fa-comment"></i> {comments.length} Comments
            </button>
          </div>

          <div className="post-comments-container" style={{ padding: '15px', borderTop: '1px solid var(--border-color)' }}>
            <form 
              onSubmit={(e) => { e.preventDefault(); if (commentInput) handleCommentSubmit(commentInput); }}
              style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
            >
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&size=35&background=6366f1&color=fff`} 
                alt="" 
                style={{ borderRadius: '50%', width: '35px', height: '35px' }} 
              />
              <input 
                type="text" 
                placeholder="Write a comment..." 
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                style={{ flex: 1, padding: '8px 15px', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', outline: 'none' }}
              />
            </form>

            <div className="comments-tree">
              {buildCommentTree(comments).map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onReply={(parentId, text) => handleCommentSubmit(text, parentId)} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostPage;
