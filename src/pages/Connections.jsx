// // // src/pages/Connections.jsx
// // import { useEffect, useMemo, useState } from "react";
// // import { useSearchParams } from "react-router-dom";
// // import { StreamChat } from "stream-chat";
// // import {
// //   Chat,
// //   Channel,
// //   ChannelHeader,
// //   ChannelList,
// //   MessageInput,
// //   MessageList,
// //   Thread,
// //   Window,
// //   useChatContext,
// // } from "stream-chat-react";
// // import "stream-chat-react/dist/css/v2/index.css";

// // const apiKey = import.meta.env.VITE_STREAM_API_KEY;

// // // ✅ read safely
// // const raw = localStorage.getItem("user");      // or localStorage.user
// // const user = raw ? JSON.parse(raw) : null;

// // console.log(user?._id);       // "68c94cf829d8e1be1a91c161"
// // console.log(user?.fullName);  // "Nadav Gonen"



// // const CURRENT_USER = () => ({
// //   id: user?._id,
// //   name: user?.fullName,
// //   image:
// //     window.auth?.user?.photoUrl ??
// //     "https://getstream.io/random_svg/?name=nadav4",
// // });

// // // Ensures DM exists + focuses it if ?partner=...&goal=...
// // function AutoOpenDM({ me, partnerId, goal }) {
// //   const { client, setActiveChannel } = useChatContext();
// //   useEffect(() => {
// //     if (!partnerId) return;
// //     (async () => {
// //       await fetch("/api/chat/ensure-dm", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ userA: me, userB: partnerId, goal }),
// //       });
// //       const { channels } = await client.queryChannels(
// //         { type: "messaging", members: { $in: [me, partnerId] } },
// //         {},
// //         { limit: 1 }
// //       );
// //       if (channels?.[0]) setActiveChannel(channels[0]);
// //     })();
// //   }, [me, partnerId, goal, client, setActiveChannel]);
// //   return null;
// // }

// // export default function Connections() {
// //   const [params] = useSearchParams();
// //   const partnerId = params.get("partner");
// //   const goal = params.get("goal");

// //   const user = useMemo(() => CURRENT_USER(), []);
// //   const [client, setClient] = useState(null);

// //   useEffect(() => {
// //     const sc = StreamChat.getInstance(apiKey);
// //     (async () => {
// //       const resp = await fetch("/api/stream/token", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           user_id: user.id,
// //           name: user.name,
// //           image: user.image,
// //         }),
// //       });
// //       const { token } = await resp.json();
// //       await sc.connectUser(user, token);
// //       setClient(sc);
// //     })();
// //     return () => {
// //       sc.disconnectUser().catch(() => {});
// //     };
// //   }, [user]);

// //   if (!client) return <div>Loading chat…</div>;

// //   const filters = { type: "messaging", members: { $in: [user.id] }};
// //   const sort = { last_message_at: -1 };
// //   const options = { state: true, presence: true };

// //   return (
// //     <Chat client={client}>
// //       <AutoOpenDM me={user.id} partnerId={partnerId} goal={goal} />
// //       <div
// //         style={{
// //           display: "grid",
// //           gridTemplateColumns: "360px 1fr",
// //           height: "80vh",
// //         }}
// //       >
// //         <ChannelList
// //           filters={filters}
// //           sort={sort}
// //           options={options}
// //           showChannelSearch
// //           additionalChannelSearchProps={{
// //             channelType: "messaging",
// //             searchForChannels: false,
// //             placeholder: "Start a new chat…",
// //           }}
// //         />
// //         <Channel>
// //           <Window>
// //             <ChannelHeader />
// //             <MessageList />
// //             <MessageInput />
// //           </Window>
// //           <Thread />
// //         </Channel>
// //       </div>
// //     </Chat>
// //   );
// // }


// // src/pages/Connections.jsx
// import { useEffect, useMemo } from "react";
// import { useSearchParams } from "react-router-dom";
// import {
//   useCreateChatClient,   // <-- use this
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
//       await fetch("/api/chat/ensure-dm", {
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
//       const res = await fetch("/api/stream/token", {
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
//     userData: me,                // { id, name, image }
//     tokenOrProvider: tokenProvider,
//   });

//   if (!client || !me) return <div>Loading chat…</div>;

//   const filters = { type: "messaging", members: { $in: [me.id] } };
//   const sort = { last_message_at: -1 };
//   const options = { state: true, watch: true, presence: true };

//   return (
//     <Chat client={client}>
//       <AutoOpenDM me={me.id} partnerId={partnerId} goal={goal} />
//       <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", height: "80vh" }}>
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
import { useEffect, useMemo } from "react";
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
      await fetch(`${API_BASE}/chat/ensure-dm`, {
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

  // Token provider so the hook can connect exactly once
  const tokenProvider = useMemo(
    () => async () => {
      const res = await fetch(`${API_BASE}/stream/token`, {
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          height: "80vh",
        }}
      >
        <ChannelList
          filters={filters}
          sort={sort}
          options={options}
          showChannelSearch
          additionalChannelSearchProps={{
            channelType: "messaging",
            searchForChannels: false,
            placeholder: "Start a new chat…",
          }}
        />
        <Channel>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </div>
    </Chat>
  );
}