// ==========================================
// 图像直传枢纽：接收前端图片，转存至 Supabase Storage
// ==========================================
export async function onRequestPost(context) {
  try {
    // 1. 解析前端传来的文件 (FormData 格式)
    const formData = await context.request.formData();
    const file = formData.get('file');
    if (!file) throw new Error("接收舱空空如也，没有发现文件");

    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    // 2. 极客重命名：防止重名文件互相覆盖 (时间戳 + 随机乱码)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // 3. 呼叫 Supabase 的底层 Storage 接口，把文件塞进 avatars 桶里
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/avatars/${fileName}`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
        "Content-Type": file.type
      },
      body: file
    });

    if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error("云端仓库拒绝接收: " + (err.message || '未知错误'));
    }

    // 4. 拼接出这这张图片的“全网公开访问链接”，丢给前端
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`;

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
