import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  ImagePlus,
  Loader2,
  Tag,
} from "lucide-react";

const FILTERS_API_URL =
  "https://ira-the-label.onrender.com/api/filters";

const emptyFilter = {
  name: "",
  image: "",
};

export default function FilterManager({
  showMessage,
}) {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(emptyFilter);

  const [preview, setPreview] =
    useState("");

  // =====================================
  // LOAD FILTERS
  // =====================================

  const loadFilters = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        FILTERS_API_URL,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not load filters"
        );
      }

      const data =
        await response.json();

      const filterData =
        Array.isArray(data)
          ? data
          : Array.isArray(data.filters)
          ? data.filters
          : [];

      setFilters(filterData);
    } catch (error) {
      console.error(
        "Load filters error:",
        error
      );

      if (showMessage) {
        showMessage(
          "Could not load homepage filters.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  // =====================================
  // IMAGE CONVERTER
  // =====================================

  const fileToBase64 = (file) =>
    new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () =>
          resolve(reader.result);

        reader.onerror = () =>
          reject(
            new Error(
              "Could not read image"
            )
          );

        reader.readAsDataURL(file);
      }
    );

  // =====================================
  // IMAGE CHANGE
  // =====================================

  const handleImageChange =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      try {
        const image =
          await fileToBase64(file);

        setForm((current) => ({
          ...current,
          image,
        }));

        setPreview(image);
      } catch (error) {
        console.error(error);

        if (showMessage) {
          showMessage(
            "Could not process image.",
            "error"
          );
        }
      }

      event.target.value = "";
    };

  // =====================================
  // OPEN ADD FORM
  // =====================================

  const openAddForm = () => {
    setEditingId(null);

    setForm({
      ...emptyFilter,
    });

    setPreview("");

    setShowForm(true);
  };

  // =====================================
  // OPEN EDIT FORM
  // =====================================

  const openEditForm = (filter) => {
    setEditingId(filter._id);

    setForm({
      name:
        filter.name || "",
      image:
        filter.image || "",
    });

    setPreview(
      filter.image || ""
    );

    setShowForm(true);
  };

  // =====================================
  // CLOSE FORM
  // =====================================

  const closeForm = () => {
    setShowForm(false);

    setEditingId(null);

    setForm({
      ...emptyFilter,
    });

    setPreview("");
  };

  // =====================================
  // SAVE FILTER
  // =====================================

  const saveFilter = async (
    event
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      if (showMessage) {
        showMessage(
          "Please enter a filter name.",
          "error"
        );
      }

      return;
    }

    if (!form.image) {
      if (showMessage) {
        showMessage(
          "Please upload a filter image.",
          "error"
        );
      }

      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `${FILTERS_API_URL}/${editingId}`
        : FILTERS_API_URL;

      const response =
        await fetch(url, {
          method: editingId
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name:
              form.name.trim(),
            image:
              form.image,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not save filter"
        );
      }

      if (showMessage) {
        showMessage(
          editingId
            ? "Filter updated successfully!"
            : "Filter added successfully!"
        );
      }

      closeForm();

      await loadFilters();
    } catch (error) {
      console.error(
        "Save filter error:",
        error
      );

      if (showMessage) {
        showMessage(
          error.message ||
            "Could not save filter.",
          "error"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // DELETE FILTER
  // =====================================

  const deleteFilter = async (
    id,
    name
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${name}"?\n\nThis filter will be permanently removed from the website.`
      );

    if (!confirmed) return;

    try {
      const response =
        await fetch(
          `${FILTERS_API_URL}/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not delete filter"
        );
      }

      setFilters(
        (currentFilters) =>
          currentFilters.filter(
            (filter) =>
              String(
                filter._id
              ) !== String(id)
          )
      );

      if (showMessage) {
        showMessage(
          "Filter deleted permanently."
        );
      }
    } catch (error) {
      console.error(
        "Delete filter error:",
        error
      );

      if (showMessage) {
        showMessage(
          error.message ||
            "Could not delete filter.",
          "error"
        );
      }
    }
  };

  return (
    <>
      {/* ================= FILTER MANAGEMENT ================= */}

      <section className="dashboard-section filters-section">

        <div className="section-header">

          <div>

            <span className="section-eyebrow">
              HOMEPAGE CUSTOMIZATION
            </span>

            <h2>
              Homepage Filters
            </h2>

            <p>
              Add, edit or remove
              collection filters shown
              on your website.
            </p>

          </div>

          <button
            className="add-product-button small-add"
            type="button"
            onClick={openAddForm}
          >
            <Plus size={17} />
            Add Filter
          </button>

        </div>

        {loading ? (

          <div className="admin-loading">

            <Loader2
              className="loading-spinner"
              size={25}
            />

            Loading homepage filters...

          </div>

        ) : filters.length === 0 ? (

          <div className="admin-empty">

            <Tag size={40} />

            <h3>
              No filters yet
            </h3>

            <p>
              Create your first homepage
              filter for the collection
              section.
            </p>

            <button
              className="add-product-button"
              type="button"
              onClick={openAddForm}
            >
              <Plus size={18} />
              Add First Filter
            </button>

          </div>

        ) : (

          <div className="admin-filter-grid">

            {filters.map(
              (filter) => (

                <div
                  className="admin-filter-card"
                  key={filter._id}
                >

                  <div className="admin-filter-image">

                    {filter.image ? (

                      <img
                        src={filter.image}
                        alt={filter.name}
                      />

                    ) : (

                      <div className="admin-no-image">
                        IRA
                      </div>

                    )}

                  </div>

                  <div className="admin-filter-info">

                    <h3>
                      {filter.name}
                    </h3>

                    <span>
                      Homepage Filter
                    </span>

                    <div className="admin-filter-actions">

                      <button
                        className="edit-product"
                        type="button"
                        onClick={() =>
                          openEditForm(
                            filter
                          )
                        }
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>

                      <button
                        className="delete-product"
                        type="button"
                        onClick={() =>
                          deleteFilter(
                            filter._id,
                            filter.name
                          )
                        }
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* ================= FILTER MODAL ================= */}

      {showForm && (

        <div className="admin-modal-overlay">

          <div className="admin-modal filter-modal">

            <div className="admin-modal-head">

              <div>

                <span className="section-eyebrow">
                  HOMEPAGE FILTER
                </span>

                <h2>
                  {editingId
                    ? "Edit Filter"
                    : "Add New Filter"}
                </h2>

              </div>

              <button
                className="modal-close"
                type="button"
                onClick={closeForm}
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={saveFilter}
            >

              <div className="admin-form-grid">

                <div className="form-field full-field">

                  <label>
                    Filter Name *
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          name:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="e.g. Kurtis"
                  />

                </div>

                <div className="form-field full-field">

                  <label>
                    Filter Image *
                  </label>

                  <label className="image-upload-box">

                    <ImagePlus size={26} />

                    <span>
                      Upload filter image
                    </span>

                    <small>
                      This image will appear
                      on the homepage filter
                    </small>

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={
                        handleImageChange
                      }
                    />

                  </label>

                  {preview && (

                    <div className="filter-image-preview">

                      <img
                        src={preview}
                        alt="Filter preview"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setPreview("");

                          setForm(
                            (current) => ({
                              ...current,
                              image: "",
                            })
                          );
                        }}
                      >
                        <X size={16} />
                      </button>

                    </div>

                  )}

                </div>

              </div>

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-product-button"
                  disabled={saving}
                >

                  {saving ? (

                    <>
                      <Loader2
                        className="loading-spinner"
                        size={17}
                      />
                      Saving...
                    </>

                  ) : editingId ? (

                    "Update Filter"

                  ) : (

                    "Add Filter"

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}