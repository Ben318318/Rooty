/**
 * Admin Page
 * Created by Benjamin Norbom
 *
 * Admin console for viewing and editing Christmas roots.
 * Requires admin authentication.
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getThemes } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { Theme, Root } from "../lib/supabase";
import Card, { CardHeader, CardContent } from "../components/Card";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import FormField from "../components/FormField";

interface EditableRoot extends Root {
  isEditing?: boolean;
  editedData?: Partial<Root>;
}

export default function Admin() {
  const { isAdmin } = useAuth();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [roots, setRoots] = useState<EditableRoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch themes and find Christmas Special
      const { data: themesData, error: themesError } = await getThemes();
      if (themesError) {
        throw themesError;
      }

      const christmasTheme = themesData?.find(
        (t) => t.name === "Christmas Special"
      );

      if (!christmasTheme) {
        throw new Error("Christmas Special theme not found");
      }

      setTheme(christmasTheme);

      // Fetch roots linked to Christmas theme
      const { data: rootsData, error: rootsError } = await supabase
        .from("theme_roots")
        .select(
          `
          root_id,
          roots (
            id,
            root_text,
            origin_lang,
            meaning,
            examples,
            source_title,
            source_url,
            created_at
          )
        `
        )
        .eq("theme_id", christmasTheme.id);

      if (rootsError) {
        throw rootsError;
      }

      // Transform the data structure
      const formattedRoots: EditableRoot[] =
        rootsData?.map((item: any) => ({
          ...item.roots,
        })) || [];

      // Sort by root_text for easier navigation
      formattedRoots.sort((a, b) =>
        a.root_text.localeCompare(b.root_text)
      );

      setRoots(formattedRoots);
    } catch (err) {
      console.error("Error loading admin data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load admin data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rootId: number) => {
    setRoots(
      roots.map((root) =>
        root.id === rootId
          ? {
              ...root,
              isEditing: true,
              editedData: {
                root_text: root.root_text,
                origin_lang: root.origin_lang,
                meaning: root.meaning,
                examples: root.examples,
                source_title: root.source_title,
                source_url: root.source_url,
              },
            }
          : root
      )
    );
  };

  const handleCancelEdit = (rootId: number) => {
    setRoots(
      roots.map((root) =>
        root.id === rootId
          ? {
              ...root,
              isEditing: false,
              editedData: undefined,
            }
          : root
      )
    );
  };

  const handleFieldChange = (
    rootId: number,
    field: keyof Root,
    value: string | string[]
  ) => {
    setRoots(
      roots.map((root) =>
        root.id === rootId
          ? {
              ...root,
              editedData: {
                ...root.editedData!,
                [field]: value,
              },
            }
          : root
      )
    );
  };

  const handleSave = async (rootId: number) => {
    const root = roots.find((r) => r.id === rootId);
    if (!root || !root.editedData) {
      return;
    }

    try {
      setSaveStatus(null);

      // Validate examples JSON if it's a string
      let examples = root.editedData.examples;
      if (typeof examples === "string") {
        try {
          examples = JSON.parse(examples);
        } catch {
          setSaveStatus({
            type: "error",
            message: "Invalid JSON format for examples",
          });
          return;
        }
      }

      const updateData = {
        root_text: root.editedData.root_text,
        origin_lang: root.editedData.origin_lang,
        meaning: root.editedData.meaning,
        examples: examples,
        source_title: root.editedData.source_title,
        source_url: root.editedData.source_url,
      };

      const { error: updateError } = await supabase
        .from("roots")
        .update(updateData)
        .eq("id", rootId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setRoots(
        roots.map((r) =>
          r.id === rootId
            ? {
                ...r,
                ...updateData,
                isEditing: false,
                editedData: undefined,
              }
            : r
        )
      );

      setSaveStatus({
        type: "success",
        message: "Root updated successfully!",
      });

      // Clear status message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Error updating root:", err);
      setSaveStatus({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to update root",
      });
    }
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <h2>Loading admin console...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: "2rem" }}>
        <Card
          style={{
            borderLeft: "4px solid var(--color-danger)",
          }}
        >
          <CardContent>
            <p style={{ color: "var(--color-danger)" }}>Error: {error}</p>
            <Button onClick={loadData} style={{ marginTop: "1rem" }}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ marginTop: "2rem", paddingBottom: "3rem" }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Admin Console</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Manage Christmas-themed roots dataset
        </p>
      </div>

      {saveStatus && (
        <Card
          style={{
            marginBottom: "1.5rem",
            borderLeft: `4px solid ${
              saveStatus.type === "success"
                ? "var(--color-success)"
                : "var(--color-danger)"
            }`,
          }}
        >
          <CardContent>
            <p
              style={{
                color:
                  saveStatus.type === "success"
                    ? "var(--color-success)"
                    : "var(--color-danger)",
              }}
            >
              {saveStatus.message}
            </p>
          </CardContent>
        </Card>
      )}

      {theme && (
        <Card style={{ marginBottom: "2rem" }}>
          <CardHeader title="🎄 Christmas Special Theme" />
          <CardContent>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div>
                <strong>Theme Name:</strong> {theme.name}
              </div>
              <div>
                <strong>Week Start:</strong> {theme.week_start}
              </div>
              <div
                style={{
                  padding: "0.25rem 0.75rem",
                  backgroundColor: "var(--color-info-light)",
                  color: "var(--color-info)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Dataset: {roots.length} Christmas roots
              </div>
            </div>
            {theme.description && (
              <p style={{ marginTop: "1rem", color: "var(--color-text-secondary)" }}>
                {theme.description}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader title="Roots Management" />
        <CardContent>
          {roots.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem" }}>
              No roots found. Please run the seed script.
            </p>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "1rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      Root Text
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      Origin
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      Meaning
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      Examples
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      Source Title
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      Source URL
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roots.map((root) => (
                    <tr
                      key={root.id}
                      style={{
                        borderBottom: "1px solid var(--color-border-light)",
                      }}
                    >
                      <td style={{ padding: "0.75rem" }}>
                        {root.isEditing ? (
                          <TextInput
                            value={root.editedData?.root_text || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                root.id,
                                "root_text",
                                e.target.value
                              )
                            }
                            style={{ width: "100%", minWidth: "120px" }}
                          />
                        ) : (
                          <strong>{root.root_text}</strong>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {root.isEditing ? (
                          <select
                            value={root.editedData?.origin_lang || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                root.id,
                                "origin_lang",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "0.5rem",
                              borderRadius: "var(--radius-md)",
                              border: "1px solid var(--color-border)",
                            }}
                          >
                            <option value="Latin">Latin</option>
                            <option value="Greek">Greek</option>
                          </select>
                        ) : (
                          root.origin_lang
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {root.isEditing ? (
                          <TextInput
                            value={root.editedData?.meaning || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                root.id,
                                "meaning",
                                e.target.value
                              )
                            }
                            style={{ width: "100%", minWidth: "150px" }}
                          />
                        ) : (
                          root.meaning
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {root.isEditing ? (
                          <textarea
                            value={JSON.stringify(root.editedData?.examples || [], null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                handleFieldChange(root.id, "examples", parsed);
                              } catch {
                                // Invalid JSON, but allow typing
                                handleFieldChange(
                                  root.id,
                                  "examples",
                                  e.target.value
                                );
                              }
                            }}
                            style={{
                              width: "100%",
                              minWidth: "200px",
                              padding: "0.5rem",
                              borderRadius: "var(--radius-md)",
                              border: "1px solid var(--color-border)",
                              fontFamily: "var(--font-family-mono)",
                              fontSize: "var(--font-size-sm)",
                            }}
                            rows={3}
                          />
                        ) : (
                          <div style={{ fontSize: "var(--font-size-sm)" }}>
                            {Array.isArray(root.examples)
                              ? root.examples.join(", ")
                              : JSON.stringify(root.examples)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {root.isEditing ? (
                          <TextInput
                            value={root.editedData?.source_title || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                root.id,
                                "source_title",
                                e.target.value
                              )
                            }
                            style={{ width: "100%", minWidth: "150px" }}
                          />
                        ) : (
                          <div style={{ fontSize: "var(--font-size-sm)" }}>
                            {root.source_title}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {root.isEditing ? (
                          <TextInput
                            value={root.editedData?.source_url || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                root.id,
                                "source_url",
                                e.target.value
                              )
                            }
                            style={{ width: "100%", minWidth: "200px" }}
                          />
                        ) : (
                          <a
                            href={root.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "var(--color-primary)",
                              fontSize: "var(--font-size-sm)",
                              textDecoration: "none",
                            }}
                          >
                            View Source
                          </a>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {root.isEditing ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                            }}
                          >
                            <Button
                              size="small"
                              onClick={() => handleSave(root.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="small"
                              variant="ghost"
                              onClick={() => handleCancelEdit(root.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="small"
                            onClick={() => handleEdit(root.id)}
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

