const API_URL = "http://127.0.0.1:5000";

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
}

export async function registerUser(userData) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return res.json();
}

export async function getSkills() {
  const res = await fetch(`${API_URL}/skills`);
  return res.json();
}

export async function addSkill(skillData) {
  const res = await fetch(`${API_URL}/skills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(skillData),
  });

  return res.json();
}