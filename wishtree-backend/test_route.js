async function testFeedback() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@wishtree.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log(loginData);
    const token = loginData.token;
    
    console.log("Logged in!");
    
    const projRes = await fetch('http://localhost:5000/api/projects?status=Feedback', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!projRes.ok) {
        console.log("Error status:", projRes.status);
        console.log("Error text:", await projRes.text());
        return;
    }
    
    console.log("Projects:", await projRes.json());
  } catch (error) {
    console.error(error);
  }
}

testFeedback();
