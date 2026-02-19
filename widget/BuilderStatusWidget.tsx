// // "use no memo";
// // import React from "react";
// // import {
// //   FlexWidget,
// //   ImageWidget,
// //   TextWidget,
// // } from "react-native-android-widget";

// // export function BuilderStatusWidget(props: {
// //   title: string;
// //   subtitle: string;
// //   progress: number;
// //   showProgress: boolean;
// // }) {
// //   const isFree = props.subtitle === "All builders free";

// //   const clamped = Math.max(0, Math.min(props.progress, 1));
// //   const progressWidth = Math.floor(220 * clamped);

// //   return (
// //     <FlexWidget
// //       style={{
// //         width: "match_parent",
// //         height: "match_parent",
// //         padding: 16,
// //         backgroundColor: "#1e293b",
// //         flexDirection: "row",
// //         alignItems: "center",
// //       }}
// //     >
// //       <ImageWidget
// //         image={
// //           isFree
// //             ? require("@/assets/images/builder/builder-idle.png")
// //             : require("@/assets/images/builder/builder-working.png")
// //         }
// //         imageWidth={48}
// //         imageHeight={48}
// //       />

// //       <FlexWidget style={{ width: 14 }} />

// //       <FlexWidget
// //         style={{
// //           flexDirection: "column",
// //           justifyContent: "center",
// //         }}
// //       >
// //         <TextWidget
// //           text={props.title}
// //           style={{
// //             color: "#9aa0a6",
// //             fontSize: 13,
// //             fontWeight: "500",
// //           }}
// //           maxLines={1}
// //         />

// //         <TextWidget
// //           text={props.subtitle}
// //           style={{
// //             color: "#ffd33d",
// //             fontSize: 22,
// //             fontWeight: "700",
// //             marginTop: 4,
// //           }}
// //           maxLines={1}
// //         />
// //         {props.showProgress && (
// //           <FlexWidget
// //             style={{
// //               height: 6,
// //               backgroundColor: "#333",
// //               borderRadius: 6,
// //               marginTop: 8,
// //               width: 220,
// //             }}
// //           >
// //             <FlexWidget
// //               style={{
// //                 height: "match_parent",
// //                 width: progressWidth,
// //                 backgroundColor: "#ffd33d",
// //                 borderRadius: 6,
// //               }}
// //             />
// //           </FlexWidget>
// //         )}
// //       </FlexWidget>
// //     </FlexWidget>
// //   );
// // }

// "use no memo";
// import React from "react";
// import {
//   FlexWidget,
//   ImageWidget,
//   TextWidget,
// } from "react-native-android-widget";

// export function BuilderStatusWidget(props: {
//   title: string;
//   subtitle: string; // total time remaining
//   progress: number;
//   showProgress: boolean;
//   levelText?: string;
//   builderCountText?: string; // e.g. "2 / 5 builders free"
// }) {
//   const isFree = props.subtitle === "All builders free";
//   const clamped = Math.max(0, Math.min(props.progress, 1));

//   return (
//     <FlexWidget
//       style={{
//         width: "match_parent",
//         height: "match_parent",
//         // padding: 12,
//         backgroundColor: "#111827", // deep slate
//         borderRadius: 18,
//       }}
//     >
//       {/* Row 1 — Icon + Title + Time */}
//       <FlexWidget
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <FlexWidget
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             flex: 1,
//           }}
//         >
//           <ImageWidget
//             image={
//               isFree
//                 ? require("@/assets/images/builder/builder-idle.png")
//                 : require("@/assets/images/builder/builder-working.png")
//             }
//             imageWidth={26}
//             imageHeight={26}
//           />

//           <FlexWidget style={{ width: 8 }} />

//           <TextWidget
//             text={props.title}
//             style={{
//               color: "#f3f4f6",
//               fontSize: 13,
//               fontWeight: "600",
//             }}
//             maxLines={1}
//           />
//         </FlexWidget>

//         {!isFree && (
//           <TextWidget
//             text={props.subtitle}
//             style={{
//               color: "#facc15",
//               fontSize: 14,
//               fontWeight: "700",
//             }}
//             maxLines={1}
//           />
//         )}
//       </FlexWidget>

//       {/* Row 2 — Level */}
//       {props.levelText && !isFree && (
//         <TextWidget
//           text={props.levelText}
//           style={{
//             color: "#9ca3af",
//             fontSize: 11,
//             marginTop: 6,
//           }}
//           maxLines={1}
//         />
//       )}

//       {/* Row 3 — Progress */}
//       {props.showProgress && !isFree && (
//         <FlexWidget
//           style={{
//             height: 5,
//             backgroundColor: "#374151",
//             borderRadius: 5,
//             flexDirection: "row",
//             marginTop: 8,
//           }}
//         >
//           <FlexWidget
//             style={{
//               flex: clamped,
//               backgroundColor: "#22c55e",
//               borderRadius: 5,
//             }}
//           />
//           <FlexWidget style={{ flex: 1 - clamped }} />
//         </FlexWidget>
//       )}

