// //uses proxy
// // src/pages/Connections.jsx
// import { useEffect, useMemo } from "react";
// import { useSearchParams } from "react-router-dom";
// import {
//   useCreateChatClient, // <-- use this
//   Chat,
//   Channel,
//   ChannelHeader,
//   ChannelList,
//   MessageInput,
//   MessageList,
//   Thread,
//   Window,
//   useChatContext,
// } from "stream-chat-react";
// import "stream-chat-react/dist/css/v2/index.css";

// const apiKey = import.meta.env.VITE_STREAM_API_KEY;

// // ---- local user helpers ----
// function getLocalUser() {
//   try {
//     const raw = localStorage.getItem("user");
//     if (!raw) return null;
//     const u = JSON.parse(raw);
//     return {
//       id: u._id,
//       name: u.fullName,
//       image:
//         u.photoUrl ||
//         `https://getstream.io/random_svg/?name=${encodeURIComponent(
//           u.fullName || u._id
//         )}`,
//     };
//   } catch {
//     return null;
//   }
// }

// // Ensures DM exists + focuses it if ?partner=...&goal=...
// function AutoOpenDM({ me, partnerId, goal }) {
//   const { client, setActiveChannel } = useChatContext();

//   useEffect(() => {
//     if (!partnerId || !me) return;
//     (async () => {
//       await fetch("/chat/ensure-dm", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userA: me, userB: partnerId, goal }),
//       });

//       // queryChannels returns an array
//       const channels = await client.queryChannels(
//         { type: "messaging", members: { $eq: [me, partnerId] } },
//         { last_message_at: -1 },
//         { limit: 1 }
//       );

//       if (channels[0]) setActiveChannel(channels[0]);
//     })();
//   }, [me, partnerId, goal, client, setActiveChannel]);

//   return null;
// }

// export default function Connections() {
//   const [params] = useSearchParams();
//   const partnerId = params.get("partner");
//   const goal = params.get("goal");

//   const me = useMemo(getLocalUser, []);

//   // Token provider so the hook can connect exactly once
//   const tokenProvider = useMemo(
//     () => async () => {
//       const res = await fetch("/stream/token", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           user_id: me?.id,
//           name: me?.name,
//           image: me?.image,
//         }),
//       });
//       const { token } = await res.json();
//       return token;
//     },
//     [me?.id, me?.name, me?.image]
//   );

//   const client = useCreateChatClient({
//     apiKey,
//     userData: me, // { id, name, image }
//     tokenOrProvider: tokenProvider,
//   });

//   if (!client || !me) return <div>Loading chat…</div>;

//   const filters = { type: "messaging", members: { $in: [me.id] } };
//   const sort = { last_message_at: -1 };
//   const options = { state: true, watch: true, presence: true };

//   return (
//     <Chat client={client}>
//       <AutoOpenDM me={me.id} partnerId={partnerId} goal={goal} />
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "360px 1fr",
//           height: "80vh",
//         }}
//       >
//         <ChannelList
//           filters={filters}
//           sort={sort}
//           options={options}
//           showChannelSearch
//           additionalChannelSearchProps={{
//             channelType: "messaging",
//             searchForChannels: false,
//             placeholder: "Start a new chat…",
//           }}
//         />
//         <Channel>
//           <Window>
//             <ChannelHeader />
//             <MessageList />
//             <MessageInput />
//           </Window>
//           <Thread />
//         </Channel>
//       </div>
//     </Chat>
//   );
// }

//no proxy
// src/pages/Connections.jsx
import { useEffect, useMemo, useState} from "react";
import { useSearchParams } from "react-router-dom";
import {
  useCreateChatClient,
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useChatContext,
  ChannelPreviewMessenger
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";


const apiKey = import.meta.env.VITE_STREAM_API_KEY;
// normalize base (supports empty string in production)
const API_BASE = (import.meta.env.VITE_SERVER_URL || "").replace(/\/+$/, "");

// ---- local user helpers ----
function getLocalUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return {
      id: u._id,
      name: u.fullName,
      image:
        u.photoUrl ||
        `https://getstream.io/random_svg/?name=${encodeURIComponent(
          u.fullName || u._id
        )}`,
    };
  } catch {
    return null;
  }
}

