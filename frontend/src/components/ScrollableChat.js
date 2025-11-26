import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

// 🔥 Backend URL for file links
const ENDPOINT = "http://localhost:5000";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  // helper to decide if a file is an image
  const isImageFile = (m) => {
    if (m.fileType && m.fileType.startsWith("image/")) return true;
    if (m.fileName && /\.(png|jpe?g|gif|webp)$/i.test(m.fileName)) return true;
    return false;
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}

            <span
              style={{
                backgroundColor:
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0",
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                display: "inline-block",
                wordBreak: "break-word",
              }}
            >
              {/* ✅ File content (if present) */}
              {m.fileUrl && (
                <div style={{ marginBottom: m.content ? 6 : 0 }}>
                  {isImageFile(m) ? (
                    <a
                      href={`${ENDPOINT}${m.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <img
                        src={`${ENDPOINT}${m.fileUrl}`}
                        alt={m.fileName || "file"}
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          borderRadius: "12px",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.75rem",
                          marginTop: 4,
                          color: "#2B6CB0",
                          textDecoration: "underline",
                        }}
                      >
                        📎 {m.fileName || "Open image"}
                      </div>
                    </a>
                  ) : (
                    <a
                      href={`${ENDPOINT}${m.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "0.8rem",
                        color: "#2B6CB0",
                        textDecoration: "underline",
                        wordBreak: "break-all",
                      }}
                    >
                      📎 {m.fileName || "Download file"}
                    </a>
                  )}
                </div>
              )}

              {/* ✅ Text content (if present) */}
              {m.content && <span>{m.content}</span>}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
