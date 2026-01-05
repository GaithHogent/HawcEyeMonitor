// src/components/common/Header.tsx
import { View, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
};

export default function Header({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0d7ff2",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    marginTop: 2,
  },
  accent: {
    alignSelf: "center",
    marginTop: 10,
    height: 4,
    width: 52,
    backgroundColor: "#0d7ff2",
    borderRadius: 999,
    opacity: 0.85,
  },
});
