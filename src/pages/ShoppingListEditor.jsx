import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/ShoppingListEditor.css";
import axios from "axios";

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

  const handleImportFromReceipt = async () => {
    try {
      const curUser = localStorage.getItem("user");
      if (!curUser) {
        alert("No logged-in user found. Please log in first.");
        return;
      }

      const response = await axios.get(
        "http://localhost:9000/getLatestReceiptForUser",
        { params: { user: curUser } }
      );

      if (response.status !== 200 || !response.data) {
        alert("Could not load the latest receipt.");
        return;
      }

      const receipt = response.data;

      const storeName = receipt.store_name || "Imported Receipt";
      const dateRaw = receipt.purchase_date;
      let datePart = "";

      if (dateRaw) {
        try {
          const d = new Date(dateRaw);
          if (!isNaN(d.getTime())) {
            datePart = d.toLocaleDateString();
          }
        } catch {
        }
      }

      const listName = datePart
        ? `${storeName} - ${datePart}`
        : `${storeName} (Imported)`;

      const itemsRaw = receipt.items || [];
      if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
        alert("The latest receipt has no items to import.");
        return;
      }

      const mappedItems = itemsRaw.map((it) => {
        const name = it.Item || "Unnamed item";
        const qty = it.quantity != null ? it.quantity.toString() : "1";
        const price =
          it.price != null ? Number(it.price) : null;
        const unitType = it.unitType || "qty"; 

        return {
          id: createId(),
          name,
          brand: "",
          qty,
          price,
          unitType
        };
      });

      const newList = {
        id: createId(),
        name: listName,
        items: mappedItems
      };

      setLists((prev) => [...prev, newList]);
      alert(`Imported ${mappedItems.length} item(s) from the latest receipt.`);
    } catch (err) {
      console.error("Error importing receipt into shopping list", err);
      if (err.response && err.response.status === 404) {
        alert("No receipts found for this user.");
      } else {
        alert("There was a problem importing the receipt data.");
      }
    }
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

          {/* Create new list and import button */}
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
              <button
                type="button"
                className="import-button"
                onClick={handleImportFromReceipt}
              >
                Import from latest receipt
              </button>
            </div>
          </section>

          {/* All lists */}
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
                          placeholder="1"
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
                            {item.unitType && (
                              <span className="item-unit">
                                ({item.unitType === "lb" ? "lbs" : "qty"})
                              </span>
                            )}
                            {item.price != null && (
                              <span className="item-price">
                                Price: ${Number(item.price).toFixed(2)}
                              </span>
                            )}
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