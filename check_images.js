const run = async () => {
  try {
    const loginRes = await fetch('https://taskcanvas-9eul.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'Admin123$%^' })
    });
    const { token } = await loginRes.json();
    
    const projRes = await fetch('https://taskcanvas-9eul.onrender.com/api/projects?status=Feedback', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const projects = await projRes.json();
    console.log(JSON.stringify(projects, null, 2));
  } catch (error) {
    console.error(error);
  }
};
run();
