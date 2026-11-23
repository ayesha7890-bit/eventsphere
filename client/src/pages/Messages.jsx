import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function Messages() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  function load() {
    api
      .get('/messages/my')
      .then((res) => setList(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function sendReply(id) {
    const text = replyText[id];
    if (!text || !text.trim()) return;
    await api.post(`/messages/${id}/reply`, { reply: text });
    setReplyText((prev) => ({ ...prev, [id]: '' }));
    load();
  }

  return (
    <div className="dir-page">
      <div className="dir-hero">
        <h1 className="dir-title">
          {user?.role === 'exhibitor' ? 'Visitor Inquiries' : 'My Inquiries & Replies'}
        </h1>
        <p className="dir-subtitle">
          {user?.role === 'exhibitor'
            ? 'Respond to questions from attendees visiting your booth.'
            : 'Track your inquiries and view responses from exhibitors.'}
        </p>
      </div>

      {loading ? (
        <div className="dir-empty">Loading messages...</div>
      ) : list.length === 0 ? (
        <div className="dir-empty">Abhi tak koi message ya inquiry nahi hai.</div>
      ) : (
        <div className="msg-list">
          {list.map((m) => (
            <div className="msg-card" key={m._id}>
              <div className="msg-card-top">
                <span className="dir-cat">
                  {user?.role === 'exhibitor'
                    ? `From: ${m.sender?.name || 'Attendee'} (${m.sender?.email || ''})`
                    : `To: ${m.exhibitorApp?.companyName || 'Exhibitor'}`}
                </span>
                <span className="dir-booth-badge">
                  {new Date(m.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>

              <h4 className="msg-subject">{m.subject}</h4>
              <p className="msg-body">{m.message}</p>

              {m.reply ? (
                <div className="msg-reply-box">
                  <strong>Exhibitor Reply:</strong> {m.reply}
                </div>
              ) : (
                user?.role === 'exhibitor' && (
                  <div className="msg-reply-form">
                    <input
                      type="text"
                      placeholder="Write your reply..."
                      value={replyText[m._id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [m._id]: e.target.value })}
                    />
                    <button type="button" className="btn btn-red" onClick={() => sendReply(m._id)}>
                      Reply
                    </button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}