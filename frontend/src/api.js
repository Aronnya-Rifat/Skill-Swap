const API_URL = "https://skill-swap-htcd.onrender.com";

// ---------------- HELPER ----------------

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Server returned non-JSON response: ${text}`);
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

// ---------------- USERS ----------------

export async function getUsers() {
  return request("/users");
}

export async function registerUser(userData) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// ---------------- SKILLS ----------------

export async function getSkills() {
  return request("/skills");
}

export async function addSkill(skillData) {
  return request("/skills", {
    method: "POST",
    body: JSON.stringify(skillData),
  });
}

// ---------------- USER OFFERS ----------------

export async function getUserOffers(userId) {
  return request(`/users/${userId}/offers`);
}

export async function addUserOffer(userId, offerData) {
  return request(`/users/${userId}/offers`, {
    method: "POST",
    body: JSON.stringify(offerData),
  });
}

// ---------------- USER WANTS ----------------

export async function getUserWants(userId) {
  return request(`/users/${userId}/wants`);
}

export async function addUserWant(userId, wantData) {
  return request(`/users/${userId}/wants`, {
    method: "POST",
    body: JSON.stringify(wantData),
  });
}

// ---------------- SWAP REQUESTS ----------------

export async function createSwapRequest(requestData) {
  return request("/swap-requests", {
    method: "POST",
    body: JSON.stringify(requestData),
  });
}

export async function getUserSwapRequests(userId) {
  return request(`/swap-requests/user/${userId}`);
}

export async function updateSwapStatus(requestId, status) {
  return request(`/swap-requests/${requestId}/status`, {
    method: "PUT",
    body: JSON.stringify({ Status: status }),
  });
}

// ---------------- REVIEWS ----------------

export async function addReview(reviewData) {
  return request("/reviews", {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
}

export async function getUserReviews(userId) {
  return request(`/reviews/user/${userId}`);
}