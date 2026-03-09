// ==========================================
// 访客通行证中心：自动处理登录、静默注册与阶级判定
// ==========================================
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    // 1. 去户籍库查名字 (顺便把 role 也查出来)
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(body.username)}&select=*`, {
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });
    const users = await checkRes.json();

    if (users.length > 0) {
      // 🚨 老用户回归
      if (users[0].password !== body.password) {
        return new Response(JSON.stringify({ error: "密码错误，你是不是冒充的？" }), { status: 401 });
      }
      return new Response(JSON.stringify({ 
        success: true, 
        message: "欢迎回来！", 
        avatar_url: users[0].avatar_url,
        role: users[0].role || 'user'  // 🚀 核心新增：返回他的阶级！
      }), { headers: { "Content-Type": "application/json" } });
      
    } else {
      // ✨ 新面孔注册 (默认都是平民 user)
      const defaultAvatar = body.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${body.username}`;
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: "POST",
        headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
        body: JSON.stringify({ username: body.username, password: body.password, avatar_url: defaultAvatar, role: 'user' })
      });

      if (!insertRes.ok) throw new Error("注册新通行证失败");

      return new Response(JSON.stringify({ 
        success: true, 
        message: "新通行证注册成功！", 
        avatar_url: defaultAvatar,
        role: 'user' // 🚀 核心新增：新注册必定是平民
      }), { headers: { "Content-Type": "application/json" } });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
