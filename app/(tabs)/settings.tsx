import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [randomRepoName, setRandomRepoName] = useState("");

  const fetchRepo = () => {
    fetch(`https://api.github.com/users/${username}/repos`)
      .then((response) => response.json())
      .then((data) =>
        setRandomRepoName(data[Math.floor(Math.random() * data.length)].name),
      )
      .catch((error) => console.error(error));
  };

  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter your github username"
      />
      <Button title="Fetch repo" onPress={fetchRepo}></Button>
      <Text style={styles.repoName}>Random Repo: {randomRepoName}</Text>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  repoName: {
    fontSize: 10,
    marginTop: 10,
    color: "black",
  },
});
