import { use, useState } from "react";

const placeholderChannels = [
  { id: 1, name: "general" },
  { id: 2, name: "random" },
  { id: 3, name: "engineering" },
];

const placeholderMembers = [
  { id: 1, name: "Alex kim" },
  { id: 2, name: "Priya shah" },
  { id: 3, name: "Jordan lee" },
];

const WorkspaceTxt = () => {
  const [activeChannel, setActiveChannel] = useState(placeholderChannels[0]);
  const [showMembers, setShowMembers] = useState(false);

  return (
    <div className="h-screen flex">
      <aside className="w-60 bg-purple-950 text-purple-100 flex flex-col">
        <div className="px-4 py-4 font-semibold text-white border-b border-purple-800">
          Syncup
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="text-xs uppercase text-purple-400 px-2 mb-1">
            Channels
          </p>

          {placeholderChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm ${activeChannel.id === channel.id ? "bg-purple-800 text-white" : "hover: bg-purple-900"}`}
            >
              #{channel.name}
            </button>
          ))}
        </div>
      </aside>
      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-4">
          <h2 className="font-semibold"> #{activeChannel.name}</h2>
          <button
            onClick={() => setShowMembers((prev) => !prev)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            {" "}
            👤 {placeholderMembers.length} members
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Message */}
          <main className="flex-1 overflow-y-auto px-4 py-4">
            <p className="text-gray-400 text-sm">
              No message yet in #{activeChannel.name}
            </p>
          </main>

          {showMembers && (
            <aside className="w-64 border-l overflow-y-auto px-3 py-3">
              <p className="text-xs uppercase text-gray-400 mb-2">Members</p>
              {placeholderChannels.map((member) => (
                <button
                  key={member.id}
                  onClick={() => console.log("DM")}
                  className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-100"
                >
                  {member.name}
                </button>
              ))}
            </aside>
          )}
        </div>
      
      </div>
      
    </div>
  );
};

export default WorkspaceTxt;