// Ensures DM exists + focuses it if ?partner=...&goal=...
function AutoOpenDM({ me, partnerId, goal }) {
  const { client, setActiveChannel } = useChatContext();

  useEffect(() => {
    if (!partnerId || !me) return;
    (async () => {
      // call your backend with absolute base
      await fetch(`${API_BASE}/api/chat/ensure-dm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userA: me, userB: partnerId, goal }),
        // credentials: "include", // uncomment if you use cookies
      });

      const channels = await client.queryChannels(
        { type: "messaging", members: { $eq: [me, partnerId] } },
        { last_message_at: -1 },
        { limit: 1 }
      );

      if (channels[0]) setActiveChannel(channels[0]);
    })();
  }, [me, partnerId, goal, client, setActiveChannel]);

  return null;
}


export default function Connections() {
  const [params] = useSearchParams();
  const partnerId = params.get("partner");
  const goal = params.get("goal");

  const me = useMemo(getLocalUser, []);

  // For responsive: show list by default on desktop, hide on mobile if no partner
  const [showList, setShowList] = useState(
  !window.matchMedia('(max-width: 768px)').matches || !partnerId
);
  useEffect(() => {
    if (partnerId && window.matchMedia("(max-width: 768px)").matches) {
      setShowList(false);
    }
  }, [partnerId]);

  const PreviewItem = (props) => {
    const { setActiveChannel } = useChatContext();
    return (
      <div
        onClick={() => {
          setActiveChannel(props.channel);
          if (window.matchMedia("(max-width: 768px)").matches) setShowList(false);
        }}
      >
        <ChannelPreviewMessenger {...props} />
      </div>
    );
  };

  // Token provider so the hook can connect exactly once
  const tokenProvider = useMemo(
    () => async () => {
      const res = await fetch(`${API_BASE}/api/stream/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: me?.id,
          name: me?.name,
          image: me?.image,
        }),
        // credentials: "include", // if you use cookies
      });
      const { token } = await res.json();
      return token;
    },
    [me?.id, me?.name, me?.image]
  );

  const client = useCreateChatClient({
    apiKey,
    userData: me, // { id, name, image }
    tokenOrProvider: tokenProvider,
  });

  if (!client || !me) return <div>Loading chat…</div>;

  const filters = { type: "messaging", members: { $in: [me.id] } };
  const sort = { last_message_at: -1 };
  const options = { state: true, watch: true, presence: true };

  return (
    <Chat client={client}>
      <AutoOpenDM me={me.id} partnerId={partnerId} goal={goal} />
      <div className="grid h-[calc(100dvh-64px)] overflow-hidden grid-cols-1 md:[grid-template-columns:360px_1fr]">
      {/* <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          height: "80vh",
        }}
      > */}
         <div className={`${showList ? "block" : "hidden"}  md:block overflow-y-auto md:border-r`}>
        <ChannelList
          filters={filters}
          sort={sort}
          options={options}
          Preview={PreviewItem} 
          additionalChannelSearchProps={{
            channelType: "messaging",
            searchForChannels: false,
            placeholder: "Start a new chat…",
          }}
        />
        </div>

        {/* chat area */}
        <div className={`${showList ? "hidden" : "block"} md:block min-w-0 overflow-y-auto`}>
          {/* Back button only on mobile */}
          <div className="md:hidden border-b px-3 py-2">
             <button onClick={() => setShowList(true)} className="text-indigo-600 font-medium">
              ← Chats
            </button>
          </div>
        <Channel>
          <Window>
            <ChannelHeader />
            <div className="h-full">
            <MessageList />
            </div>
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </div>
      </div>
    </Chat>
  );
}

// // src/pages/Connections.jsx
// import { useEffect, useMemo } from "react";
// import { useSearchParams } from "react-router-dom";
// import {
//   useCreateChatClient,
//   Chat,
//   Channel,
//   ChannelList,
//   MessageInput,
//   MessageList,
//   Thread,
//   Window,
//   useChatContext,
// } from "stream-chat-react";
// import "stream-chat-react/dist/css/v2/index.css";

// const apiKey = import.meta.env.VITE_STREAM_API_KEY;
// // normalize base (supports empty string in production)
// const API_BASE = (import.meta.env.VITE_SERVER_URL || "").replace(/\/+$/, "");

// // ---- local user helpers ----
// function getLocalUser() {
//   try {
//     const raw = localStorage.getItem("user");
//     if (!raw) return null;
//     const u = JSON.parse(raw);
//     return {
//       id: u._id,
//       name: u.fullName,
//       image:
//         u.photoUrl ||
//         `https://getstream.io/random_svg/?name=${encodeURIComponent(
//           u.fullName || u._id
//         )}`,
//     };
//   } catch {
//     return null;
//   }
// }

// // ---- DM naming helpers (show "the other person") ----
// function getOtherMember(channel, meId) {
//   const members = Object.values(channel?.state?.members || {});
//   return members.find((m) => m.user?.id !== meId);
// }
// function getDmTitle(channel, meId) {
//   const other = getOtherMember(channel, meId);
//   return other?.user?.name || other?.user?.id || "Direct Message";
// }
// function getDmAvatar(channel, meId) {
//   const other = getOtherMember(channel, meId);
//   return (
//     other?.user?.image ||
//     "https://getstream.io/random_svg/?name=Direct%20Message"
//   );
// }

// // Ensures DM exists + focuses it if ?partner=...&goal=...
// function AutoOpenDM({ me, partnerId, goal }) {
//   const { client, setActiveChannel } = useChatContext();

