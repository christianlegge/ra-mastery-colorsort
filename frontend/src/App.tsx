import { useEffect, useState, useCallback, useRef } from "react";
import "./App.css";

function App() {
  const [errorMessage, setErrorMessage] = useState("");
  const [badgeUrls, setBadgeUrls] = useState([]);
  const [sortedBadgeUrls, setSortedBadgeUrls] = useState([]);
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [sortLoading, setSortLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const userRef = useRef(null);
  const apiKeyRef = useRef(null);

  useEffect(() => {
    // get_badges();
    let badgeUrlsLocal = null;
    if ((badgeUrlsLocal = localStorage.getItem("badgeUrls"))) {
      setBadgeUrls(JSON.parse(badgeUrlsLocal));
    }
  }, []);

  const sort_badges = useCallback(() => {
    setSortLoading(true);
    setErrorMessage("");
    fetch(import.meta.env.VITE_SORT_API_URL!, {
      method: "POST",
      body: JSON.stringify({ badge_urls: badgeUrls }),
      headers: {
        "Content-Type": "application/json",
        Origin: "https://christianlegge.dev",
        "Access-Control-Request-Method": "POST",
      },
    })
      .then((result) => result.json())
      .then((data) => {
        setSortedBadgeUrls(data.urls);
      })
      .catch((err) => {
        setErrorMessage("Error sorting badges. See console for details.");
        console.error(err);
      })
      .finally(() => {
        setSortLoading(false);
      });
  }, [badgeUrls]);

  useEffect(() => {
    // sort_badges();
  }, [badgeUrls, sort_badges]);

  function get_badges() {
    setFetchLoading(true);
    setErrorMessage("");
    fetch(
      `https://retroachievements.org/API/API_GetUserAwards.php?y=${apiKey}&u=${username}`,
    )
      .then((result) => result.json())
      .then((data) => {
        console.log(data);
        const masteries = data["VisibleUserAwards"].filter(
          (badge: Record<string, unknown>) =>
            badge["AwardType"] === "Mastery/Completion" &&
            badge["ConsoleName"] !== "Events",
        );
        const badges = masteries.map(
          (badge: Record<string, unknown>) => badge["ImageIcon"],
        );
        setBadgeUrls(badges);
        localStorage.setItem("badgeUrls", JSON.stringify(badges));
      })
      .catch((err) => {
        setErrorMessage(
          "Error fetching badges from RetroAchievements.org. See console for details.",
        );
        console.error(err);
      })
      .finally(() => {
        setFetchLoading(false);
      });
  }

  return (
    <>
      <header>
        <h1>ra-mastery-colorsort</h1>
        <a href="https://github.com/christianlegge/ra-mastery-colorsort">
          GitHub
        </a>
      </header>
      <main>
        {badgeUrls.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <button
              className="clear"
              onClick={() => {
                setBadgeUrls([]);
                setSortedBadgeUrls([]);
                setUsername("");
                setApiKey("");
                localStorage.removeItem("badgeUrls");
              }}
            >
              Clear Cached Badges
            </button>
            {sortLoading ? (
              <p>
                Loading... this may take a while if you're a very impressive
                player!
              </p>
            ) : (
              <button onClick={sort_badges}>Sort -&gt;</button>
            )}
          </div>
        ) : (
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              get_badges();
              return false;
            }}
          >
            <label htmlFor="username">Username</label>
            <input
              className="text-input"
              ref={userRef}
              type="text"
              id="username"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="apiKey" style={{ marginTop: "1rem" }}>
              API Key
            </label>
            <input
              className="text-input"
              ref={apiKeyRef}
              type="password"
              id="apiKey"
              placeholder="API Key"
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p>
              You can find this on your{" "}
              <a href="https://retroachievements.org/settings">
                RetroAchievements settings page
              </a>
              . It is never sent to the server and never stored, it is only used
              to fetch your badges from RetroAchievements.org.
            </p>
            {fetchLoading ? <p>Loading...</p> : <button>Submit</button>}
          </form>
        )}
        {errorMessage && <div className="error">{errorMessage}</div>}
        {badgeUrls.length > 0 && (
          <div className="grids">
            <div>
              <h2>Before</h2>
              <div
                className="badge-grid"
                style={{
                  display: "grid",
                  placeContent: "center",
                  gridTemplateColumns: "repeat(5, minmax(52px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {badgeUrls.map((badgeUrl) => (
                  <img
                    src={`https://retroachievements.org${badgeUrl}`}
                    alt="badge"
                    key={badgeUrl}
                    style={{
                      width: 52,
                      height: 52,
                      border: "2px solid gold",
                      boxSizing: "content-box",
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <h2>After</h2>
              <div
                className="badge-grid"
                style={{
                  display: "grid",
                  placeContent: "center",
                  gridTemplateColumns: "repeat(5, minmax(52px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {sortedBadgeUrls.map((badgeUrl) => (
                  <img
                    src={`https://retroachievements.org${badgeUrl}`}
                    alt="badge"
                    key={badgeUrl}
                    style={{
                      width: 52,
                      height: 52,
                      border: "2px solid gold",
                      boxSizing: "content-box",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
