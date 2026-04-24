import { useEffect, useState } from "react";
import "./App.css";
import {
  getUsers,
  registerUser,
  loginUser,
  getSkills,
  addSkill,
  getUserOffers,
  getUserWants,
  addUserOffer,
  addUserWant,
  createSwapRequest,
  getUserSwapRequests,
  updateSwapStatus,
  addReview,
  getUserReviews,
} from "./api";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);

  const [myOffers, setMyOffers] = useState([]);
  const [myWants, setMyWants] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

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

  const [customSkillForm, setCustomSkillForm] = useState({
    SkillName: "",
    Category: "",
  });

  const [offerForm, setOfferForm] = useState({
    SkillID: "",
    ProficiencyLevel: "Beginner",
  });

  const [wantForm, setWantForm] = useState({
    SkillID: "",
  });

  const normalizeUser = (user) => {
    if (!user) return null;

    return {
      UserID: user.UserID ?? user.userid,
      FirstName: user.FirstName ?? user.firstname,
      LastName: user.LastName ?? user.lastname,
      Email: user.Email ?? user.email,
      Bio: user.Bio ?? user.bio,
      TradeTokens: user.TradeTokens ?? user.tradetokens ?? 0,
    };
  };

  const normalizeSkill = (skill) => {
    if (!skill) return null;

    return {
      SkillID: skill.SkillID ?? skill.skillid,
      SkillName: skill.SkillName ?? skill.skillname,
      Category: skill.Category ?? skill.category,
    };
  };

  const getCurrentUserId = () => {
    return currentUser?.UserID ?? currentUser?.userid;
  };

  useEffect(() => {
    loadPublicData();
  }, []);

  useEffect(() => {
    const userId = getCurrentUserId();

    if (userId) {
      loadDashboardData(userId);
    }
  }, [currentUser]);

  const loadPublicData = async () => {
    try {
      const usersData = await getUsers();
      const skillsData = await getSkills();

      const normalizedUsers = usersData.map(normalizeUser);
      const normalizedSkills = skillsData.map(normalizeSkill);

      setUsers(normalizedUsers);
      setSkills(normalizedSkills);

      const offersMap = {};

      for (const user of normalizedUsers) {
        if (user.UserID) {
          const offers = await getUserOffers(user.UserID);
          offersMap[user.UserID] = offers;
        }
      }

      setAllUserOffers(offersMap);
    } catch (error) {
      alert(error.message);
    }
  };

  const loadDashboardData = async (userId) => {
    if (!userId) {
      alert("User ID missing. Please log in again.");
      return;
    }

    try {
      const offers = await getUserOffers(userId);
      const wants = await getUserWants(userId);
      const requests = await getUserSwapRequests(userId);
      const reviews = await getUserReviews(userId);

      setMyOffers(offers);
      setMyWants(wants);
      setMyRequests(requests);
      setMyReviews(reviews);
    } catch (error) {
      alert(error.message);
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => Number(u.UserID) === Number(userId));

    if (!user) {
      return `User #${userId}`;
    }

    return `${user.FirstName} ${user.LastName}`;
  };

  const getSkillName = (skillId) => {
    const skill = skills.find((s) => Number(s.SkillID) === Number(skillId));

    if (!skill) {
      return `Skill #${skillId}`;
    }

    return skill.SkillName;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await loginUser(loginForm);
      const normalizedUser = normalizeUser(result.user);

      if (!normalizedUser || !normalizedUser.UserID) {
        alert("Login worked, but user ID was missing from backend response.");
        console.log("Login response:", result);
        return;
      }

      setCurrentUser(normalizedUser);

      setLoginForm({
        Email: "",
        PasswordHash: "",
      });
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

  const handleAddCustomSkill = async (e) => {
    e.preventDefault();

    try {
      await addSkill(customSkillForm);

      alert("New skill added to platform.");

      setCustomSkillForm({
        SkillName: "",
        Category: "",
      });

      loadPublicData();
    } catch (error) {
      alert("Could not add new skill: " + error.message);
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();

    const userId = getCurrentUserId();

    if (!userId) {
      alert("Please login again. User ID missing.");
      return;
    }

    try {
      await addUserOffer(userId, {
        SkillID: Number(offerForm.SkillID),
        ProficiencyLevel: offerForm.ProficiencyLevel,
      });

      alert("Offered skill added.");

      setOfferForm({
        SkillID: "",
        ProficiencyLevel: "Beginner",
      });

      loadDashboardData(userId);
      loadPublicData();
    } catch (error) {
      alert("Could not add offered skill: " + error.message);
    }
  };

  const handleAddWant = async (e) => {
    e.preventDefault();

    const userId = getCurrentUserId();

    if (!userId) {
      alert("Please login again. User ID missing.");
      return;
    }

    try {
      await addUserWant(userId, {
        SkillID: Number(wantForm.SkillID),
      });

      alert("Wanted skill added.");

      setWantForm({
        SkillID: "",
      });

      loadDashboardData(userId);
    } catch (error) {
      alert("Could not add wanted skill: " + error.message);
    }
  };

  const handleSendSwap = async (receiverId, wantedSkillId) => {
    const userId = getCurrentUserId();

    if (!userId) {
      alert("Please login again. User ID missing.");
      return;
    }

    if (myOffers.length === 0) {
      alert("You must add at least one offered skill before booking another user.");
      return;
    }

    try {
      await createSwapRequest({
        SenderID: userId,
        ReceiverID: receiverId,
        WantedSkillID: wantedSkillId,
        OfferedSkillID: myOffers[0].SkillID,
        Status: "Pending",
      });

      alert("Swap request sent.");

      loadDashboardData(userId);
    } catch (error) {
      alert("Could not send swap request: " + error.message);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    const userId = getCurrentUserId();

    if (!userId) {
      alert("Please login again. User ID missing.");
      return;
    }

    try {
      await updateSwapStatus(requestId, status);

      alert(`Request marked as ${status}.`);

      loadDashboardData(userId);
    } catch (error) {
      alert("Could not update request: " + error.message);
    }
  };

  const handleLeaveReview = async (request) => {
    const userId = getCurrentUserId();

    if (!userId) {
      alert("Please login again. User ID missing.");
      return;
    }

    const rating = prompt("Enter rating from 1 to 5:");

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    const comment = prompt("Write a short review:");

    const revieweeId =
      Number(request.SenderID) === Number(userId)
        ? request.ReceiverID
        : request.SenderID;

    try {
      await addReview({
        SwapID: request.RequestID,
        ReviewerID: userId,
        RevieweeID: revieweeId,
        Rating: Number(rating),
        Comment: comment || "",
      });

      alert("Review submitted.");

      loadDashboardData(userId);
    } catch (error) {
      alert("Could not submit review: " + error.message);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setMyOffers([]);
    setMyWants([]);
    setMyRequests([]);
    setMyReviews([]);
  };

  if (!currentUser) {
    return (
      <div className="app">
        <header className="dashboard-header">
          <div>
            <h1>Skill Swap Platform</h1>
            <p>
              Exchange skills, earn trade tokens, and learn from the community.
            </p>
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
                    setLoginForm({
                      ...loginForm,
                      Email: e.target.value,
                    })
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
              These are skills already available on the platform.
            </p>

            <div className="skills-grid">
              {skills.length === 0 ? (
                <p className="empty-text">No skills available yet.</p>
              ) : (
                skills.map((skill) => (
                  <div className="skill-box" key={skill.SkillID}>
                    <h3>{skill.SkillName}</h3>
                    <span>{skill.Category}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  const userId = getCurrentUserId();

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
        <section className="card full-width-card">
          <h2>Add a New Skill to the Platform</h2>
          <p className="section-subtitle">
            If your skill is not in the list, create it first. Then you can add
            it to your teaching portfolio or learning wishlist.
          </p>

          <form onSubmit={handleAddCustomSkill}>
            <input
              type="text"
              placeholder="Skill Name, e.g. Guitar, Excel, Cooking"
              value={customSkillForm.SkillName}
              onChange={(e) =>
                setCustomSkillForm({
                  ...customSkillForm,
                  SkillName: e.target.value,
                })
              }
              required
            />

            <input
              type="text"
              placeholder="Category, e.g. Music, Business, Lifestyle"
              value={customSkillForm.Category}
              onChange={(e) =>
                setCustomSkillForm({
                  ...customSkillForm,
                  Category: e.target.value,
                })
              }
              required
            />

            <button type="submit">Create New Skill</button>
          </form>
        </section>

        <section className="container">
          <div className="card">
            <h2>Add Skill I Can Teach</h2>

            <form onSubmit={handleAddOffer}>
              <select
                value={offerForm.SkillID}
                onChange={(e) =>
                  setOfferForm({
                    ...offerForm,
                    SkillID: e.target.value,
                  })
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
                  setWantForm({
                    ...wantForm,
                    SkillID: e.target.value,
                  })
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
              .filter((user) => Number(user.UserID) !== Number(userId))
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
          <p className="section-subtitle">
            Incoming and outgoing swap requests connected to your account.
          </p>

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
                  <strong>From:</strong>{" "}
                  {request.SenderName || getUserName(request.SenderID)}
                </p>

                <p>
                  <strong>To:</strong>{" "}
                  {request.ReceiverName || getUserName(request.ReceiverID)}
                </p>

                <p>
                  <strong>Wanted Skill:</strong>{" "}
                  {request.WantedSkillName || getSkillName(request.WantedSkillID)}
                </p>

                <p>
                  <strong>Offered Skill:</strong>{" "}
                  {request.OfferedSkillName || getSkillName(request.OfferedSkillID)}
                </p>

                {Number(request.ReceiverID) === Number(userId) &&
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

                {request.Status === "Accepted" && (
                  <div className="button-row">
                    <button
                      onClick={() =>
                        handleStatusUpdate(request.RequestID, "Completed")
                      }
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}

                {request.Status === "Completed" && (
                  <div className="button-row">
                    <button onClick={() => handleLeaveReview(request)}>
                      Leave Review
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        <section className="card full-width-card">
          <h2>My Reviews</h2>
          <p className="section-subtitle">
            Reviews given by other users after completed swaps.
          </p>

          {myReviews.length === 0 ? (
            <p className="empty-text">No reviews yet.</p>
          ) : (
            myReviews.map((review) => (
              <div className="item" key={review.ReviewID}>
                <h3>Rating: {review.Rating}/5</h3>
                <p>{review.Comment}</p>

                <p>
                  <strong>Swap ID:</strong> {review.SwapID}
                </p>

                <p>
                  <strong>Reviewer:</strong>{" "}
                  {review.ReviewerName || getUserName(review.ReviewerID)}
                </p>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default App;