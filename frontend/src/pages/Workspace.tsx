import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

type Channel = { id: number; name: string; isPrivate: boolean };
type Member = { user: { id: number; name: string; email: string }; role: string };

const Workspace = () => {
  const { slug } = useParams<{ slug: string }>();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const loadWorkspaceData = async () => {
      try {
        const [channelsRes, membersRes] = await Promise.all([
          fetch(`/api/workspace/${slug}/channels`),
          fetch(`/api/workspace/${slug}/members`),
        ]);

        if (!channelsRes.ok || !membersRes.ok) {
          throw new Error("Failed to load workspace data");
        }

        const channelsData = await channelsRes.json();
        const membersData = await membersRes.json();

        setChannels(channelsData.channels);
        setMembers(membersData.members);
        setActiveChannel(channelsData.channels[0] ?? null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaceData();
  }, [slug]);

  if (loading) return <div className="p-4">Loading workspace...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="h-screen flex">
      <aside className="w-60 bg-purple-950 text-purple-100 flex flex-col">
        <div className="px-4 py-4 font-semibold text-white border-b border-purple-800">
          {slug}
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="text-xs uppercase text-purple-400 px-2 mb-1">Channels</p>
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                activeChannel?.id === channel.id
                  ? "bg-purple-800 text-white"
                  : "hover:bg-purple-900"
              }`}
            >
              # {channel.name}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-4">
          <h2 className="font-semibold">
            {activeChannel ? `# ${activeChannel.name}` : "No channel selected"}
          </h2>
          <button
            onClick={() => setShowMembers((prev) => !prev)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            👤 {members.length} members
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto px-4 py-4">
            <p className="text-gray-400 text-sm">
              {activeChannel ? `No messages yet in #${activeChannel.name}` : "Select a channel"}
            </p>
          </main>

          {showMembers && (
            <aside className="w-64 border-l overflow-y-auto px-3 py-3">
              <p className="text-xs uppercase text-gray-400 mb-2">Members</p>
              {members.map((m) => (
                <button
                  key={m.user.id}
                  className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-100"
                >
                  {m.user.name} <span className="text-gray-400">({m.role})</span>
                </button>
              ))}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace;