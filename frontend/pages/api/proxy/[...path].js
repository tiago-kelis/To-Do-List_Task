// pages/api/proxy/[...path].js
export default async function handler(req, res) {
    const { path } = req.query;
    const targetUrl = `https://to-do-list-task-wqkq.onrender.com/api/${path.join('/')}`;
    
    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      });
      
      const data = await response.json();
      
      // Define os headers CORS apropriados
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(500).json({ error: String(error) });
    }
  }