import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type WorkspaceMembership = {
  role: string;
  workspace: { id: number; name: string; slug: string };
};

const WorkspacePicker = () => {
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const res = await fetch("/api/workspaces");
        if (!res.ok) throw new Error("Failed to load workspaces");

        const data = await res.json();
        setMemberships(data.workspaces);

        console.log("DATA: ", data)

        if (data.workspaces.length === 1) {
          navigate(`/workspace/${data.workspaces[0].workspace.slug}`);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    console.log("CORRECT .>>>>>")
    loadWorkspaces();
  }, [navigate]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  if (memberships.length === 0) {
    return (
      <div className="p-4">
        <p>You're not part of any workspace yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4">Choose a workspace</h1>
        {memberships.map((m) => (
          <button
            key={m.workspace.id}
            onClick={() => navigate(`/workspace/${m.workspace.slug}`)}
            className="w-full text-left px-4 py-3 border rounded-md mb-2 hover:bg-gray-100"
          >
            {m.workspace.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkspacePicker;