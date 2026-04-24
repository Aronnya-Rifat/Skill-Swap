import { useEffect, useState } from "react";
import "./App.css";
import {
  getUsers,
  registerUser,
  loginUser,
  getSkills,
  getUserOffers,
  getUserWants,
  addUserOffer,
  addUserWant,
  createSwapRequest,
  getUserSwapRequests,
  updateSwapStatus,
} from "./api";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);

  const [myOffers, setMyOffers] = useState([]);
  const [myWants, setMyWants] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const [allUserOffers, setAllUserOffers] = useState({});

  const [loginForm, setLoginForm] = useState({
    Email: "",
    PasswordHash: "",
  });

  const [registerForm, setRegisterForm] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    PasswordHash: "",
    Bio: "",
  });

  const [offerForm, setOfferForm] = useState({
    SkillID: "",
    ProficiencyLevel: "Beginner",
  });

  const [wantForm, setWantForm] = useState({
    SkillID: "",
  });

  useEffect(() => {
    loadPublicData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData(currentUser.UserID);
    }
  }, [currentUser]);

  const loadPublicData = async () => {
    try {
      const usersData = await getUsers();
      const skillsData = await getSkills();

      setUsers(usersData);
      setSkills(skillsData);

      const offersMap = {};
      for (const user of usersData) {
        const offers = await getUserOffers(user.UserID);
        offersMap[user.UserID] = offers;
      }
      setAllUserOffers(offersMap);
    } catch (error) {
      alert(error.message);
    }
  };

  const loadDashboardData = async (userId) => {
    try {
      const offers = await getUserOffers(userId);
      const wants = await getUserWants(userId);
      const requests = await getUserSwapRequests(userId);

      setMyOffers(offers);
      setMyWants(wants);
      setMyRequests(requests);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await loginUser(loginForm);
      setCurrentUser(result.user);
      setLoginForm({ Email: "", PasswordHash: "" });
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await registerUser(registerForm);
      alert("Registration successful. Please login now.");

      setRegisterForm({
        FirstName: "",
        LastName: "",
        Email: "",
        PasswordHash: "",
        Bio: "",
      });

      loadPublicData();
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      await addUserOffer(currentUser.UserID, {
        SkillID: Number(offerForm.SkillID),
        ProficiencyLevel: offerForm.ProficiencyLevel,
      });

      alert("Offered skill added.");
      setOfferForm({ SkillID: "", ProficiencyLevel: "Beginner" });
      loadDashboardData(currentUser.UserID);
      loadPublicData();
    } catch (error) {
      alert("Could not add offered skill: " + error.message);
    }
  };

  const handleAddWant = async (e) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      await addUserWant(currentUser.UserID, {
        SkillID: Number(wantForm.SkillID),
      });

      alert("Wanted skill added.");
      setWantForm({ SkillID: "" });
      loadDashboardData(currentUser.UserID);
    } catch (error) {
      alert("Could not add wanted skill: " + error.message);
    }
  };

  const handleSendSwap = async (receiverId, wantedSkillId) => {
    if (myOffers.length === 0) {
      alert("You must add at least one offered skill before booking another user.");
      return;
    }

    try {
      await createSwapRequest({
        SenderID: currentUser.UserID,
        ReceiverID: receiverId,
        WantedSkillID: wantedSkillId,
        OfferedSkillID: myOffers[0].SkillID,
        Status: "Pending",
      });

      alert("Swap request sent.");
      loadDashboardData(currentUser.UserID);
    } catch (error) {
      alert("Could not send swap request: " + error.message);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await updateSwapStatus(requestId, status);
      alert(`Request marked as ${status}`);
      loadDashboardData(currentUser.UserID);
    } catch (error) {
      alert("Could not update request: " + error.message);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setMyOffers([]);
    setMyWants([]);
    setMyRequests([]);
  };

  if (!currentUser) {
    return (
      <div className="app">
        <header className="dashboard-header">
          <div>
            <h1>Skill Swap Platform</h1>
            <p>Exchange skills, earn trade tokens, and learn from the community.</p>
          </div>

          <div className="counter-box">
            <div className="counter-item">
              <span>Total Users</span>
              <strong>{users.length}</strong>
            </div>

            <div className="counter-divider"></div>

            <div className="counter-item">
              <span>Total Skills</span>
              <strong>{skills.length}</strong>
            </div>
          </div>
        </header>

        <main className="dashboard">
          <section className="container">
            <div className="card">
              <h2>Login</h2>

              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginForm.Email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, Email: e.target.value })
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.PasswordHash}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      PasswordHash: e.target.value,
                    })
                  }
                  required
                />

                <button type="submit">Login</button>
              </form>
            </div>

            <div className="card">
              <h2>Register</h2>

              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={registerForm.FirstName}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      FirstName: e.target.value,
                    })
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  value={registerForm.LastName}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      LastName: e.target.value,
                    })
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={registerForm.Email}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      Email: e.target.value,
                    })
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={registerForm.PasswordHash}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      PasswordHash: e.target.value,
                    })
                  }
                  required
                />

                <textarea
                  placeholder="Short Bio"
                  value={registerForm.Bio}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      Bio: e.target.value,
                    })
                  }
                />

                <button type="submit">Create Account</button>
              </form>
            </div>
          </section>

          <section className="card full-width-card">
            <h2>Available Skills</h2>
            <p className="section-subtitle">
              These are official skills available on the platform.
            </p>

            <div className="skills-grid">
              {skills.map((skill) => (
                <div className="skill-box" key={skill.SkillID}>
                  <h3>{skill.SkillName}</h3>
                  <span>{skill.Category}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {currentUser.FirstName}</h1>
          <p>{currentUser.Bio || "Manage your skills and swaps here."}</p>
        </div>

        <div className="counter-box">
          <div className="counter-item">
            <span>Trade Tokens</span>
            <strong>{currentUser.TradeTokens}</strong>
          </div>

          <div className="counter-divider"></div>

          <div className="counter-item">
            <span>My Offers</span>
            <strong>{myOffers.length}</strong>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="dashboard">
        <section className="container">
          <div className="card">
            <h2>Add Skill I Can Teach</h2>

            <form onSubmit={handleAddOffer}>
              <select
                value={offerForm.SkillID}
                onChange={(e) =>
                  setOfferForm({ ...offerForm, SkillID: e.target.value })
                }
                required
              >
                <option value="">Select Skill</option>
                {skills.map((skill) => (
                  <option key={skill.SkillID} value={skill.SkillID}>
                    {skill.SkillName} ({skill.Category})
                  </option>
                ))}
              </select>

              <select
                value={offerForm.ProficiencyLevel}
                onChange={(e) =>
                  setOfferForm({
                    ...offerForm,
                    ProficiencyLevel: e.target.value,
                  })
                }
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <button type="submit">Add Offered Skill</button>
            </form>
          </div>

          <div className="card">
            <h2>Add Skill I Want to Learn</h2>

            <form onSubmit={handleAddWant}>
              <select
                value={wantForm.SkillID}
                onChange={(e) =>
                  setWantForm({ ...wantForm, SkillID: e.target.value })
                }
                required
              >
                <option value="">Select Skill</option>
                {skills.map((skill) => (
                  <option key={skill.SkillID} value={skill.SkillID}>
                    {skill.SkillName} ({skill.Category})
                  </option>
                ))}
              </select>

              <button type="submit">Add Wanted Skill</button>
            </form>
          </div>
        </section>

        <section className="container">
          <div className="card">
            <h2>My Teaching Portfolio</h2>

            {myOffers.length === 0 ? (
              <p className="empty-text">No offered skills yet.</p>
            ) : (
              myOffers.map((offer) => (
                <div className="item" key={offer.SkillID}>
                  <h3>{offer.SkillName}</h3>
                  <span className="badge">{offer.ProficiencyLevel}</span>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h2>My Learning Wishlist</h2>

            {myWants.length === 0 ? (
              <p className="empty-text">No wanted skills yet.</p>
            ) : (
              myWants.map((want) => (
                <div className="item" key={want.SkillID}>
                  <h3>{want.SkillName}</h3>
                  <span className="badge">{want.Category}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card full-width-card">
          <h2>Book a User to Learn a Skill</h2>
          <p className="section-subtitle">
            Browse users who offer skills and send them a swap request.
          </p>

          <div className="skills-grid">
            {users
              .filter((u) => u.UserID !== currentUser.UserID)
              .map((user) => (
                <div className="skill-box" key={user.UserID}>
                  <h3>
                    {user.FirstName} {user.LastName}
                  </h3>
                  <p>{user.Bio}</p>

                  {(allUserOffers[user.UserID] || []).length === 0 ? (
                    <p className="empty-text">No skills offered yet.</p>
                  ) : (
                    (allUserOffers[user.UserID] || []).map((offer) => (
                      <div key={offer.SkillID} className="mini-skill">
                        <span>
                          {offer.SkillName} - {offer.ProficiencyLevel}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleSendSwap(user.UserID, offer.SkillID)
                          }
                        >
                          Book
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ))}
          </div>
        </section>

        <section className="card full-width-card">
          <h2>My Swap Requests</h2>

          {myRequests.length === 0 ? (
            <p className="empty-text">No swap requests yet.</p>
          ) : (
            myRequests.map((request) => (
              <div className="item" key={request.RequestID}>
                <h3>Swap Request #{request.RequestID}</h3>
                <p>
                  <strong>Status:</strong> {request.Status}
                </p>
                <p>
                  <strong>Sender:</strong> {request.SenderID} |{" "}
                  <strong>Receiver:</strong> {request.ReceiverID}
                </p>

                {request.ReceiverID === currentUser.UserID &&
                  request.Status === "Pending" && (
                    <div className="button-row">
                      <button
                        onClick={() =>
                          handleStatusUpdate(request.RequestID, "Accepted")
                        }
                      >
                        Accept
                      </button>

                      <button
                        className="danger-btn"
                        onClick={() =>
                          handleStatusUpdate(request.RequestID, "Rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default App;