//       {/* Row 4 — Builder Count */}
//       <FlexWidget
//         style={{
//           marginTop: 10,
//           alignItems: "center",
//         }}
//       >
//         <TextWidget
//           text={
//             isFree
//               ? (props.builderCountText ?? "All builders free")
//               : (props.builderCountText ?? "")
//           }
//           style={{
//             color: isFree ? "#22c55e" : "#94a3b8",
//             fontSize: 12,
//             fontWeight: "600",
//           }}
//           maxLines={1}
//         />
//       </FlexWidget>
//     </FlexWidget>
//   );
// }

// -----------------V2---------------- Good , free builders not rendering
// "use no memo";
// import React from "react";
// import {
//   FlexWidget,
//   ImageWidget,
//   TextWidget,
// } from "react-native-android-widget";

// export function BuilderStatusWidget(props: {
//   title: string;
//   subtitle: string; // total time remaining
//   progress: number;
//   showProgress: boolean;
//   levelText?: string;
//   builderCountText?: string; // e.g. "2 / 5 builders free"
// }) {
//   const isFree = props.subtitle === "All builders free";
//   const clamped = Math.max(0, Math.min(props.progress, 1));
//   const progressWidth = Math.floor(220 * clamped); // Fixed width for progress

//   return (
//     <FlexWidget
//       style={{
//         width: "match_parent",
//         height: "match_parent",
//         paddingVertical: 12,
//         paddingHorizontal: 14,
//         backgroundColor: "#0f172a",
//         borderRadius: 16,
//         flexDirection: "column",
//         justifyContent: "space-between",
//       }}
//     >
//       {/* Main Content Section */}
//       <FlexWidget
//         style={{
//           flexDirection: "column",
//         }}
//       >
//         {/* Row 1 — Icon + Title + Time */}
//         <FlexWidget
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginBottom: 8,
//           }}
//         >
//           <FlexWidget
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               flex: 1,
//             }}
//           >
//             {/* Icon Container */}
//             <FlexWidget
//               style={{
//                 width: 36,
//                 height: 36,
//                 borderRadius: 10,
//                 backgroundColor: "rgba(251, 191, 36, 0.1)",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 marginRight: 8,
//               }}
//             >
//               <ImageWidget
//                 image={
//                   isFree
//                     ? require("@/assets/images/builder/builder-idle.png")
//                     : require("@/assets/images/builder/builder-working.png")
//                 }
//                 imageWidth={24}
//                 imageHeight={24}
//               />
//             </FlexWidget>

//             {/* Title */}
//             <TextWidget
//               text={props.title}
//               style={{
//                 color: "#f1f5f9",
//                 fontSize: 13,
//                 fontWeight: "700",
//               }}
//               maxLines={1}
//             />
//           </FlexWidget>

//           {/* Remaining Time - Gold Accent */}
//           {!isFree && (
//             <TextWidget
//               text={props.subtitle}
//               style={{
//                 color: "#fbbf24",
//                 fontSize: 14,
//                 fontWeight: "800",
//                 marginLeft: 8,
//               }}
//               maxLines={1}
//             />
//           )}
//         </FlexWidget>

//         {/* Row 2 — Level Badge */}
//         {props.levelText && !isFree && (
//           <FlexWidget
//             style={{
//               backgroundColor: "rgba(14, 165, 233, 0.15)",
//               borderRadius: 6,
//               paddingHorizontal: 6,
//               paddingVertical: 3,
//               // alignSelf: "flex-start",
//               marginBottom: 8,
//             }}
//           >
//             <TextWidget
//               text={props.levelText}
//               style={{
//                 color: "#0ea5e9",
//                 fontSize: 10,
//                 fontWeight: "600",
//               }}
//               maxLines={1}
//             />
//           </FlexWidget>
//         )}

//         {/* Row 3 — Progress Bar */}
//         {props.showProgress && !isFree && (
//           <FlexWidget
//             style={{
//               width: "match_parent",
//               height: 4,
//               backgroundColor: "rgba(148, 163, 184, 0.2)",
//               borderRadius: 2,
//               overflow: "hidden",
//               marginBottom: 8,
//             }}
//           >
//             <FlexWidget
//               style={{
//                 width: progressWidth,
//                 height: "match_parent",
//                 backgroundColor: "#fbbf24",
//               }}
//             />
//           </FlexWidget>
//         )}
//       </FlexWidget>

