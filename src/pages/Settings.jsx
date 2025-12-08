import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/Settings.css";
import axios from "axios";

const Settings = () => {
  const [expanded, setExpanded] = useState(null);

  const [preferredInput, setPreferredInput] = useState("");
  const [bannedInput, setBannedInput] = useState("");
  const [allergenInput, setAllergenInput] = useState("");

  const [preferredList, setPreferredList] = useState(() => {
    try {
      const stored = localStorage.getItem("settings_preferredList");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Error reading preferredList from localStorage", err);
      return [];
    }
  });

  const [bannedList, setBannedList] = useState(() => {
    try {
      const stored = localStorage.getItem("settings_bannedList");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Error reading bannedList from localStorage", err);
      return [];
    }
  });

  const [allergenList, setAllergenList] = useState(() => {
    try {
      const stored = localStorage.getItem("settings_allergenList");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Error reading allergenList from localStorage", err);
      return [];
    }
  });

  const [radius, setRadius] = useState(() => {
    try {
      const stored = localStorage.getItem("settings_radius");
      if (!stored) return 10;
      const num = Number(stored);
      return Number.isNaN(num) ? 10 : num;
    } catch (err) {
      console.error("Error reading radius from localStorage", err);
      return 10;
    }
  });

  const [privacyEnabled, setPrivacyEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem("settings_privacyEnabled");
      if (stored == null) return false;
      return stored === "true";
    } catch (err) {
      console.error("Error reading privacyEnabled from localStorage", err);
      return false;
    }
  });

  const [loadedFromServer, setLoadedFromServer] = useState(false);

  const toggleSection = (name) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      console.warn("User not logged in, only using localStorage.");
      setLoadedFromServer(true);
      return;
    }

    const fetchFromServer = async () => {
      try {
        const res = await axios.get(
          "http://localhost:9000/getUserFilterSettings",
          { params: { user } }
        );

        const data = res.data || {};
        setPreferredList(data.preferred_brands || []);
        setBannedList(data.banned_brands || []);
        setAllergenList(data.banned_allergens || []);
        setPrivacyEnabled(!!data.privacy_flag);
        try {
          localStorage.setItem(
            "settings_preferredList",
            JSON.stringify(data.preferred_brands || [])
          );
          localStorage.setItem(
            "settings_bannedList",
            JSON.stringify(data.banned_brands || [])
          );
          localStorage.setItem(
            "settings_allergenList",
            JSON.stringify(data.banned_allergens || [])
          );
          localStorage.setItem(
            "settings_privacyEnabled",
            data.privacy_flag ? "true" : "false"
          );
        } catch (lsErr) {
          console.error("Error caching settings to localStorage", lsErr);
        }

        setLoadedFromServer(true);
      } catch (err) {
        console.error(
          "Error loading settings from server, falling back to localStorage",
          err
        );
        setLoadedFromServer(true);
      }
    };

    fetchFromServer();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "settings_preferredList",
        JSON.stringify(preferredList)
      );
    } catch (err) {
      console.error("Error saving preferredList", err);
    }
  }, [preferredList]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "settings_bannedList",
        JSON.stringify(bannedList)
      );
    } catch (err) {
      console.error("Error saving bannedList", err);
    }
  }, [bannedList]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "settings_allergenList",
        JSON.stringify(allergenList)
      );
    } catch (err) {
      console.error("Error saving allergenList", err);
    }
  }, [allergenList]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "settings_privacyEnabled",
        privacyEnabled ? "true" : "false"
      );
    } catch (err) {
      console.error("Error saving privacyEnabled", err);
    }
  }, [privacyEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem("settings_radius", String(radius));
    } catch (err) {
      console.error("Error saving radius", err);
    }
  }, [radius]);


  useEffect(() => {
    if (!loadedFromServer) return;

    const user = localStorage.getItem("user");
    if (!user) return;

    const info = {
      user,
      preferred_brands: preferredList,
      banned_brands: bannedList,
      banned_allergens: allergenList,
      privacy_flag: privacyEnabled,
    };

    axios
      .post("http://localhost:9000/updateUserFilterSettings", info)
      .catch((err) => {
        console.error("Error saving user settings to server", err);
      });
  }, [preferredList, bannedList, allergenList, privacyEnabled, loadedFromServer]);


  const addItem = (type) => {
    const map = {
      preferred: {
        input: preferredInput,
        setInput: setPreferredInput,
        list: preferredList,
        setList: setPreferredList,
      },
      banned: {
        input: bannedInput,
        setInput: setBannedInput,
        list: bannedList,
        setList: setBannedList,
      },
      allergens: {
        input: allergenInput,
        setInput: setAllergenInput,
        list: allergenList,
        setList: setAllergenList,
      },
    };

    const configuration = map[type];
    if (!configuration) return;

    const value = configuration.input.trim();
    if (!value) return;

    configuration.setList([...configuration.list, value]);
    configuration.setInput("");
  };

  const removeItem = (type, indexToRemove) => {
    const map = {
      preferred: {
        list: preferredList,
        setList: setPreferredList,
      },
      banned: {
        list: bannedList,
        setList: setBannedList,
      },
      allergens: {
        list: allergenList,
        setList: setAllergenList,
      },
    };

    const configuration = map[type];
    if (!configuration) return;

    const newList = configuration.list.filter((_, idx) => idx !== indexToRemove);
    configuration.setList(newList);
  };

  const handleRadiusChange = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    const clamped = Math.min(50, Math.max(1, num));
    setRadius(clamped);
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <div className="settings-wrapper">
          <h1>Settings</h1>

          {/* Privacy */}
          <section
            className={
              "settings-section" +
              (expanded === "privacy" ? " expanded" : "")
            }
          >
            <button
              className="settings-header"
              type="button"
              onClick={() => toggleSection("privacy")}
            >
              <span className="settings-header-title">
                <span>Privacy</span>
              </span>
              <svg className="chevron" viewBox="0 0 20 20">
                <path
                  d="M7 4l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {expanded === "privacy" && (
              <div className="settings-content">
                <div className="settings-row">
                  <span className="privacy-label">
                    Set account data private
                  </span>
                  <div className="toggle-wrapper">
                    <span className="toggle-label">
                      {privacyEnabled ? "On" : "Off"}
                    </span>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={privacyEnabled}
                        onChange={(e) =>
                          setPrivacyEnabled(e.target.checked)
                        }
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Preferred Brands */}
          <section
            className={
              "settings-section" +
              (expanded === "preferred" ? " expanded" : "")
            }
          >
            <button
              className="settings-header"
              type="button"
              onClick={() => toggleSection("preferred")}
            >
              <span className="settings-header-title">
                <span>Preferred Brands</span>
              </span>
              <svg className="chevron" viewBox="0 0 20 20">
                <path
                  d="M7 4l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {expanded === "preferred" && (
              <div className="settings-content">
                <div className="list-input-row">
                  <input
                    type="text"
                    placeholder="Add a preferred brand…"
                    value={preferredInput}
                    onChange={(e) => setPreferredInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem("preferred");
                      }
                    }}
                  />
                  <button
                    className="pill-button"
                    type="button"
                    onClick={() => addItem("preferred")}
                  >
                    Add
                  </button>
                </div>
                <div className="saved-label">Saved preferred brands:</div>
                <div className="pill-list">
                  {preferredList.map((item, idx) => (
                    <span key={idx} className="pill-item">
                      <span className="pill-text">{item}</span>
                      <button
                        type="button"
                        className="pill-remove"
                        onClick={() => removeItem("preferred", idx)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Banned Brands */}
          <section
            className={
              "settings-section" +
              (expanded === "banned" ? " expanded" : "")
            }
          >
            <button
              className="settings-header"
              type="button"
              onClick={() => toggleSection("banned")}
            >
              <span className="settings-header-title">
                <span>Banned Brands</span>
              </span>
              <svg className="chevron" viewBox="0 0 20 20">
                <path
                  d="M7 4l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {expanded === "banned" && (
              <div className="settings-content">
                <div className="list-input-row">
                  <input
                    type="text"
                    placeholder="Add a banned brand…"
                    value={bannedInput}
                    onChange={(e) => setBannedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem("banned");
                      }
                    }}
                  />
                  <button
                    className="pill-button"
                    type="button"
                    onClick={() => addItem("banned")}
                  >
                    Add
                  </button>
                </div>
                <div className="saved-label">Saved banned brands:</div>
                <div className="pill-list">
                  {bannedList.map((item, idx) => (
                    <span key={idx} className="pill-item">
                      <span className="pill-text">{item}</span>
                      <button
                        type="button"
                        className="pill-remove"
                        onClick={() => removeItem("banned", idx)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Allergens */}
          <section
            className={
              "settings-section" +
              (expanded === "allergens" ? " expanded" : "")
            }
          >
            <button
              className="settings-header"
              type="button"
              onClick={() => toggleSection("allergens")}
            >
              <span className="settings-header-title">
                <span>Allergens</span>
              </span>
              <svg className="chevron" viewBox="0 0 20 20">
                <path
                  d="M7 4l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {expanded === "allergens" && (
              <div className="settings-content">
                <div className="list-input-row">
                  <input
                    type="text"
                    placeholder="Add an allergen (e.g., peanuts, gluten, etc.)..."
                    value={allergenInput}
                    onChange={(e) => setAllergenInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem("allergens");
                      }
                    }}
                  />
                  <button
                    className="pill-button"
                    type="button"
                    onClick={() => addItem("allergens")}
                  >
                    Add
                  </button>
                </div>
                <div className="saved-label">Saved allergens:</div>
                <div className="pill-list">
                  {allergenList.map((item, idx) => (
                    <span key={idx} className="pill-item">
                      <span className="pill-text">{item}</span>
                      <button
                        type="button"
                        className="pill-remove"
                        onClick={() => removeItem("allergens", idx)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Store Radius */}
          <section
            className={
              "settings-section" +
              (expanded === "radius" ? " expanded" : "")
            }
          >
            <button
              className="settings-header"
              type="button"
              onClick={() => toggleSection("radius")}
            >
              <span className="settings-header-title">
                <span>Store Radius</span>
              </span>
              <svg className="chevron" viewBox="0 0 20 20">
                <path
                  d="M7 4l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {expanded === "radius" && (
              <div className="settings-content">
                <div className="radius-row">
                  <label htmlFor="radius-range">
                    Choose your search radius for stores
                  </label>
                  <div className="radius-inputs">
                    <input
                      id="radius-range"
                      type="range"
                      min="1"
                      max="50"
                      value={radius}
                      onChange={(e) => handleRadiusChange(e.target.value)}
                    />
                    <input
                      id="radius-number"
                      type="number"
                      min="1"
                      max="50"
                      value={radius}
                      onChange={(e) => handleRadiusChange(e.target.value)}
                    />
                    <span className="radius-value">
                      <span>{radius}</span> miles
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;





//For PriceShop integration
//
//The Settings page now stores user filters in MongoDB under
//
//preferred_brands: [String]
//banned_brands:    [String]
//banned_allergens: [String]
//privacy_flag:     Boolean
//
//I already added the backend to server.js
//under:
//   getUserFilterSettings
//   updateUserFilterSettings
//     
//
//      //For PriceShop Filtering:

//  export async function fetchUserFilterSettings(username) {
//    const res = await axios.get("http://localhost:9000/getUserFilterSettings", {
//      params: { user: username },
//    });
//    return res.data || {
//      preferred_brands: [],
//      banned_brands: [],
//      banned_allergens: [],
//      privacy_flag: false,
//    };
//  }
//
//      //filtering grocery results for displaying:
//
//  export function filterItemsByUserSettings(items, filterSettings) {
//    const bannedBrands = (filterSettings.banned_brands || []).map((b) =>
//      b.toLowerCase()
//    );
//    const bannedAllergens = (filterSettings.banned_allergens || []).map((a) =>
//      a.toLowerCase()
//    );
//
//    return (items || []).filter((item) => {
//      const brand = (item.brand || "").toLowerCase();
//      const name = (item.name || "").toLowerCase();
//
//      const isBannedBrand =
//        brand &&
//        bannedBrands.some((banned) => brand.includes(banned));
//
//      if (isBannedBrand) return false;
//
//      let hasBannedAllergen = false;
//
//      if (Array.isArray(item.allergens)) {
//        const allergensLower = item.allergens.map((a) => a.toLowerCase());
//        hasBannedAllergen = bannedAllergens.some((banned) =>
//          allergensLower.some((a) => a.includes(banned))
//        );
//      }
//
//      if (!hasBannedAllergen && bannedAllergens.length > 0) {
//        hasBannedAllergen = bannedAllergens.some((banned) =>
//          name.includes(banned)
//        );
//      }
//
//      if (hasBannedAllergen) return false;
//
//      return true;
//    });
//  }