import React from "react";
import {  Text, View } from "react-native";
import SectionCard from "../ui/SectionCard";
import InfoItem from "./InfoItem";
import { styles } from "./StarInfoCard.styles";


export default function StarInfoCard({
  star,
  isOwned,
}: {
  star: {
    baseName: string;
    displayName?: string | null;
    magnitude?: number;
    constellation?: string | null;
    owner?: { name?: string | null } | null;
  };
  isOwned: boolean;
}) {
  const mag = star.magnitude != null ? star.magnitude.toFixed(2) : "";
  const constel = star.constellation ?? "—";
  const owner = isOwned ? (star.owner?.name ?? "Private") : "Not Owned";
  const newName = star.displayName ?? star.baseName;

  return (
    <SectionCard>
      <Text style={styles.title}>Star Information</Text>

      <View style={styles.grid}>
        <InfoItem label="magnitude" value={mag} />
        <InfoItem label="Constellation" value={constel} />
        <InfoItem label="Owner" value={owner} />
        <InfoItem label="New Name" value={newName} />
      </View>

      <Text style={styles.caption}>
        {`${star.baseName} is the brightest star in the ${constel} constellation.`}
        {" "}It is a relatively close star in our night sky.
      </Text>
    </SectionCard>
  );
}

