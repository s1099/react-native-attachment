import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentImage,
  AttachmentMedia,
  AttachmentThemeProvider,
  AttachmentTitle,
  AttachmentTrigger,
  formatFileSize,
} from "../src";

import type { AttachmentState } from "../src";

/**
 * Not wired to a runtime — this file exists so the public API is exercised and
 * typechecked the way an app would use it. Icons are stand-ins for whatever
 * icon set you use (lucide-react-native, react-native-svg, an emoji…).
 */

type Upload = {
  id: string;
  name: string;
  kind: string;
  bytes: number;
  state: AttachmentState;
  previewUri?: string;
};

const uploads: Upload[] = [
  {
    id: "1",
    name: "sales-dashboard.pdf",
    kind: "PDF",
    bytes: 2_400_000,
    state: "done",
  },
  {
    id: "2",
    name: "q3-forecast.xlsx",
    kind: "Spreadsheet",
    bytes: 840_000,
    state: "uploading",
  },
  {
    id: "3",
    name: "keynote-cover.png",
    kind: "Image",
    bytes: 5_100_000,
    state: "error",
    previewUri: "https://example.com/keynote-cover.png",
  },
];

/** Placeholder glyph so the example has no icon-library dependency. */
function Glyph({ color, size }: { color: string; size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        borderWidth: 1.5,
        borderColor: color,
      }}
    />
  );
}

function describe(upload: Upload) {
  if (upload.state === "uploading") return "Uploading…";
  if (upload.state === "processing") return "Processing…";
  if (upload.state === "error") return "Upload failed — tap to retry";
  return `${upload.kind} · ${formatFileSize(upload.bytes)}`;
}

export function ChatComposer() {
  const [items, setItems] = React.useState(uploads);

  const remove = (id: string) =>
    setItems((current) => current.filter((item) => item.id !== id));

  return (
    <AttachmentThemeProvider>
      <View style={styles.composer}>
        <Text style={styles.label}>Attachments</Text>

        <AttachmentGroup>
          {items.map((item) => (
            <Attachment key={item.id} size="sm" state={item.state}>
              <AttachmentMedia variant={item.previewUri ? "image" : "icon"}>
                {item.previewUri ? (
                  <AttachmentImage source={{ uri: item.previewUri }} />
                ) : (
                  ({ color, size }) => <Glyph color={color} size={size} />
                )}
              </AttachmentMedia>

              <AttachmentContent>
                <AttachmentTitle>{item.name}</AttachmentTitle>
                <AttachmentDescription>{describe(item)}</AttachmentDescription>
              </AttachmentContent>

              <AttachmentTrigger
                accessibilityLabel={`Open ${item.name}`}
                onPress={() => {}}
              />

              <AttachmentActions>
                <AttachmentAction
                  accessibilityLabel={`Remove ${item.name}`}
                  onPress={() => remove(item.id)}
                >
                  {({ color, size }) => <Glyph color={color} size={size} />}
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ))}
        </AttachmentGroup>

        {/* An empty drop target, using the dashed `idle` state. */}
        <Attachment state="idle" size="xs">
          <AttachmentMedia>
            {({ color, size }) => <Glyph color={color} size={size} />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Add a file</AttachmentTitle>
            <AttachmentDescription>Up to 25 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentTrigger
            accessibilityLabel="Add a file"
            onPress={() => {}}
          />
        </Attachment>
      </View>
    </AttachmentThemeProvider>
  );
}

const styles = StyleSheet.create({
  composer: {
    gap: 8,
    padding: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
});
