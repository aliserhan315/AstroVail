import React, { useState, useEffect } from "react";
import { Modal, View, Text, Alert } from "react-native";
import SectionCard from "@/components/ui/SectionCard";
import LabeledInput from "@/components/ui/LabeledInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { styles } from "./EditStarModal.styles";

interface EditStarModalProps {
  visible: boolean;
  star: any;
  onClose: () => void;
  onSave: (newName: string, newStory: string) => Promise<void>;
}

export default function EditStarModal({ visible, star, onClose, onSave }: EditStarModalProps) {
  const [newName, setNewName] = useState("");
  const [newStory, setNewStory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && star) {
      setNewName(star.displayName ?? "");
      setNewStory(star.story ?? "");
    }
  }, [visible, star]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(newName, newStory);
    } catch (e: any) {
      Alert.alert("Update failed", e?.response?.data?.message ?? e?.message ?? "Please try again");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setNewName("");
    setNewStory("");
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SectionCard style={styles.modalContainer}>
          <Text style={styles.title}>Edit Your Star</Text>
          
          <LabeledInput 
            label="Name" 
            value={newName} 
            onChangeText={setNewName} 
            placeholder="New display name" 
            autoCapitalize="words"
            style={styles.nameInput}
          />
          
          <LabeledInput
            label="Story"
            value={newStory}
            onChangeText={setNewStory}
            placeholder="Write your star's story"
            multiline
            style={styles.storyInput}
          />
          
          <View style={styles.buttonContainer}>
            <PrimaryButton
              text={saving ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              
              style={styles.saveButton}
            />
            <PrimaryButton 
              text="Cancel" 
              variant="secondary" 
              onPress={handleClose}
              style={styles.cancelButton}
            />
          </View>
        </SectionCard>
      </View>
    </Modal>
  );
}