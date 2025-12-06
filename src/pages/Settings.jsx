import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/Settings.css";

const Settings = () => {
  const [expanded, setExpanded] = useState(null);

  const [preferredInput, setPreferredInput] = useState("");
  const [bannedInput, setBannedInput] = useState("");
  const [allergenInput, setAllergenInput] = useState("");

  const [preferredList, setPreferredList] = useState([]);
  const [bannedList, setBannedList] = useState([]);
  const [allergenList, setAllergenList] = useState([]);

  const [radius, setRadius] = useState(10);
  const [privacyEnabled, setPrivacyEnabled] = useState(false);

  const toggleSection = (name) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    try {
      const storedPreferred = localStorage.getItem("settings_preferredList");
      const storedBanned = localStorage.getItem("settings_bannedList");
      const storedAllergens = localStorage.getItem("settings_allergenList");
      const storedRadius = localStorage.getItem("settings_radius");
      const storedPrivacy = localStorage.getItem("settings_privacyEnabled");

      if (storedPreferred) setPreferredList(JSON.parse(storedPreferred));
      if (storedBanned) setBannedList(JSON.parse(storedBanned));
      if (storedAllergens) setAllergenList(JSON.parse(storedAllergens));

      if (storedRadius) {
        const num = Number(storedRadius);
        if (!Number.isNaN(num)) setRadius(num);
      }

      if (storedPrivacy != null) {
        setPrivacyEnabled(storedPrivacy === "true");
      }
    } catch (err) {
      console.error("Error loading settings", err);
    }
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
      localStorage.setItem("settings_radius", String(radius));
    } catch (err) {
      console.error("Error saving radius", err);
    }
  }, [radius]);

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
                    placeholder="Add an allergen (e.g., peanuts, gluten, ect.)..."
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
