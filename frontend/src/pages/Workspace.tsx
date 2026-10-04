import { use, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MembersModal from "../components/MembersModal";
import SendIcon from "../Icons/sendIcon";

const placeholderMembers = [
  { id: 1, name: "Alex Kim" },
  { id: 2, name: "Priya Shah" },
  { id: 3, name: "Jordan Lee" },
];

const getChannelInfo = async (channelId: number) => {
  const [channelRes, membersRes] = await Promise.all([
    axios.get(`/api/channel/${channelId}`),
    axios.get(`/api/channel/${channelId}/members`),
  ]);

  return {
    channel: channelRes.data.channel,
    members: membersRes.data.members,
  };
};

const Workspace = () => {
  const [activeChannel, setActiveChannel] = useState({});
  const [showMembers, setShowMembers] = useState(false);
  const [channelsList, setChannelsList] = useState([]);
  const [channelData, setChannelData] = useState();
  const [message, setMessage] = useState("");

  const paras = useParams();
  console.log("paras", paras.slug);

  const fetchChannels = async () => {
    try {
      const listofCHannels = await axios(
        `/api/workspace/${paras.slug}/channels`,
      );

      const filteredChannelList = listofCHannels.data.channel;
      setChannelsList(filteredChannelList);
      const firstChannel = filteredChannelList[0];
      if (firstChannel) {
        setActiveChannel(firstChannel);
        return firstChannel;
      }
      return null;
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    (async function () {
      const firstChannel = await fetchChannels();
      if (firstChannel?.id != null) {
        const channelInfo = await getChannelInfo(firstChannel.id);
        setChannelData(channelInfo);
      }

      console.log("firstChannel: ", firstChannel);
      const data = await getChannelInfo(firstChannel.id);
      console.log("data: ", data);
    })();
  }, []);

  async function sendMessage(message) {
    console.log("channelData: ", channelData);
    if (!channelData?.channel?.id) {
      return;
    }
    try {
      const channelId = channelData.channel.id;

      await axios.post(`/api/channel/${channelId}/messages`, {
        content: message,
      });

      setMessage("");
    } catch (error) {
      console.log("sendMessage Error: ", error);
    }
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-purple-950 text-purple-100 flex flex-col">
        <div className="px-4 py-4 font-semibold text-white border-b border-purple-800">
          SyncUp
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="text-xs uppercase text-purple-400 px-2 mb-1">
            Channels
          </p>
          {channelsList.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                activeChannel.id === channel.id
                  ? "bg-purple-800 text-white"
                  : "hover:bg-purple-900"
              }`}
            >
              # {channel.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col ">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-4 ">
          <h2 className="font-semibold"># {activeChannel.name}</h2>
          <button
            onClick={() => setShowMembers((prev) => !prev)}
            className="border-2 rounded p-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            👤 {channelData?.members.length ?? 0} members
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Messages */}
          <main className="flex-1 overflow-y-auto px-4 py-4">
            <p className="text-gray-400 text-sm">
              No messages yet in #{activeChannel.name}
            </p>
          </main>

          {/* Members panel */}
          {showMembers && channelData && (
            <MembersModal
              members={channelData.members}
              about={channelData.channel.description}
              channelName={activeChannel.name}
              isClosed={() => setShowMembers(false)}
            />
          )}
        </div>

        {/* Message input placeholder */}

        <div className="border-t px-4 py-3 flex items-center">
          <input
            content={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            placeholder={`Message #${activeChannel.name}`}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={sendMessage}
            className={
              message.trim().length > 1 ? "text-green-600" : "text-blue-500"
            }
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
