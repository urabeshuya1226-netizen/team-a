/* ========================================
   StudyMate - 共有データ管理 (localStorage)
   ======================================== */

const StudyMate = {

  /* ---------- GOALS ---------- */
  getGoals() {
    try { return JSON.parse(localStorage.getItem('sm_goals') || '[]'); }
    catch { return []; }
  },
  saveGoals(goals) {
    localStorage.setItem('sm_goals', JSON.stringify(goals));
  },
  addGoal({ name, type, color }) {
    const goals = this.getGoals();
    const goal = {
      id: 'g' + Date.now(),
      name, type, color,
      tasks: [],
      createdAt: new Date().toISOString()
    };
    goals.push(goal);
    this.saveGoals(goals);
    return goal;
  },
  deleteGoal(id) {
    this.saveGoals(this.getGoals().filter(g => g.id !== id));
  },

  /* ---------- TASKS ---------- */
  addTask(goalId, name) {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return null;
    const task = { id: 't' + Date.now(), name, status: 'not_started' };
    goal.tasks.push(task);
    this.saveGoals(goals);
    return task;
  },
  setTaskStatus(goalId, taskId, status) {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const task = goal.tasks.find(t => t.id === taskId);
    if (task) { task.status = status; this.saveGoals(goals); }
  },
  deleteTask(goalId, taskId) {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      goal.tasks = goal.tasks.filter(t => t.id !== taskId);
      this.saveGoals(goals);
    }
  },
  getProgress(goal) {
    if (!goal.tasks.length) return 0;
    const done = goal.tasks.filter(t => t.status === 'completed').length;
    return Math.round((done / goal.tasks.length) * 100);
  },

  /* ---------- POSTS (Timeline) ---------- */
  getPosts() {
    try { return JSON.parse(localStorage.getItem('sm_posts') || 'null'); }
    catch { return null; }
  },
  initPosts() {
    // シードデータ（初回のみ）
    if (this.getPosts() !== null) return;
    const seed = [
      { id:'p0001', user:'りょうすけ', avatar:'u1', goal:'東大志望', body:'物理の電磁気学がやっと解けた！明日も頑張ります💪', subjects:[{name:'物理',min:180}], likes:18, likedByMe:false, createdAt: new Date(Date.now()-3*60000).toISOString() },
      { id:'p0002', user:'ゆい',       avatar:'u4', goal:'英検1級',  body:'単語帳1000個クリア🎉 リスニングも少し聞き取れるようになってきた！', subjects:[{name:'英語',min:90}],  likes:42, likedByMe:false, createdAt: new Date(Date.now()-15*60000).toISOString() },
      { id:'p0003', user:'たくみ',     avatar:'u5', goal:'医学部志望',body:'化学・生物を中心に5時間。過去問を解きまくっています。一緒に頑張れる人募集！', subjects:[{name:'化学',min:150},{name:'生物',min:150}], likes:29, likedByMe:false, createdAt: new Date(Date.now()-30*60000).toISOString() },
      { id:'p0004', user:'さくら',     avatar:'user3', goal:'共通テスト対策', body:'今日は国語に集中！古文がかなり読めるようになってきた📖', subjects:[{name:'国語',min:120}], likes:15, likedByMe:false, createdAt: new Date(Date.now()-60*60000).toISOString() },
    ];
    localStorage.setItem('sm_posts', JSON.stringify(seed));
  },
  addPost({ body, subjects }) {
    const posts = JSON.parse(localStorage.getItem('sm_posts') || '[]');
    const me = StudyMate.getMe();
    const post = {
      id: 'p' + Date.now(),
      user: me ? me.name : 'ゲスト',
      avatar: me ? me.avatarSeed : 'guest',
      goal: '',
      body, subjects,
      likes: 0,
      likedByMe: false,
      createdAt: new Date().toISOString()
    };
    posts.unshift(post);
    localStorage.setItem('sm_posts', JSON.stringify(posts));
    return post;
  },
  toggleLike(id) {
    const posts = JSON.parse(localStorage.getItem('sm_posts') || '[]');
    const post = posts.find(p => p.id === id);
    if (!post) return 0;
    post.likedByMe = !post.likedByMe;
    post.likes += post.likedByMe ? 1 : -1;
    localStorage.setItem('sm_posts', JSON.stringify(posts));
    return { likes: post.likes, likedByMe: post.likedByMe };
  },

  /* ==========================================
     AUTH (localStorage ベース)
     ========================================== */

  getUsers() {
    try { return JSON.parse(localStorage.getItem('sm_users') || '[]'); }
    catch { return []; }
  },

  register({ name, email, password }) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      return { ok: false, error: 'このメールアドレスはすでに登録されています。' };
    }
    const user = {
      id: 'u' + Date.now(),
      name,
      email,
      password,
      avatarSeed: name + Date.now(),
      createdAt: new Date().toISOString()
    };
    users.push(user);
    localStorage.setItem('sm_users', JSON.stringify(users));
    localStorage.setItem('sm_session', JSON.stringify({ userId: user.id }));
    return { ok: true, user };
  },

  login({ email, password }) {
    const user = this.getUsers().find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, error: 'メールアドレスまたはパスワードが間違っています。' };
    localStorage.setItem('sm_session', JSON.stringify({ userId: user.id }));
    return { ok: true, user };
  },

  logout() {
    localStorage.removeItem('sm_session');
  },

  getMe() {
    try {
      const session = JSON.parse(localStorage.getItem('sm_session') || 'null');
      if (!session) return null;
      return this.getUsers().find(u => u.id === session.userId) || null;
    } catch { return null; }
  },

  requireAuth() {
    if (!this.getMe()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};