//       {/* Footer Section — Builder Count */}
//       <FlexWidget
//         style={{
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <TextWidget
//           text={
//             isFree
//               ? (props.builderCountText ?? "All builders free")
//               : (props.builderCountText ?? "")
//           }
//           style={{
//             color: isFree ? "#22c55e" : "#94a3b8",
//             fontSize: 11,
//             fontWeight: "600",
//           }}
//           maxLines={1}
//         />
//       </FlexWidget>
//     </FlexWidget>
//   );
// }

// ----------------V3----------------
// "use no memo";
// import React from "react";
// import {
//   FlexWidget,
//   ImageWidget,
//   TextWidget,
// } from "react-native-android-widget";

// export function BuilderStatusWidget(props: {
//   title: string;
//   subtitle: string; // total time remaining
//   progress: number;
//   showProgress: boolean;
//   levelText?: string;
//   builderCountText?: string; // e.g. "2 / 5 builders free"
// }) {
//   const isFree = props.subtitle === "All builders free";
//   const clamped = Math.max(0, Math.min(props.progress, 1));
//   const progressWidth = Math.floor(180 * clamped); // Fixed width for progress

//   return (
//     <FlexWidget
//       style={{
//         width: "match_parent",
//         height: "match_parent",
//         paddingVertical: 14,
//         paddingHorizontal: 14,
//         backgroundColor: "#0f172a",
//         borderRadius: 16,
//         flexDirection: "column",
//       }}
//     >
//       {/* Row 1 — Icon + Title */}
//       <FlexWidget
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           marginBottom: 10,
//         }}
//       >
//         {/* Icon Container */}
//         <FlexWidget
//           style={{
//             width: 40,
//             height: 40,
//             borderRadius: 12,
//             backgroundColor: "rgba(251, 191, 36, 0.15)",
//             alignItems: "center",
//             justifyContent: "center",
//             marginRight: 10,
//           }}
//         >
//           <ImageWidget
//             image={
//               isFree
//                 ? require("@/assets/images/builder/builder-idle.png")
//                 : require("@/assets/images/builder/builder-working.png")
//             }
//             imageWidth={24}
//             imageHeight={24}
//           />
//         </FlexWidget>

//         {/* Title + Time */}
//         <FlexWidget
//           style={{
//             flex: 1,
//             flexDirection: "column",
//           }}
//         >
//           <TextWidget
//             text={props.title}
//             style={{
//               color: "#f1f5f9",
//               fontSize: 13,
//               fontWeight: "700",
//               marginBottom: 2,
//             }}
//             maxLines={1}
//           />

//           {!isFree && (
//             <TextWidget
//               text={props.subtitle}
//               style={{
//                 color: "#fbbf24",
//                 fontSize: 13,
//                 fontWeight: "800",
//               }}
//               maxLines={1}
//             />
//           )}
//         </FlexWidget>
//       </FlexWidget>

//       {/* Row 2 — Level Badge */}
//       {props.levelText && !isFree && (
//         <FlexWidget
//           style={{
//             backgroundColor: "rgba(14, 165, 233, 0.2)",
//             borderRadius: 6,
//             paddingHorizontal: 8,
//             paddingVertical: 4,
//             width: "match_parent",
//             marginBottom: 8,
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <TextWidget
//             text={props.levelText}
//             style={{
//               color: "#0ea5e9",
//               fontSize: 11,
//               fontWeight: "600",
//             }}
//             maxLines={1}
//           />
//         </FlexWidget>
//       )}

//       {/* Row 3 — Progress Bar */}
//       {props.showProgress && !isFree && (
//         <FlexWidget
//           style={{
//             width: "match_parent",
//             height: 5,
//             backgroundColor: "rgba(148, 163, 184, 0.2)",
//             borderRadius: 3,
//             overflow: "hidden",
//             marginBottom: 10,
//             flexDirection: "row",
//           }}
//         >
//           <FlexWidget
//             style={{
//               width: progressWidth,
//               height: "match_parent",
//               backgroundColor: "#fbbf24",
//               borderRadius: 3,
//             }}
//           />
//         </FlexWidget>
//       )}

//       {/* Row 4 — Builder Count */}
//       <FlexWidget
//         style={{
//           width: "match_parent",
//           height: 24,
//           alignItems: "center",
//           justifyContent: "center",
//           backgroundColor: isFree
//             ? "rgba(34, 197, 94, 0.1)"
//             : "rgba(148, 163, 184, 0.08)",
//           borderRadius: 6,
//         }}
//       >
//         <TextWidget
//           text={
//             isFree
//               ? (props.builderCountText ?? "All builders free")
//               : (props.builderCountText ?? "Upgrading...")
//           }
//           style={{
//             color: isFree ? "#22c55e" : "#cbd5e1",
//             fontSize: 11,
//             fontWeight: "600",
//             letterSpacing: 0.2,
//           }}
//           maxLines={1}
//         />
//       </FlexWidget>
//     </FlexWidget>
//   );
// }

