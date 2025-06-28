import React from "react";
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  useColorScheme,
} from "react-native";

import { User } from "@/types";
import { Colors } from "@/constants/colors";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import getLastTime from "@/utils/getLastTime";

interface Props {
  user: User;
  joinedAt?: Date;
  onPress?: () => void;
  onPressMore?: () => void;
  moreButtonRef?: React.RefObject<any>;
  tag?: string;
}

const UserItem: React.FC<Props> = ({
  user,
  joinedAt,
  onPress,
  onPressMore,
  tag,
  moreButtonRef,
}) => {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <ThemedView style={styles.profilePhotoContainer}>
        <Image
          source={{ uri: user.profilePhoto }}
          style={styles.profilePhoto}
        />
        {user.isOnline ? (
          <ThemedView style={styles.onlineIndicator} />
        ) : (
          <ThemedText type="extraSmallBold" style={styles.lastOnlineText}>
            {getLastTime(user.createdAt)}
          </ThemedText>
        )}
      </ThemedView>
      <ThemedView style={styles.textContainer}>
        <ThemedText type="defaultBold">
          {tag ? `${user.name} ${tag}` : user.name}
        </ThemedText>

        <ThemedText type="smallItalic">
          {user.username && `@${user.username}`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.dateContainer}>
        <ThemedText type="small" style={{ color: "gray", marginRight: 10 }}>
          {joinedAt &&
            `Joined at: ${new Date(joinedAt).getDate()}/${
              new Date(joinedAt).getMonth() + 1
            }/${new Date(joinedAt).getFullYear()}`}{" "}
        </ThemedText>
        <TouchableOpacity onPress={onPressMore} ref={moreButtonRef}>
          <Ionicons
            name="ellipsis-vertical-outline"
            size={20}
            color={color.icon}
          />
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default UserItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  dateContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    // alignContent: "center",
    alignItems: "center",
  },
  profilePhotoContainer: {
    position: "relative",
    // marginRight: 15,
  },

  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 15,
    width: 10,
    height: 10,
    backgroundColor: "limegreen",
    borderRadius: 5,
    // borderWidth: 2,
    // borderColor: "white",
  },
  lastOnlineText: {
    position: "absolute",
    bottom: 0,
    right: 10,
    color: "gray",
  },

  // iconContainer: {
  //   marginRight: 10,
  // },
});
