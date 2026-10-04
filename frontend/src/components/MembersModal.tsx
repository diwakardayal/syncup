type Member = {
  joinedAt: string;
  user: { id: number; name: string; email: string };
};

type Props = {
  members: Member[];
  isClosed: () => void;
  about: string | null;
  channelName: string;
};

const MembersModal = ({ members, isClosed, about, channelName }: Props) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={isClosed}
    >
      <div
        className="max-w-md w-full rounded-lg bg-white p-6 shadow-xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold"># {channelName}</h2>
          <button
            onClick={isClosed}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {about || "No description set for this channel."}
        </p>

        <h3 className="text-xs uppercase text-gray-400 mb-2">
          {members.length} members
        </h3>

        <div className="overflow-y-auto flex-1">
          {members.map((m) => (
            <button
              key={m.user.id}
              onClick={() => console.log("DM with", m.user.name)}
              className="w-full text-left px-2 py-2 rounded hover:bg-gray-100 text-sm"
            >
              {m.user.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersModal;