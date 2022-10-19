import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import ReactQuill, { Quill } from "react-quill";
import "quill-mention";
import "quill-mention/dist/quill.mention.css";
import quillEmoji from "quill-emoji";
import "react-quill/dist/quill.snow.css";
import "quill-emoji/dist/quill-emoji.css";

const { EmojiBlot, ShortNameEmoji, ToolbarEmoji, TextAreaEmoji } = quillEmoji;
Quill.register(
  {
    "formats/emoji": EmojiBlot,
    "modules/emoji-shortname": ShortNameEmoji,
    "modules/emoji-toolbar": ToolbarEmoji,
    "modules/emoji-textarea": TextAreaEmoji,
  },
  true
);

const Chat = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const modules = {
    toolbar: [
      ["bold", "italic", "strike", "blockquote", "code-block"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ align: [] }],
      ["emoji"],
      ["link", "image", "video"],
      ["clean"],
    ],
    "emoji-toolbar": true,
    "emoji-textarea": true,
    "emoji-shortname": true,
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "strike",
    "blockquote",
    "code-block",
    "background",
    "list",
    "indent",
    "align",
    "link",
    "image",
    "mention",
    "video",
    "clean",
    "emoji",
  ];

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: messageContent.message,
                        }}
                      />
                    </p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <ReactQuill
          theme="snow"
          modules={modules}
          formats={formats}
          value={currentMessage}
          onChange={(e) => {
            setCurrentMessage(e);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
          className="input"
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
};

export default Chat;
