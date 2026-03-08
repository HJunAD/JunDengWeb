export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    
    // 1. 从 Cloudflare 保险箱拿阿里云的 API Key
    const apiKey = context.env.ALIYUN_API_KEY; 

    // 2. 目标地址换成阿里云 (DashScope) 的兼容接口
    const aiResponse = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      // 3. 拦截前端传来的参数，强制指定通义千问的模型 (这里使用性价比极高的 qwen-plus)
      body: JSON.stringify({
        model: "qwen-plus", 
        messages: body.messages,
        temperature: body.temperature
      })
    });

    const data = await aiResponse.text();
    
    // 4. 原封不动返回给前端，包括状态码（方便排错）
    return new Response(data, {
      status: aiResponse.status, 
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
