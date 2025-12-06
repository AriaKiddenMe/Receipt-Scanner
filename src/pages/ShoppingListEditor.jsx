import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/ShoppingListEditor.css";

const ShoppingListEditor = () => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [itemDrafts, setItemDrafts] = useState({}); 

  useEffect(() => {
    try {
      const stored = localStorage.getItem("shopping_lists");
      if (stored) {
        setLists(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading shopping lists", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("shopping_lists", JSON.stringify(lists));
    } catch (err) {
      console.error("Error saving shopping lists", err);
    }
  }, [lists]);

  const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const handleCreateList = () => {
    const name = newListName.trim();
    if (!name) {
      alert("Please enter a name for the new shopping list.");
      return;
    }

    const newList = {
      id: createId(),
      name,
      items: [],
    };

    setLists((prev) => [...prev, newList]);
    setNewListName("");
  };

  const handleDraftChange = (listId, field, value) => {
    setItemDrafts((prev) => ({
      ...prev,
      [listId]: {
        name: prev[listId]?.name || "",
        brand: prev[listId]?.brand || "",
        qty: prev[listId]?.qty || "",
        [field]: value,
      },
    }));
  };

  const handleAddItem = (listId) => {
    const draft = itemDrafts[listId] || { name: "", brand: "", qty: "" };
    const name = draft.name.trim();
    const qty = draft.qty.toString().trim();
    const brand = draft.brand.trim();

    if (!name || !qty) {
      alert("Item name and quantity are required.");
      return;
    }

    const newItem = {
      id: createId(),
      name,
      brand,
      qty,
    };

    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, items: [...list.items, newItem] }
          : list
      )
    );

    setItemDrafts((prev) => ({
      ...prev,
      [listId]: { name: "", brand: "", qty: "" },
    }));
  };

  const handleDeleteItem = (listId, itemId) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
          : list
      )
    );
  };

  const handleDeleteList = (listId) => {
    if (!window.confirm("Delete this shopping list and all its items?")) return;
    setLists((prev) => prev.filter((list) => list.id !== listId));
    setItemDrafts((prev) => {
      const updated = { ...prev };
      delete updated[listId];
      return updated;
    });
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <div className="shopping-wrapper">
          <h1>Shopping Lists</h1>

          {/* Create new list */}
          <section className="list-creator">
            <h2>Create a new list</h2>
            <div className="list-creator-row">
              <input
                type="text"
                placeholder="List name (e.g., Weekly Groceries, Event List)"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <button type="button" onClick={handleCreateList}>
                Create List
              </button>
            </div>
          </section>

          {/* Existing lists */}
          <div className="lists-grid">
            {lists.length === 0 && (
              <p className="no-lists-message">
                You don&apos;t have any shopping lists yet. Create one above to
                get started.
              </p>
            )}

            {lists.map((list) => {
              const draft = itemDrafts[list.id] || {
                name: "",
                brand: "",
                qty: "",
              };

              return (
                <section key={list.id} className="list-card">
                  <div className="list-card-header">
                    <h2>{list.name}</h2>
                    <button
                      type="button"
                      className="list-delete-button"
                      onClick={() => handleDeleteList(list.id)}
                    >
                      Delete List
                    </button>
                  </div>

                  {/* Add item form */}
                  <div className="item-form">
                    <div className="item-form-row">
                      <div className="item-field">
                        <label>
                          Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Milk"
                          value={draft.name}
                          onChange={(e) =>
                            handleDraftChange(list.id, "name", e.target.value)
                          }
                        />
                      </div>

                      <div className="item-field">
                        <label>Brand (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., Store brand"
                          value={draft.brand}
                          onChange={(e) =>
                            handleDraftChange(list.id, "brand", e.target.value)
                          }
                        />
                      </div>

                      <div className="item-field item-field-qty">
                        <label>
                          Qty <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="0"
                          value={draft.qty}
                          onChange={(e) =>
                            handleDraftChange(list.id, "qty", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="item-form-actions">
                      <button
                        type="button"
                        className="item-add-button"
                        onClick={() => handleAddItem(list.id)}
                      >
                        Add Item
                      </button>
                    </div>
                  </div>

                  {/* Items list */}
                  {list.items.length === 0 ? (
                    <p className="no-items-message">
                      No items yet. Add your first item above.
                    </p>
                  ) : (
                    <ul className="items-list">
                      {list.items.map((item) => (
                        <li key={item.id} className="item-row">
                          <div className="item-main">
                            <span className="item-name">{item.name}</span>
                            {item.brand && (
                              <span className="item-brand">
                                • {item.brand}
                              </span>
                            )}
                          </div>
                          <div className="item-meta">
                            <span className="item-qty">
                              Qty: <strong>{item.qty}</strong>
                            </span>
                            <button
                              type="button"
                              className="item-delete"
                              onClick={() =>
                                handleDeleteItem(list.id, item.id)
                              }
                            >
                              ×
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListEditor;
