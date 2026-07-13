import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type Screen = "dashboard" | "grammar" | "lesson";
type IconName = keyof typeof Ionicons.glyphMap;

const API_BASE_URL = "http://127.0.0.1:4000";

const colors = {
  background: "#f8f9ff",
  surface: "#ffffff",
  surfaceLow: "#eff4ff",
  surfaceContainer: "#e5eeff",
  surfaceHigh: "#dce9ff",
  primary: "#2563eb",
  primaryDark: "#004ac6",
  primaryFixed: "#dbe1ff",
  primaryFixedDim: "#b4c5ff",
  onPrimary: "#ffffff",
  onSurface: "#0b1c30",
  onSurfaceVariant: "#434655",
  outline: "#737686",
  outlineVariant: "#c3c6d7",
  secondary: "#006c49",
  secondaryContainer: "#6cf8bb",
  secondaryFixedDim: "#4edea3",
  tertiaryFixed: "#d9e6dd",
  error: "#ba1a1a",
  errorContainer: "#ffdad6"
};

const avatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAcq_oA8AOQgfSMNYepdl2eG-0j8S6eQwfpSjBdYMrWT7FtRYZFDEF49giWQJ0gKk-tYbLRh02dqS7ng-t6GuL5FjxVferP7sZXn9Slogz8L00jElinftefI_vTUzmMtOUvKfqN2LMcRsGtMwA4Eaajm8rWAewVRFqv4jPLCQHKpL9R4jiKcwwfAPaaDgPrM7n6oRtO-26HtJxSeU9zzd40MtVo4wKKVsvJHUbK806N0GGQKlOOlFgUcAmpAguVcefGd0_Uv7QzoPE";

const navItems: Array<{ id: Screen; label: string; icon: IconName }> = [
  { id: "dashboard", label: "Home", icon: "home-outline" },
  { id: "grammar", label: "Lessons", icon: "book-outline" },
  { id: "lesson", label: "Chat", icon: "mic-outline" }
];

const grammarTopics = [
  {
    title: "Nouns",
    body: "Master common, proper, abstract, and collective nouns in English sentences.",
    status: "Completed",
    progress: 100,
    icon: "alphabetical-variant"
  },
  {
    title: "Tenses",
    body: "Understanding past, present, and future timeframes and aspects.",
    status: "In Progress",
    progress: 65,
    icon: "clock-outline"
  },
  {
    title: "Verbs",
    body: "Action words, linking verbs, and auxiliary verbs usage.",
    status: "Start Topic",
    progress: 0,
    icon: "run"
  }
];

const coreTopics = [
  ["Pronouns", "Subject, Object, and Possessive forms", "person-outline"],
  ["Adjectives", "Describing people, places, and things", "color-palette-outline"],
  ["Adverbs", "Manner, frequency, place, and time", "flash-outline"],
  ["Articles", "A, An, The and Zero Article usage", "text-outline"],
  ["Prepositions", "Mastering time, place, and movement", "navigate-outline"],
  ["Business English", "Professional language for career growth", "briefcase-outline"]
] as const;

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [apiOnline, setApiOnline] = useState(false);
  const title = useMemo(() => {
    if (screen === "grammar") return "Grammar Topics";
    if (screen === "lesson") return "Daily Lesson";
    return "LingoFlow";
  }, [screen]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((response) => response.json())
      .then((data) => setApiOnline(Boolean(data.ok)))
      .catch(() => setApiOnline(false));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <TopBar title={title} apiOnline={apiOnline} />
      <View style={styles.appShell}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {screen === "dashboard" && <DashboardScreen setScreen={setScreen} />}
          {screen === "grammar" && <GrammarScreen setScreen={setScreen} />}
          {screen === "lesson" && <LessonScreen />}
        </ScrollView>
        <BottomNav active={screen} onChange={setScreen} />
      </View>
    </SafeAreaView>
  );
}

function TopBar({ title, apiOnline }: { title: string; apiOnline: boolean }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topLeft}>
        <Ionicons name="menu" size={24} color={colors.primary} />
        <Text style={styles.brand}>{title}</Text>
      </View>
      <View style={styles.topRight}>
        <Text style={[styles.streak, apiOnline && styles.apiOnline]}>
          API {apiOnline ? "online" : "offline"}
        </Text>
        <Image source={{ uri: avatar }} style={styles.avatarSmall} />
      </View>
    </View>
  );
}

