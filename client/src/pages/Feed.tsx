import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from './Dashboard';
import { getFeed, createPosts, deletePost, getProfile, searchUsers, likePost, getComments, postComment,unlikePost, getWorkouts } from '../api';
import { useRef } from 'react';
import toast from 'react-hot-toast';

//tobelearned
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

//tobelearned
const CommentItem = ({ comment, onReply }: { comment: any, onReply: (parentId: number, text: string) => void }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
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

const Feed = ({ onLogout }: { onLogout: () => void }) => {
    const navigate = useNavigate();
    const [post, setPost] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    // --- INFINITE SCROLL STATES ---
    const [cursor, setCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    // --- NEW STATES FOR MULTI-POSTS ---
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [userWorkouts, setUserWorkouts] = useState<any[]>([]);
    const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<number[]>([]);
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [postComments, setPostComments] = useState<{[key: number]: any[]}>({});
    const [visibleComments, setVisibleComments] = useState<{[key: number]: boolean}>({});
    const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});

    const fetchPosts = async() =>{
      try{
        const data = await getFeed();
        // Backend now returns { posts: [], nextCursor: number | null }
        setPost(data.posts || []);
        setCursor(data.nextCursor);
        setHasMore(data.nextCursor !== null);
      }catch(err){
        console.error('error', err)
      }
    }

    const fetchMorePosts = useCallback(async () => {
      if (!cursor || loadingMore || !hasMore) return;
      
      setLoadingMore(true);
      try {
        const data = await getFeed(cursor);
        setPost(prev => [...prev, ...(data.posts || [])]);
        setCursor(data.nextCursor);
        setHasMore(data.nextCursor !== null);
      } catch (err) {
        console.error("Failed to load more posts", err);
      } finally {
        setLoadingMore(false);
      }
    }, [cursor, loadingMore, hasMore]);

    // Senior Tip: The "Engine" of the infinite scroll
    const lastPostRef = useCallback((node: any) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMorePosts();
        }
      });
      
      if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, fetchMorePosts]);

    const fetchUser = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };

    const fetchWorkouts = async () => {
      try {
        const data = await getWorkouts();
        setUserWorkouts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch workouts", err);
      }
    };

    useEffect(() =>{
      fetchPosts();
      fetchUser();
      fetchWorkouts();
    },[])

    const toggleComments = async (postId: number) => {
      if (!visibleComments[postId]) {
        try {
          const comments = await getComments(postId);
          setPostComments(prev => ({ ...prev, [postId]: comments }));
        } catch (err) {
          console.error("Failed to fetch comments", err);
        }
      }
      setVisibleComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleCommentSubmit = async (postId: number, content: string, parentId?: number) => {
      try {
        const newComment = await postComment({ post_id: postId, content, parent_id: parentId });
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment]
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      } catch (err) {
        console.error("Failed to post comment", err);
      }
    };

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() =>{
      if(searchQuery.length <= 1){
        setSearchResults([])
        return
      }
      const timer = setTimeout(async() =>{
        try{
          const result = await searchUsers(searchQuery)
          setSearchResults(result)
        }catch(err){
          toast.error('error')
          console.log(err)
        }
      },500)
      return () =>{
        clearTimeout(timer)
      }
    },[searchQuery])

    // --- FILE HANDLING ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const filesArray = Array.from(e.target.files).slice(0, 5); // Limit to 5
        setSelectedFiles(filesArray);
        
        // Create previews
        const urls = filesArray.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
      }
    };

    const removeFile = (index: number) => {
      const newFiles = [...selectedFiles];
      newFiles.splice(index, 1);
      setSelectedFiles(newFiles);

      const newUrls = [...previewUrls];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      setPreviewUrls(newUrls);
    };

    // --- WORKOUT SELECTION ---
    const toggleWorkoutSelection = (id: number) => {
      setSelectedWorkoutIds(prev => 
        prev.includes(id) ? prev.filter(wid => wid !== id) : [...prev, id]
      );
    };

    const handleSubmit = async(e: React.SubmitEvent) =>{
      e.preventDefault();
      const MAX_SIZE = 3 * 1024 * 1024;
      for (const file of selectedFiles){
        if(file.size > MAX_SIZE){
          toast.error('File size too big')
          return
        }
      }
      
      const postFormData = new FormData();
      postFormData.append('content', content);
      
      // Add multiple images
      selectedFiles.forEach(file => {
        postFormData.append('images', file);
      });

      // Add workout IDs as stringified array
      if (selectedWorkoutIds.length > 0) {
        postFormData.append('workoutIds', JSON.stringify(selectedWorkoutIds));
      }

      try{
        await createPosts(postFormData);
        toast.success('Posted!');
        // Reset everything
        setContent('');
        setSelectedFiles([]);
        setPreviewUrls([]);
        setSelectedWorkoutIds([]);
        fetchPosts();
      }catch(err){
        console.error('err', err);
        toast.error('Failed to post. Check console.');
      }
    };

    const handleDeletePost = (id: number) => {
      toast((t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>Delete this post?</span>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            <button 
              onClick={async () => {
                toast.dismiss(t.id); // Senior Fix: Dismiss BEFORE starting new actions
                const deletePromise = deletePost(id);
                toast.promise(deletePromise, {
                  loading: 'Deleting...',
                  success: 'Post deleted.',
                  error: 'Failed to delete.',
                }, {
                  id: `delete-post-${id}` // Static ID prevents duplicate toasts
                });
                try {
                  await deletePromise;
                  fetchPosts();
                } catch (err) {
                  console.error('Delete error:', err);
                }
              }}
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Delete
            </button>
            <button 
              onClick={() => toast.dismiss(t.id)}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ), {
        id: 'confirm-delete-post', // Static ID ensures only one confirm toast exists
        duration: Infinity,
        position: 'bottom-center',
        style: {
          background: 'var(--card-bg)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
          padding: '16px',
          minWidth: '250px'
        }
      });
    }

    const handleLike = async (postId: any) => {
      try {
        await likePost(postId);
        setPost((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { 
                  ...p, 
                  is_liked: true, 
                  like_count: (parseInt(p.like_count) || 0) + 1 
                }
              : p
          )
        );
      } catch (err) {
        console.error("Error liking post:", err);
      }
    };

    const handleUnlike = async (postId: any) => {
      try {
        await unlikePost(postId);
        setPost((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { 
                  ...p, 
                  is_liked: false, 
                  like_count: Math.max(0, (parseInt(p.like_count) || 0) - 1) 
                }
              : p
          )
        );
      } catch (err) {
        console.error("Error unliking post:", err);
      }
    };



    // Top Right Search Content
    const searchHeader = (
        <div className="top-search-bar">    
            <div className="search-input-wrapper-header">
                <input
                    type="text"
                    placeholder="Search athletes..."
                    className="header-search-input"       
                    value={searchQuery}
                    onChange={handleSearch} 
                />
                <button className="magnifying-glass-btn"><i className="fas fa-search"></i></button>

                {/* Search Results Dropdown */} 
                {searchResults.length > 0 && (  
                    <div className="search-results-dropdown">  
                        {searchResults.map((u: any) => (
                            <Link 
                              to={`/user/${u.id}`}
                              key={u.id} 
                              className="search-result-item" 
                              onClick={() => {
                                setSearchResults([]);
                                setSearchQuery('');
                              }}
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <img src={`https://ui-avatars.com/api/?name=${u.username}&size=30`} alt="" />    
                                <span>{u.username}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <Link to="/profile">
              <img 
                  src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=6366f1&color=fff&size=40`} 
                  alt="Profile" 
                  className="header-profile-circle" 
                  style={{ cursor: 'pointer' }}
              />
            </Link>
        </div>
    );

  return (
    <Layout title="Community Feed" onLogout={onLogout} rightContent={searchHeader}>
      <div className="feed-layout">
        
        {/* Main Feed Content */}
        <div className="feed-main">
          {/* Create Post Section */}
          <form className="card create-post-card" onSubmit={handleSubmit}>
            <div className="create-post-header">
               <img src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=6366f1&color=fff`} alt="Avatar" className="post-avatar" />
               <textarea 
                 placeholder={`What's on your mind, ${user?.username || 'Athlete'}?`} 
                 className="post-input"
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 required
               ></textarea>
            </div>

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <div className="image-previews" style={{ display: 'flex', gap: '10px', padding: '10px', flexWrap: 'wrap' }}>
                {previewUrls.map((url, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img src={url} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <button 
                      type="button" 
                      onClick={() => removeFile(index)}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '20px', height: '20px' }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Workouts Info */}
            {selectedWorkoutIds.length > 0 && (
              <div className="selected-workouts-preview" style={{ padding: '0 20px 10px', fontSize: '0.85rem', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-check-circle"></i> 
                <span>{selectedWorkoutIds.length} Workouts Attached</span>
                <button 
                 type="button" 
                 onClick={() => setSelectedWorkoutIds([])}
                 style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', marginLeft: '5px' }}
                >
                  (Clear)
                </button>
              </div>
            )}

            <div className="create-post-actions">
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button type="button" className="post-tool-btn" onClick={() => fileInputRef.current?.click()}>
                <i className="fas fa-image" style={{ color: 'var(--accent-emerald)' }}></i> Photo
              </button>
              <button type="button" className="post-tool-btn" onClick={() => setShowWorkoutModal(true)}>
                <i className="fas fa-dumbbell" style={{ color: 'var(--accent-indigo)' }}></i> Attach Workout
              </button>
              <button type="submit" className="primary-btn post-submit-btn">Post</button>
            </div>
            </form>

            {/* Workout Selection Modal */}
            {showWorkoutModal && (
            <div className="modal-overlay" onClick={() => setShowWorkoutModal(false)}>
              <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Attach Workouts</h3>
                  <button className="modal-close-btn" onClick={() => setShowWorkoutModal(false)}>×</button>
                </div>

                <div className="workout-selection-list">
                  {userWorkouts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      <i className="fas fa-info-circle" style={{ display: 'block', fontSize: '2rem', marginBottom: '10px' }}></i>
                      <p>No workouts found. Log some first!</p>
                    </div>
                  )}

                  {userWorkouts.map(w => {
                    const isSelected = selectedWorkoutIds.includes(w.id);
                    return (
                      <div
                        key={w.id}
                        className={`workout-select-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleWorkoutSelection(w.id)}
                      >
                        <div className="workout-select-icon">
                          <i className="fas fa-dumbbell"></i>
                        </div>
                        <div className="workout-select-info">
                          <h4>{w.exercise}</h4>
                          <p>{w.sets} sets × {w.reps} reps @ {w.weight}kg</p>
                        </div>
                        <div className="workout-select-check">
                          <i className="fas fa-check-circle"></i>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button className="primary-btn" onClick={() => setShowWorkoutModal(false)} style={{ width: '100%' }}>
                  Done ({selectedWorkoutIds.length} selected)
                </button>
              </div>
            </div>
            )}
          {/* Posts List */}
          <div className="posts-list">
            {post.map((item: any, index: number) => {
              const isLastPost = post.length === index + 1;
              return (
                <div 
                  key={item.id} 
                  ref={isLastPost ? lastPostRef : null} 
                  className="card post-card"
                  style={{ marginBottom: '20px', padding: '0' }}
                >
                  <div className="post-header">
                  <Link to={`/user/${item.user_id}`}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${item.username}&background=random`} 
                      alt="Avatar" 
                      className="post-avatar" 
                      style={{ cursor: 'pointer' }}
                    />
                  </Link>
                  <div className="post-user-info">
                    <Link to={`/user/${item.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h4>{item.username}</h4>
                    </Link>
                    <span className="post-time">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <div className="post-header-actions">
                    {Number(item.user_id) === Number(user?.id) && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDeletePost(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginRight: '8px' }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                    <button className="post-more-btn"><i className="fas fa-ellipsis-h"></i></button>
                  </div>
                </div>

                <div className="post-content">
                  <p>{item.content}</p>
                </div>

                {/* --- DISPLAY MULTIPLE IMAGES IN CAROUSEL --- */}
                {item.images && item.images.length > 0 && (
                  <PostCarousel images={item.images} />
                )}

                {/* --- DISPLAY ATTACHED WORKOUTS --- */}
                {item.attached_workouts && item.attached_workouts.length > 0 && (
                  <div className="post-workouts-list" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                    {item.attached_workouts.map((w: any) => (
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

                {/* Old single gym join fallback */}
                {!item.attached_workouts?.length && item.exercise && (
                  <div className="post-workout-attachment">
                    <div className="workout-badge">
                      <i className="fas fa-award"></i>
                      <div className="workout-details">
                        <span>{item.exercise}</span>
                        <small>{item.sets} x {item.reps} @ {item.weight}kg</small>
                      </div>
                    </div>
                  </div>
                )}

                <div className="post-footer">
                  <button 
                    className="post-action-btn like" 
                    onClick={() => item.is_liked ? handleUnlike(item.id) : handleLike(item.id)}
                  >
                    <i className={item.is_liked ? "fas fa-heart" : "far fa-heart"} style={{ color: item.is_liked ? '#ef4444' : 'inherit' }}></i> 
                    {item.like_count || 0}
                  </button>
                  <button className="post-action-btn" onClick={() => toggleComments(item.id)}>
                    <i className="far fa-comment"></i> Comment
                  </button>
                  <button className="post-action-btn">
                    <i className="far fa-share-square"></i> Share
                  </button>
                </div>

                {/* Comments Section */}
                {visibleComments[item.id] && (
                  <div className="post-comments-container" style={{ padding: '15px', borderTop: '1px solid #eee' }}>
                    {/* Top Level Comment Input */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (commentInputs[item.id]) handleCommentSubmit(item.id, commentInputs[item.id]);
                      }}
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
                        value={commentInputs[item.id] || ""}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                        style={{ flex: 1, padding: '8px 15px', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', outline: 'none' }}
                      />
                    </form>

                    {/* Recursive Comment List */}
                    <div className="comments-tree">
                      {buildCommentTree(postComments[item.id] || []).map(comment => (
                        <CommentItem 
                          key={comment.id} 
                          comment={comment} 
                          onReply={(parentId, text) => handleCommentSubmit(item.id, text, parentId)} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {post.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p className="text-muted">The feed is quiet... start the conversation! 🏋️‍♂️</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Facebook Style) */}
        <aside className="feed-sidebar">
          {/* Mini Profile Card */}
          <div className="card mini-profile-card">
            <div className="mini-profile-cover"></div>
            <div className="mini-profile-content">
              <Link to="/profile">
                <img src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=6366f1&color=fff&size=80`} alt="Avatar" className="mini-avatar" />
              </Link>
              <h3>{user?.username || 'Athlete'}</h3>
              <p>{user?.email}</p>
              <div className="mini-stats">
                <div className="mini-stat-item">
                  <span>{user?.total_workouts || 0}</span>
                  <small>Workouts</small>
                </div>
                <div className="mini-stat-item">
                  <span>{user?.streak || 0}</span>
                  <small>Streak</small>
                </div>
              </div>
              <button className="secondary-btn" onClick={() => navigate('/profile')} style={{ marginTop: '15px' }}>View Profile</button>
            </div>
          </div>

          {/* Suggestions placeholder */}
          <div className="card suggestions-card">
            <h3>Suggested for you</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Find more friends to follow.</p>
          </div>
        </aside>

      </div>
    </Layout>
  );
};

export default Feed;
