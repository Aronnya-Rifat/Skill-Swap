import { useEffect, useState } from "react";
import "./App.css";
import { getUsers, registerUser, getSkills, addSkill } from "./api";

function App() {
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);

  const [registerForm, setRegisterForm] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    PasswordHash: "",
    Bio: "",
  });

  const [skillForm, setSkillForm] = useState({
    SkillName: "",
    Category: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const usersData = await getUsers();
    const skillsData = await getSkills();

    setUsers(usersData);
    setSkills(skillsData);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await registerUser(registerForm);

    setRegisterForm({
      FirstName: "",
      LastName: "",
      Email: "",
      PasswordHash: "",
      Bio: "",
    });

    loadData();
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    await addSkill(skillForm);

    setSkillForm({
      SkillName: "",
      Category: "",
    });

    loadData();
  };

  return (
    <div className="app">
      <header className="dashboard-header">
        <div>
          <h1>Skill Swap Platform</h1>
          <p>Exchange skills, connect learners, and manage swaps easily.</p>
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
            <h2>Register User</h2>

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
                placeholder="Bio"
                value={registerForm.Bio}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    Bio: e.target.value,
                  })
                }
              />

              <button type="submit">Register User</button>
            </form>
          </div>

          <div className="card">
            <h2>Add Skill</h2>

            <form onSubmit={handleAddSkill}>
              <input
                type="text"
                placeholder="Skill Name"
                value={skillForm.SkillName}
                onChange={(e) =>
                  setSkillForm({
                    ...skillForm,
                    SkillName: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Category"
                value={skillForm.Category}
                onChange={(e) =>
                  setSkillForm({
                    ...skillForm,
                    Category: e.target.value,
                  })
                }
                required
              />

              <button type="submit">Add Skill</button>
            </form>
          </div>
        </section>

        <section className="container">
          <div className="card">
            <h2>Registered Users</h2>

            {users.length === 0 ? (
              <p className="empty-text">No users found.</p>
            ) : (
              users.map((user) => (
                <div className="item" key={user.UserID}>
                  <h3>
                    {user.FirstName} {user.LastName}
                  </h3>
                  <p>{user.Email}</p>
                  <p>{user.Bio}</p>
                  <p>
                    <strong>Trade Tokens:</strong> {user.TradeTokens}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h2>Recently Added Skills</h2>

            {skills.length === 0 ? (
              <p className="empty-text">No skills found.</p>
            ) : (
              skills.slice(-5).map((skill) => (
                <div className="item" key={skill.SkillID}>
                  <h3>{skill.SkillName}</h3>
                  <span className="badge">{skill.Category}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card full-width-card">
          <h2>Available Skills</h2>
          <p className="section-subtitle">
            These skills are fetched directly from your MariaDB database.
          </p>

          <div className="skills-grid">
            {skills.length === 0 ? (
              <p className="empty-text">No available skills yet.</p>
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

export default App;