function BottomNav({
  active,
  onChange
}: {
  active: Screen;
  onChange: (screen: Screen) => void;
}) {
  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const selected = active === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            style={styles.navButton}
          >
            <Ionicons
              name={selected ? item.icon.replace("-outline", "") as IconName : item.icon}
              size={23}
              color={selected ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[styles.navLabel, selected && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
      <Pressable style={styles.navButton}>
        <Ionicons name="person-outline" size={23} color={colors.onSurfaceVariant} />
        <Text style={styles.navLabel}>Profile</Text>
      </Pressable>
    </View>
  );
}

function DashboardScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Welcome back, Learner!</Text>
        <Text style={styles.heroSubtitle}>Learn English. Build Your Future</Text>
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            "The limits of my language mean the limits of my world." - Ludwig Wittgenstein
          </Text>
        </View>
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <View>
            <Pill label="TODAY'S GOAL" />
            <Text style={styles.cardTitle}>Business Negotiations II</Text>
            <Text style={styles.muted}>
              Mastering the soft landing in professional disagreement.
            </Text>
          </View>
          <View style={styles.micCircle}>
            <Ionicons name="mic" size={24} color={colors.onPrimary} />
          </View>
        </View>
        <Checklist text="Vocabulary Refresh" complete />
        <Checklist text="Roleplay: The Salary Review" />
        <PrimaryButton label="Start Lesson" icon="arrow-forward" onPress={() => setScreen("lesson")} />
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <Text style={styles.progressNumber}>65%</Text>
        </View>
        <Progress value={65} />
        <View style={styles.rowBetween}>
          <Text style={styles.muted}>Weekly Target</Text>
          <Text style={styles.bodyStrong}>13/20 Units</Text>
        </View>
        <View style={styles.badgeRow}>
          <Badge icon="ribbon-outline" label="Grammar King" />
          <Badge icon="flash-outline" label="Flash Card Pro" />
        </View>
      </Card>

      <View style={styles.twoColumn}>
        <ActionTile
          title="Live Group Session"
          body="Starts in 15 minutes."
          icon="sparkles-outline"
          action="Join Room"
          tone="mint"
        />
        <ActionTile
          title="Journal Task"
          body="Write about your last vacation."
          icon="create-outline"
          action="Write Now"
        />
        <ActionTile
          title="Review Quiz"
          body="10 questions from last week."
          icon="school-outline"
          action="Start Quiz"
        />
      </View>
    </View>
  );
}

function GrammarScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.progressBand}>
        <View style={styles.rowBetween}>
          <Text style={styles.kicker}>Global Progress</Text>
          <Text style={styles.tinyStrong}>42% Complete</Text>
        </View>
        <Progress value={42} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {["All Topics", "Fundamentals", "Sentence Structure", "Professional"].map((chip, index) => (
          <View key={chip} style={[styles.chip, index === 0 && styles.chipActive]}>
            <Text style={[styles.chipText, index === 0 && styles.chipTextActive]}>{chip}</Text>
          </View>
        ))}
      </ScrollView>

      {grammarTopics.map((topic) => (
        <Card key={topic.title}>
          <View style={styles.topicTop}>
            <View style={styles.topicIcon}>
              <MaterialCommunityIcons
                name={topic.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={26}
                color={colors.primary}
              />
            </View>
            <View style={topic.status === "Completed" ? styles.statusDone : styles.statusSoft}>
              <Text style={styles.statusText}>{topic.status}</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{topic.title}</Text>
          <Text style={styles.muted}>{topic.body}</Text>
          {topic.progress > 0 ? <Progress value={topic.progress} /> : null}
          <PrimaryButton
            label={topic.title === "Tenses" ? "Continue Lesson" : "Open Topic"}
            icon="arrow-forward"
            onPress={() => setScreen(topic.title === "Tenses" ? "lesson" : "grammar")}
          />
        </Card>
      ))}

      <Text style={styles.groupHeading}>Core Curriculum</Text>
      {coreTopics.map(([title, body, icon]) => (
        <Pressable key={title} style={styles.listItem}>
          <Ionicons name={icon} size={22} color={colors.primary} />
          <View style={styles.listCopy}>
            <Text style={styles.bodyStrong}>{title}</Text>
            <Text style={styles.tiny}>{body}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.outline} />
        </Pressable>
      ))}

      <Text style={styles.groupHeading}>Advanced Structure</Text>
      {["Active & Passive Voice", "Direct & Indirect Speech", "Modals", "Question Forms"].map((item) => (
        <MiniRow key={item} text={item} />
      ))}

      <Text style={styles.groupHeading}>Communication</Text>
      {["Daily Conversation", "Conditionals", "Phrases & Clauses", "Subject Verb Agreement"].map((item) => (
        <MiniRow key={item} text={item} accent={item === "Daily Conversation"} />
      ))}
    </View>
  );
}