//   useEffect(() => {
//     if (!partnerId || !me) return;

//     (async () => {
//       try {
//         // 1) Ask server to ensure DM; use its response (id/cid) if available
//         const resp = await fetch(`${API_BASE}/api/chat/ensure-dm`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userA: me, userB: partnerId, goal }),
//           // credentials: "include",
//         });

//         let ensured = null;
//         if (resp.ok) {
//           ensured = await resp.json(); // { id, cid, type, name? }
//         }

//         // 2) Prefer to focus by deterministic id from server
//         if (ensured?.id) {
//           const ch = client.channel("messaging", ensured.id);
//           await ch.watch(); // ensure state/presence/messages loaded
//           setActiveChannel(ch);
//           return;
//         }

//         // 3) Fallback: query by members intersection and pick latest
//         const channels = await client.queryChannels(
//           { type: "messaging", members: { $in: [me, partnerId] } },
//           { last_message_at: -1 },
//           { limit: 1 }
//         );
//         if (channels[0]) setActiveChannel(channels[0]);
//       } catch (e) {
//         console.error("AutoOpenDM error:", e);
//       }
//     })();
//   }, [me, partnerId, goal, client, setActiveChannel]);

//   return null;
// }

// // ---- Custom DM Preview (left list item) ----
// function DMPreview({ channel, setActiveChannel, activeChannel }) {
//   const { client } = useChatContext();
//   const meId = client.userID;
//   const title = getDmTitle(channel, meId);
//   const avatar = getDmAvatar(channel, meId);
//   const isActive = activeChannel?.cid === channel?.cid;

//   return (
//     <div
//       onClick={() => setActiveChannel(channel)}
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 12,
//         padding: "10px 12px",
//         cursor: "pointer",
//         background: isActive ? "#f3f4f6" : "transparent",
//       }}
//     >
//       <img
//         src={avatar}
//         alt=""
//         style={{ width: 40, height: 40, borderRadius: "50%" }}
//       />
//       <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
//         <div
//           style={{
//             fontWeight: 600,
//             whiteSpace: "nowrap",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//           }}
//         >
//           {title}
//         </div>
//         {/* Optional: last message preview */}
//         <div
//           style={{
//             fontSize: 12,
//             color: "#6b7280",
//             whiteSpace: "nowrap",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//           }}
//         >
//           {channel?.state?.messages?.[channel.state.messages.length - 1]
//             ?.text || "Say hi 👋"}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ---- Custom DM Header (top bar) ----
// function DMHeader() {
//   const { channel, client } = useChatContext();
//   const meId = client.userID;
//   const title = getDmTitle(channel, meId);
//   const avatar = getDmAvatar(channel, meId);

//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 12,
//         padding: "10px 12px",
//         borderBottom: "1px solid #e5e7eb",
//       }}
//     >
//       <img
//         src={avatar}
//         alt=""
//         style={{ width: 32, height: 32, borderRadius: "50%" }}
//       />
//       <div style={{ fontWeight: 600 }}>{title}</div>
//     </div>
//   );
// }

// export default function Connections() {
//   const [params] = useSearchParams();
//   const partnerId = params.get("partner");
//   const goal = params.get("goal");

//   const me = useMemo(getLocalUser, []);

//   // Token provider so the hook can connect exactly once
//   const tokenProvider = useMemo(
//     () => async () => {
//       const res = await fetch(`${API_BASE}/api/stream/token`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           user_id: me?.id,
//           name: me?.name,
//           image: me?.image,
//         }),
//         // credentials: "include",
//       });
//       const { token } = await res.json();
//       return token;
//     },
//     [me?.id, me?.name, me?.image]
//   );

//   const client = useCreateChatClient({
//     apiKey,
//     userData: me, // { id, name, image }
//     tokenOrProvider: tokenProvider,
//   });

//   if (!client || !me) return <div>Loading chat…</div>;

//   const filters = { type: "messaging", members: { $in: [me.id] } };
//   const sort = { last_message_at: -1 };
//   const options = { state: true, watch: true, presence: true };

//   return (
//     <Chat client={client}>
//       <AutoOpenDM me={me.id} partnerId={partnerId} goal={goal} />
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "360px 1fr",
//           height: "80vh",
//         }}
//       >
//         <ChannelList
//           filters={filters}
//           sort={sort}
//           options={options}
//           showChannelSearch
//           additionalChannelSearchProps={{
//             channelType: "messaging",
//             searchForChannels: false,
//             placeholder: "Start a new chat…",
//           }}
//           // 👇 show other user's name & avatar in the list
//           Preview={(p) => <DMPreview {...p} />}
//         />
//         <Channel>
//           <Window>
//             {/* 👇 show other user's name & avatar in the header */}
//             <DMHeader />
//             <MessageList />
//             <MessageInput />
//           </Window>
//           <Thread />
//         </Channel>
//       </div>
//     </Chat>
//   );
// }
