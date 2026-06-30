import React, { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getComments, addComment, deleteComment } from './api/tasks';

const STATUSES = [
  { value: 'todo', label: 'To Do', color: '#6366f1' },
  { value: 'inprogress', label: 'In Progress', color: '#f59e0b' },
  { value: 'done', label: 'Done', color: '#22c55e' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

const statusInfo = (v) => STATUSES.find(s => s.value === v) || STATUSES[0];
const priorityInfo = (v) => PRIORITIES.find(p => p.value === v) || PRIORITIES[1];

const styles = {
  app: { minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: "'Segoe UI', sans-serif" },
  header: { background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 },
  headerTitle: { fontSize: 20, fontWeight: 700, color: '#6366f1', letterSpacing: '-0.5px' },
  headerSub: { fontSize: 12, color: '#64748b', marginLeft: 8 },
  main: { maxWidth: 1400, margin: '0 auto', padding: '24px 16px' },
  toolbar: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' },
  input: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', flex: 1, minWidth: 180 },
  select: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none', cursor: 'pointer' },
  btn: { background: '#6366f1', border: 'none', borderRadius: 8, padding: '8px 18px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' },
  btnDanger: { background: '#dc2626', border: 'none', borderRadius: 6, padding: '5px 10px', color: '#fff', fontSize: 12, cursor: 'pointer' },
  btnSecondary: { background: '#334155', border: 'none', borderRadius: 6, padding: '5px 10px', color: '#e2e8f0', fontSize: 12, cursor: 'pointer' },
  columns: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' },
  column: { background: '#1e293b', borderRadius: 12, padding: 16, minHeight: 200 },
  colHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  colTitle: { fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 },
  colDot: { width: 10, height: 10, borderRadius: '50%' },
  colCount: { background: '#334155', borderRadius: 20, padding: '2px 10px', fontSize: 12, color: '#94a3b8' },
  card: { background: '#0f172a', borderRadius: 10, padding: 14, marginBottom: 10, cursor: 'pointer', border: '1px solid #1e293b', transition: 'border-color 0.2s' },
  cardTitle: { fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#f1f5f9' },
  cardMeta: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  badge: { borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.3px' },
  cardDate: { fontSize: 11, color: '#64748b', marginLeft: 'auto' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid #1e293b' },
  commentCount: { fontSize: 11, color: '#64748b' },
  cardActions: { display: 'flex', gap: 6 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
  modal: { background: '#1e293b', borderRadius: 16, padding: 28, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' },
  modalTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#f1f5f9' },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  formInput: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  textarea: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box', fontFamily: 'inherit' },
  modalFooter: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 },
  btnOutline: { background: 'transparent', border: '1px solid #334155', borderRadius: 8, padding: '9px 18px', color: '#94a3b8', fontSize: 14, cursor: 'pointer' },
  commentSection: { marginTop: 24, borderTop: '1px solid #334155', paddingTop: 20 },
  commentSectionTitle: { fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 12 },
  comment: { background: '#0f172a', borderRadius: 8, padding: '10px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  commentBody: { flex: 1 },
  commentAuthor: { fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 2 },
  commentText: { fontSize: 13, color: '#e2e8f0' },
  commentTime: { fontSize: 11, color: '#475569', marginTop: 2 },
  addComment: { display: 'flex', gap: 8, marginTop: 10 },
  emptyState: { textAlign: 'center', padding: '32px 0', color: '#475569', fontSize: 13 },
};

function TaskModal({ task, onClose, onSave, onDelete }) {
  const isEdit = !!task?.id;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || '',
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('User');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getComments(task.id).then(r => setComments(r.data)).catch(() => {});
    }
  }, [isEdit, task?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const data = { ...form, due_date: form.due_date || null };
      if (isEdit) await updateTask(task.id, data);
      else await createTask(data);
      onSave();
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const r = await addComment(task.id, { author: commentAuthor || 'User', text: newComment });
    setComments(c => [...c, r.data]);
    setNewComment('');
  };

  const handleDeleteComment = async (cid) => {
    await deleteComment(cid);
    setComments(c => c.filter(x => x.id !== cid));
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <h2 style={styles.modalTitle}>{isEdit ? 'Edit Task' : 'Create Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input style={styles.formInput} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the task..." />
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select style={{ ...styles.formInput, cursor: 'pointer' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Priority</label>
              <select style={{ ...styles.formInput, cursor: 'pointer' }} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Due Date</label>
            <input type="date" style={styles.formInput} value={form.due_date || ''} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
          <div style={styles.modalFooter}>
            {isEdit && <button type="button" onClick={() => onDelete(task.id)} style={{ ...styles.btnDanger, padding: '9px 16px', fontSize: 14, borderRadius: 8 }}>Delete</button>}
            <div style={{ flex: 1 }} />
            <button type="button" onClick={onClose} style={styles.btnOutline}>Cancel</button>
            <button type="submit" style={styles.btn} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>

        {isEdit && (
          <div style={styles.commentSection}>
            <div style={styles.commentSectionTitle}>💬 Comments ({comments.length})</div>
            {comments.length === 0 && <div style={{ ...styles.emptyState, padding: '12px 0' }}>No comments yet</div>}
            {comments.map(c => (
              <div key={c.id} style={styles.comment}>
                <div style={styles.commentBody}>
                  <div style={styles.commentAuthor}>{c.author}</div>
                  <div style={styles.commentText}>{c.text}</div>
                  <div style={styles.commentTime}>{new Date(c.created_at).toLocaleString()}</div>
                </div>
                <button onClick={() => handleDeleteComment(c.id)} style={{ ...styles.btnDanger, marginLeft: 8, fontSize: 11, padding: '3px 8px' }}>✕</button>
              </div>
            ))}
            <div style={styles.addComment}>
              <input style={{ ...styles.formInput, flex: '0 0 110px' }} value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)} placeholder="Your name" />
              <input style={{ ...styles.formInput, flex: 1 }} value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment…" onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
              <button onClick={handleAddComment} style={styles.btn}>Post</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onClick, onEdit, onDelete, onStatusChange }) {
  const pInfo = priorityInfo(task.priority);
  const sInfo = statusInfo(task.status);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div style={{ ...styles.card, borderColor: '#1e293b' }} onClick={() => onClick(task)}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}>
      <div style={styles.cardTitle}>{task.title}</div>
      {task.description && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.description}</div>}
      <div style={styles.cardMeta}>
        <span style={{ ...styles.badge, background: pInfo.color + '22', color: pInfo.color }}>▲ {pInfo.label}</span>
        {task.due_date && (
          <span style={{ ...styles.badge, background: isOverdue ? '#ef444422' : '#33415540', color: isOverdue ? '#ef4444' : '#94a3b8' }}>
            📅 {task.due_date}
          </span>
        )}
        {task.comment_count > 0 && <span style={styles.commentCount}>💬 {task.comment_count}</span>}
      </div>
      <div style={styles.cardFooter}>
        <div style={styles.cardActions} onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(task)} style={styles.btnSecondary}>Edit</button>
          <button onClick={() => onDelete(task.id)} style={styles.btnDanger}>Delete</button>
        </div>
        <select
          value={task.status}
          onClick={e => e.stopPropagation()}
          onChange={e => onStatusChange(task.id, e.target.value)}
          style={{ ...styles.select, padding: '3px 8px', fontSize: 11, borderRadius: 6, color: sInfo.color, borderColor: sInfo.color + '44', background: sInfo.color + '11' }}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (search) params.search = search;
      const r = await getTasks(params);
      setTasks(r.data);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, search]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await deleteTask(id);
    setShowModal(false);
    loadTasks();
  };

  const handleStatusChange = async (id, status) => {
    await updateTask(id, { status });
    loadTasks();
  };

  const handleSave = () => {
    setShowModal(false);
    setSelectedTask(null);
    loadTasks();
  };

  const openCreate = () => { setSelectedTask(null); setShowModal(true); };
  const openEdit = (task) => { setSelectedTask(task); setShowModal(true); };
  const openView = (task) => { setSelectedTask(task); setShowModal(true); };

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s.value] = tasks.filter(t => t.status === s.value);
    return acc;
  }, {});

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={styles.headerTitle}>⚡ TaskFlow</span>
          <span style={styles.headerSub}>Task Management</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>{doneTasks}/{totalTasks} done</span>
          <button style={styles.btn} onClick={openCreate}>+ New Task</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <input style={styles.input} placeholder="🔍 Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
          <select style={styles.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select style={styles.select} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {(filterStatus || filterPriority || search) && (
            <button style={styles.btnSecondary} onClick={() => { setFilterStatus(''); setFilterPriority(''); setSearch(''); }}>Clear Filters</button>
          )}
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading tasks…</div>
        ) : (
          <div style={styles.columns}>
            {STATUSES.map(s => (
              <div key={s.value} style={styles.column}>
                <div style={styles.colHeader}>
                  <div style={styles.colTitle}>
                    <div style={{ ...styles.colDot, background: s.color }} />
                    {s.label}
                  </div>
                  <span style={styles.colCount}>{grouped[s.value]?.length || 0}</span>
                </div>
                {grouped[s.value]?.length === 0 && (
                  <div style={styles.emptyState}>No tasks</div>
                )}
                {grouped[s.value]?.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={openView}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => { setShowModal(false); setSelectedTask(null); }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