function LessonScreen() {
  const [answer, setAnswer] = useState<string | null>(null);
  const correct = answer === "Saw";

  return (
    <View style={styles.screen}>
      <View style={styles.rowBetween}>
        <Text style={styles.kicker}>Unit 4: Verb Tenses</Text>
        <Text style={styles.tinyStrong}>65% Completed</Text>
      </View>
      <Progress value={65} />

      <Card>
        <View style={styles.inlineTitle}>
          <Ionicons name="book-outline" size={24} color={colors.primary} />
          <Text style={styles.cardTitle}>Past Simple vs. Present Perfect</Text>
        </View>
        <Text style={styles.body}>
          The Past Simple is used for actions completed at a specific time in the past.
          The Present Perfect connects the past to the present, focusing on the experience
          rather than the specific time.
        </Text>
        <ExampleBox
          title="Past Simple"
          text='"I visited London in 2019."'
          helper="Specific time mentioned."
          tone="blue"
        />
        <ExampleBox
          title="Present Perfect"
          text='"I have visited London three times."'
          helper="Focus on the experience."
          tone="green"
        />
      </Card>

      <Text style={styles.groupHeading}>Common Examples</Text>
      <ExampleCard
        sentence="She finished her homework an hour ago."
        note="Past Simple: Finished (Completed Action)"
      />
      <ExampleCard
        sentence="Have you ever eaten Japanese food?"
        note="Present Perfect: Life Experience"
      />

      <Card style={styles.practiceCard}>
        <Text style={styles.body}>Choose the correct form:</Text>
        <Text style={styles.practicePrompt}>"I _____ (see) that movie yesterday."</Text>
        <View style={styles.optionRow}>
          {["Have seen", "Saw", "Seeing"].map((option) => (
            <Pressable
              key={option}
              onPress={() => setAnswer(option)}
              style={[
                styles.option,
                answer === option && styles.optionSelected,
                answer === option && option === "Saw" && styles.optionCorrect
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  answer === option && styles.optionTextSelected
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
        {answer ? (
          <Text style={[styles.feedback, correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
            {correct
              ? "Correct. Yesterday is a specific past time, so Past Simple fits."
              : "Close. Because the sentence says yesterday, use Past Simple: saw."}
          </Text>
        ) : null}
      </Card>

      <View style={styles.tipCard}>
        <Ionicons name="bulb-outline" size={40} color={colors.onPrimary} />
        <Text style={styles.tipTitle}>Tip</Text>
        <Text style={styles.tipText}>
          Look for time markers like yesterday, last week, or ago for Past Simple.
        </Text>
      </View>

      <ChatPanel />
      <PrimaryButton label="Take Quiz" icon="checkmark-circle-outline" />
    </View>
  );
}

function Card({
  children,
  style
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function PrimaryButton({
  label,
  icon,
  onPress
}: {
  label: string;
  icon: IconName;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Ionicons name={icon} size={18} color={colors.onPrimary} />
    </Pressable>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${value}%` }]} />
    </View>
  );
}

function Checklist({ text, complete }: { text: string; complete?: boolean }) {
  return (
    <View style={styles.checkRow}>
      <Ionicons
        name={complete ? "checkmark-circle" : "play-circle"}
        size={22}
        color={complete ? colors.secondary : colors.primary}
      />
      <Text style={styles.bodyStrong}>{text}</Text>
    </View>
  );
}

function Badge({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.badge}>
      <Ionicons name={icon} size={18} color={colors.onSurfaceVariant} />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function ActionTile({
  title,
  body,
  icon,
  action,
  tone
}: {
  title: string;
  body: string;
  icon: IconName;
  action: string;
  tone?: "mint";
}) {
  const mint = tone === "mint";
  return (
    <View style={[styles.actionTile, mint && styles.actionTileMint]}>
      <Ionicons name={icon} size={24} color={mint ? colors.secondary : colors.primary} />
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.muted}>{body}</Text>
      <Text style={[styles.actionLink, mint && styles.actionLinkMint]}>{action}</Text>
    </View>
  );
}

function MiniRow({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <View style={styles.miniRow}>
      <Ionicons
        name={accent ? "hand-left-outline" : "ellipse-outline"}
        size={19}
        color={accent ? colors.secondary : colors.primary}
      />
      <Text style={styles.bodyStrong}>{text}</Text>
    </View>
  );
}

function ExampleBox({
  title,
  text,
  helper,
  tone
}: {
  title: string;
  text: string;
  helper: string;
  tone: "blue" | "green";
}) {
  const green = tone === "green";
  return (
    <View style={[styles.exampleBox, green && styles.exampleBoxGreen]}>
      <Text style={[styles.exampleTitle, green && styles.exampleTitleGreen]}>{title}</Text>
      <Text style={styles.exampleSentence}>{text}</Text>
      <Text style={styles.tiny}>{helper}</Text>
    </View>
  );
}

function ExampleCard({ sentence, note }: { sentence: string; note: string }) {
  return (
    <View style={styles.exampleCard}>
      <View style={styles.rowBetween}>
        <Ionicons name="checkmark-circle" size={22} color={colors.secondary} />
        <Ionicons name="volume-high-outline" size={22} color={colors.outline} />
      </View>
      <Text style={styles.bodyStrong}>{sentence}</Text>
      <Text style={styles.tiny}>{note}</Text>
    </View>
  );
}

function ChatPanel() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hi! Try saying a sentence about what you did yesterday using the Past Simple!",
      mine: false
    },
    { text: '"I have went to the store yesterday."', mine: true },
    {
      text: "Great start. Use 'I went yesterday' because yesterday is a specific time.",
      mine: false
    }
  ]);

  const sendMessage = async () => {
    const message = draft.trim();
    if (!message) return;

    setDraft("");
    setMessages((current) => [...current, { text: message, mine: true }]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      setMessages((current) => [
        ...current,
        { text: data.correction ? `${data.reply}\nCorrect: ${data.correction}` : data.reply, mine: false }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          text: "I could not reach the backend. Start it with npm.cmd run backend, then try again.",
          mine: false
        }
      ]);
    }
  };

  return (
    <View style={styles.chatPanel}>
      <View style={styles.chatHeader}>
        <View style={styles.teacherIcon}>
          <Ionicons name="sparkles-outline" size={22} color={colors.secondary} />
        </View>
        <View>
          <Text style={styles.bodyStrong}>AI Teacher</Text>
          <Text style={styles.tinyGreen}>Online and listening</Text>
        </View>
      </View>
      {messages.map((message, index) => (
        <ChatBubble key={`${message.text}-${index}`} text={message.text} mine={message.mine} />
      ))}
      <View style={styles.chatInputRow}>
        <TextInput
          placeholder="Type or ask a question..."
          style={styles.chatInput}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={sendMessage}
        />
        <Pressable style={styles.chatMic} onPress={sendMessage}>
          <Ionicons name="send" size={20} color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

function ChatBubble({ text, mine }: { text: string; mine?: boolean }) {
  return (
    <View style={[styles.chatBubble, mine && styles.chatBubbleMine]}>
      <Text style={[styles.chatText, mine && styles.chatTextMine]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  appShell: {
    flex: 1
  },
  topBar: {
    height: 64,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  brand: {
    color: colors.primary,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "800"
  },
  streak: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "700"
  },
  apiOnline: {
    color: colors.secondary
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryFixed
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 98
  },
  screen: {
    padding: 20,
    gap: 16
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    gap: 12
  },
  heroTitle: {
    color: colors.onPrimary,
    fontSize: 31,
    lineHeight: 39,
    fontWeight: "800"
  },
  heroSubtitle: {
    color: colors.onPrimary,
    opacity: 0.92,
    fontSize: 17,
    lineHeight: 26
  },
  quoteBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)"
  },
  quoteText: {
    color: colors.onPrimary,
    fontSize: 15,
    lineHeight: 23
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(195,198,215,0.55)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.surfaceContainer
  },
  pillText: {
    color: colors.primary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800"
  },
  cardTitle: {
    color: colors.onSurface,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
    marginTop: 6
  },
  muted: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 23
  },
  micCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 15
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  progressNumber: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 18
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 999,
    overflow: "hidden"
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.secondaryFixedDim,
    borderRadius: 999
  },
  bodyStrong: {
    color: colors.onSurface,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700"
  },
  body: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    lineHeight: 24
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surfaceLow
  },
  badgeText: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "700"
  },
  twoColumn: {
    gap: 14
  },
  actionTile: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(195,198,215,0.55)",
    gap: 8
  },
  actionTileMint: {
    backgroundColor: colors.tertiaryFixed
  },
  actionTitle: {
    color: colors.onSurface,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800"
  },
  actionLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6
  },
  actionLinkMint: {
    color: colors.secondary
  },
  progressBand: {
    backgroundColor: "rgba(255,255,255,0.86)",
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant
  },
  kicker: {
    color: colors.secondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  tinyStrong: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: "800"
  },
  tiny: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17
  },
  tinyGreen: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: "700"
  },
  chips: {
    gap: 8,
    paddingRight: 20
  },
  chip: {
    borderRadius: 999,
    backgroundColor: colors.primaryFixed,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  chipActive: {
    backgroundColor: colors.primary
  },
  chipText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800"
  },
  chipTextActive: {
    color: colors.onPrimary
  },
  topicTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center"
  },
  statusDone: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  statusSoft: {
    backgroundColor: colors.primaryFixed,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  statusText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  groupHeading: {
    color: colors.outline,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 10
  },
  listItem: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(195,198,215,0.45)"
  },
  listCopy: {
    flex: 1
  },
  miniRow: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  inlineTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  exampleBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#eef4ff",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  exampleBoxGreen: {
    backgroundColor: "#ecfff7",
    borderLeftColor: colors.secondary
  },
  exampleTitle: {
    color: colors.primary,
    fontWeight: "800",
    marginBottom: 4
  },
  exampleTitleGreen: {
    color: colors.secondary
  },
  exampleSentence: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic"
  },
  exampleCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(195,198,215,0.55)",
    padding: 16,
    gap: 8
  },
  practiceCard: {
    backgroundColor: colors.surfaceLow
  },
  practicePrompt: {
    color: colors.onSurface,
    fontSize: 21,
    lineHeight: 30,
    fontWeight: "800"
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  option: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  optionCorrect: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary
  },
  optionText: {
    color: colors.onSurface,
    fontWeight: "700"
  },
  optionTextSelected: {
    color: colors.onPrimary
  },
  feedback: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  feedbackCorrect: {
    color: colors.secondary
  },
  feedbackWrong: {
    color: colors.error
  },
  tipCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8
  },
  tipTitle: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "800"
  },
  tipText: {
    color: colors.onPrimary,
    opacity: 0.92,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19
  },
  chatPanel: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(195,198,215,0.55)"
  },
  chatHeader: {
    backgroundColor: colors.surfaceLow,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  teacherIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondaryContainer
  },
  chatBubble: {
    alignSelf: "flex-start",
    maxWidth: "86%",
    backgroundColor: colors.surfaceContainer,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12
  },
  chatBubbleMine: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4
  },
  chatText: {
    color: colors.onSurface,
    fontSize: 14,
    lineHeight: 20
  },
  chatTextMine: {
    color: colors.onPrimary
  },
  chatInputRow: {
    marginTop: 14,
    padding: 14,
    backgroundColor: colors.surfaceLow,
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  chatInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    paddingHorizontal: 14
  },
  chatMic: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 74,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 6
  },
  navButton: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  navLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: "700"
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: "900"
  }
});
