import React, { useEffect, useState } from "react";
import { ScrollView, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";     
import SearchBar from "@/components/Search/SearchBar";
import StarsList from "@/components/Search/StarListSearch/StarListSearch";
import Background from "@/components/Background";
import { StarsAPI } from "@/lib/endpoint";
import styles from "./StarsScreen.styles";
import { Star } from "@/components/Home/StarItem";
import { transformStars  } from "@/lib/utils/formatStar";

export default function StarsScreen() {
  const [search, setSearch] = useState("");
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(false);

 
  const loadStars = async (query: string) => {
    try {
      setLoading(true);
      const res = await StarsAPI.list({ q: query });
      setStars(transformStars(res.items));
    } catch (err) {
      console.error("Failed to load stars", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStars("");
  }, []);

  const handleSearch = (text: string) => setSearch(text);
  const handleClear = () => {
    setSearch("");
    loadStars("");
  };
  const handleSubmit = (text: string) => loadStars(text);
   const handlePressStar = (star: Star) => {
      router.push({
        pathname: "/(tabs)/(star)/[starId]",
        params: { starId: star.id }
      });
  };


  return (
    <View style={styles.container}>
      <Background />

      <SearchBar
        value={search}
        onChange={handleSearch}
        onClear={handleClear}
        onSubmit={handleSubmit}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#fff" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <StarsList stars={stars} onPressStar={handlePressStar} />
        </ScrollView>
      )}
    </View>
  );
}
