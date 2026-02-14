"use no memo";
import React from "react";
import {
  FlexWidget,
  ImageWidget,
  TextWidget,
} from "react-native-android-widget";

export function BuilderStatusWidget(props: {
  title: string;
  subtitle: string;
  progress: number;
  showProgress: boolean;
}) {
  const isFree = props.subtitle === "All builders free";

  const clamped = Math.max(0, Math.min(props.progress, 1));
  const progressWidth = Math.floor(220 * clamped);

  return (
    <FlexWidget
      style={{
        width: "match_parent",
        height: "match_parent",
        padding: 16,
        backgroundColor: "#1e293b",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <ImageWidget
        image={
          isFree
            ? require("@/assets/images/builder/builder-idle.png")
            : require("@/assets/images/builder/builder-working.png")
        }
        imageWidth={48}
        imageHeight={48}
      />

      <FlexWidget style={{ width: 14 }} />

      <FlexWidget
        style={{
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <TextWidget
          text={props.title}
          style={{
            color: "#9aa0a6",
            fontSize: 13,
            fontWeight: "500",
          }}
          maxLines={1}
        />

        <TextWidget
          text={props.subtitle}
          style={{
            color: "#ffd33d",
            fontSize: 22,
            fontWeight: "700",
            marginTop: 4,
          }}
          maxLines={1}
        />
        {props.showProgress && (
          <FlexWidget
            style={{
              height: 6,
              backgroundColor: "#333",
              borderRadius: 6,
              marginTop: 8,
              width: 220,
            }}
          >
            <FlexWidget
              style={{
                height: "match_parent",
                width: progressWidth,
                backgroundColor: "#ffd33d",
                borderRadius: 6,
              }}
            />
          </FlexWidget>
        )}
      </FlexWidget>
    </FlexWidget>
  );
}
