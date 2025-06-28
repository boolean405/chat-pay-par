import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { Message } from "@/types";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import MessageItem from "@/components/MessageItem";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useChatData } from "@/hooks/useChatData";
import LoadingIndicator from "@/components/LoadingIndicator";
import { getChatPhoto } from "@/utils/getChatPhoto";
import { useAuthStore } from "@/stores/authStore";
import { getChatName } from "@/utils/getChatName";

const initialMessages: Message[] = [
  {
    _id: "64a0f3e7f8a1a5b3d6e8e100",
    sender: {
      _id: "64a0f1c8f8a1a5b3d6e8e001",
      name: "Alice Smith",
      username: "alice",
      email: "alice@example.com",
      profilePhoto: "https://randomuser.me/api/portraits/women/1.jpg",
      isOnline: false,
      followers: [],
      following: [],
      role: "user",
      verified: "verified",
      createdAt: new Date("2025-06-01T00:00:00Z"),
      updatedAt: new Date("2025-06-01T00:00:00Z"),
    },
    type: "text",
    content: "Hey Bob! How are you?",
    chat: "64a0f2d3f8a1a5b3d6e8e010",
    createdAt: new Date("2025-06-20T10:00:00Z"),
    updatedAt: new Date("2025-06-20T10:00:00Z"),
  },
  {
    _id: "64a0f3e7f8a1a5b3d6e8e000",
    sender: {
      _id: "64a0f1c8f8a1a5b3d6e8e001",
      name: "Alice Smith",
      username: "alice",
      email: "alice@example.com",
      profilePhoto: "https://randomuser.me/api/portraits/women/1.jpg",
      isOnline: false,
      followers: [],
      following: [],
      role: "user",
      verified: "verified",
      createdAt: new Date("2025-06-01T00:00:00Z"),
      updatedAt: new Date("2025-06-01T00:00:00Z"),
    },
    type: "text",
    content: "Hey Bob! How are you?",
    chat: "64a0f2d3f8a1a5b3d6e8e010",
    createdAt: new Date("2025-06-20T10:00:00Z"),
    updatedAt: new Date("2025-06-20T10:00:00Z"),
  },
];

export default function ChatMessage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const flatListRef = useRef<FlatList>(null);

  const user = useAuthStore((state) => state.user);
  const { chatId: rawChatId } = useLocalSearchParams();
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;
  const { chat, isLoading, error } = useChatData(chatId);

  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Show latest message
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  // Show typing
  useEffect(() => {
    setIsTyping(newMessage.length > 0);
  }, [newMessage]);

  // Show error if needed
  useEffect(() => {
    if (error) {
      ToastAndroid.show(error, ToastAndroid.SHORT);
    }
  }, [error]);

  // Message status
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];

    if (last.sender === "me" && last.status === "sent") {
      // Simulate "delivered" after 1 sec
      setTimeout(() => {
        setMessages((msgs) =>
          msgs.map((msg) =>
            msg._id === last._id ? { ...msg, status: "delivered" } : msg
          )
        );
      }, 1000);

      // Simulate "seen" after 3 sec
      setTimeout(() => {
        setMessages((msgs) =>
          msgs.map((msg) =>
            msg._id === last._id ? { ...msg, status: "seen" } : msg
          )
        );
      }, 3000);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const createdMessage: Message = {
      _id: Date.now().toString(),
      content: newMessage.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, createdMessage];
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100); // give it a tick to render the new message
      return updatedMessages;
    });

    setNewMessage("");
  };
  if (isLoading || !chat || !user) {
    return null;
  }
  const chatPhoto = getChatPhoto(chat, user._id);
  const chatName = chat.name || getChatName(chat, user._id);
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: color.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {/* Header */}
      <ThemedView
        style={[styles.header, { borderBottomColor: color.borderColor }]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color={color.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("Profile")}>
          <Image source={chatPhoto} style={styles.chatPhoto} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          {chatName}
        </ThemedText>
        <ThemedView style={styles.headerIcons}>
          <TouchableOpacity onPress={() => console.log("Voice call")}>
            <Ionicons
              name="call-outline"
              size={22}
              style={styles.icon}
              color={color.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Video call")}>
            <Ionicons
              name="videocam-outline"
              size={22}
              style={styles.icon}
              color={color.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(chat)/detail",
                params: { chatId },
              })
            }
          >
            <Ionicons
              name="ellipsis-vertical-outline"
              size={22}
              style={styles.icon}
              color={color.icon}
            />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Messages */}
      <FlatList
        keyboardShouldPersistTaps="handled"
        ref={flatListRef}
        data={
          isTyping
            ? [
                ...messages,
                {
                  _id: "typing",
                  content: "Typing...",
                  sender: "other",
                  time: "",
                },
              ]
            : messages
        }
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <MessageItem
            item={item}
            index={index}
            messages={
              isTyping
                ? [
                    ...messages,
                    {
                      _id: "typing",
                      content: "Typing...",
                      sender: "other",
                      time: "",
                    },
                  ]
                : messages
            }
            isTyping={item._id === "typing"}
            user={item.sender}
          />
        )}
        style={styles.chatList}
        contentContainerStyle={{ padding: 10 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <ThemedView style={[styles.inputContainer]}>
        <ThemedView
          style={[
            styles.inputTextContainer,
            { backgroundColor: color.secondary },
          ]}
        >
          <TouchableOpacity style={styles.imageButton}>
            <Ionicons name="happy-outline" size={22} color={color.icon} />
          </TouchableOpacity>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            style={[styles.textInput, { color: color.text }]}
            placeholder="Type a message"
            placeholderTextColor="gray"
            multiline
          />
          <TouchableOpacity
            onPress={() => console.log("image")}
            style={styles.imageButton}
          >
            <Ionicons name="image-outline" size={22} color={color.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton}>
            <Ionicons name="camera-outline" size={22} color={color.icon} />
          </TouchableOpacity>
        </ThemedView>
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: color.main }]}
          onPress={handleSendMessage}
        >
          <Ionicons name="send-outline" size={20} color={color.icon} />
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 20 },
  header: {
    padding: 15,
    // paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.2,
  },
  headerTitle: { flex: 1, marginLeft: 10 },
  headerIcons: { flexDirection: "row" },
  icon: { marginLeft: 15 },

  chatList: { flex: 1 },

  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    // paddingVertical: 15,
    // marginVertical: 10,
  },
  inputTextContainer: {
    height: 40,
    width: "80%",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  textInput: {
    flex: 1,
    paddingBottom: 0,
    paddingTop: 0,
    height: "100%",
  },
  sendButton: {
    backgroundColor: "#128c7e",
    padding: 10,
    borderRadius: 20,
  },
  imageButton: {
    paddingHorizontal: 5,
  },
  typingIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  senderProfileBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc", // Or avatar placeholder color
    marginRight: 8,
  },
  chatPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc", // Or avatar placeholder color
    marginLeft: 10,
  },

  typingText: {
    fontStyle: "italic",
    fontSize: 14,
  },
});