// -----------V4---------filling space
"use no memo";
import React from "react";
import {
  FlexWidget,
  ImageWidget,
  TextWidget,
} from "react-native-android-widget";

export function BuilderStatusWidget(props: {
  title: string;
  subtitle: string; // total time remaining
  progress: number;
  showProgress: boolean;
  levelText?: string;
  builderCountText?: string; // e.g. "2 / 5 builders free"
  nextUpgradeText?: string; // e.g. "Next: Archer Tower"
}) {
  const isFree = props.subtitle === "All builders free";
  const clamped = Math.max(0, Math.min(props.progress, 1));
  const progressWidth = Math.floor(180 * clamped);

  return (
    <FlexWidget
      style={{
        width: "match_parent",
        height: "match_parent",
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: "#0f172a",
        borderRadius: 16,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* TOP SECTION — Current Builder */}
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {/* Icon Container */}
        <FlexWidget
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: "rgba(251, 191, 36, 0.15)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <ImageWidget
            image={
              isFree
                ? require("@/assets/images/builder/builder-idle.png")
                : require("@/assets/images/builder/builder-working.png")
            }
            imageWidth={26}
            imageHeight={26}
          />
        </FlexWidget>

        {/* Title + Subtitle */}
        <FlexWidget
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text={props.title}
            style={{
              color: "#f1f5f9",
              fontSize: 13,
              fontWeight: "700",
              marginBottom: 2,
            }}
            maxLines={1}
          />

          {!isFree && (
            <TextWidget
              text={props.subtitle}
              style={{
                color: "#fbbf24",
                fontSize: 12,
                fontWeight: "700",
              }}
              maxLines={1}
            />
          )}

          {isFree && (
            <TextWidget
              text="All builders free"
              style={{
                color: "#22c55e",
                fontSize: 11,
                fontWeight: "600",
              }}
              maxLines={1}
            />
          )}
        </FlexWidget>
      </FlexWidget>

      {/* MIDDLE SECTION — Progress & Levels */}
      {!isFree && (
        <FlexWidget
          style={{
            flexDirection: "column",
            marginBottom: 8,
          }}
        >
          {/* Level Badge */}
          {props.levelText && (
            <FlexWidget
              style={{
                backgroundColor: "rgba(14, 165, 233, 0.2)",
                borderRadius: 5,
                paddingHorizontal: 8,
                paddingVertical: 3,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 6,
              }}
            >
              <TextWidget
                text={props.levelText}
                style={{
                  color: "#0ea5e9",
                  fontSize: 10,
                  fontWeight: "600",
                }}
                maxLines={1}
              />
            </FlexWidget>
          )}

          {/* Progress Bar */}
          {props.showProgress && (
            <FlexWidget
              style={{
                width: "match_parent",
                height: 5,
                backgroundColor: "rgba(148, 163, 184, 0.2)",
                borderRadius: 3,
                overflow: "hidden",
                flexDirection: "row",
              }}
            >
              <FlexWidget
                style={{
                  width: progressWidth,
                  height: "match_parent",
                  backgroundColor: "#fbbf24",
                  borderRadius: 3,
                }}
              />
            </FlexWidget>
          )}
        </FlexWidget>
      )}

      {/* DIVIDER */}
      <FlexWidget
        style={{
          height: 1,
          backgroundColor: "rgba(148, 163, 184, 0.15)",
          marginVertical: 8,
          width: "match_parent",
        }}
      />

      {/* BOTTOM SECTION — Status Summary */}
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Builder Count */}
        <FlexWidget
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 24,
            backgroundColor: isFree
              ? "rgba(34, 197, 94, 0.12)"
              : "rgba(59, 130, 246, 0.12)",
            borderRadius: 6,
          }}
        >
          <TextWidget
            text={
              isFree
                ? "🟢 All Free"
                : "🔨 " + (props.builderCountText ?? "Busy")
            }
            style={{
              color: isFree ? "#22c55e" : "#60a5fa",
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 0.2,
            }}
            maxLines={1}
          />
        </FlexWidget>

        {/* Right: Next Time */}
        {!isFree && (
          <FlexWidget
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 24,
              backgroundColor: "rgba(251, 191, 36, 0.12)",
              borderRadius: 6,
            }}
          >
            <TextWidget
              text={"⏱ " + props.subtitle}
              style={{
                color: "#fbbf24",
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 0.2,
              }}
              maxLines={1}
            />
          </FlexWidget>
        )}
      </FlexWidget>

      {/* NEXT UPGRADE HINT - Optional */}
      {props.nextUpgradeText && !isFree && (
        <FlexWidget
          style={{
            marginTop: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: "rgba(148, 163, 184, 0.08)",
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text={props.nextUpgradeText}
            style={{
              color: "#94a3b8",
              fontSize: 9,
              fontWeight: "500",
            }}
            maxLines={1}
          />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
