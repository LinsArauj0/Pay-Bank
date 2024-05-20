import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { launchImageLibrary } from "react-native-image-picker";
import { db } from "../../Service/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Card = ({ onPress, iconSource, description }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={iconSource} style={styles.cardIcon} />
    <Text style={styles.cardDescription}>{description}</Text>
  </TouchableOpacity>
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCreditCardInfo, setShowCreditCardInfo] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          const userDocRef = doc(db, "users", userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data().usuario;
            setUserName(userData.name);
            setProfileImage(userData.profileImage);
          } else {
            console.log("User document not found");
          }
        } else {
          console.log("User ID not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChooseImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        maxWidth: 512,
        maxHeight: 512,
        quality: 1,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.error) {
          console.error("ImagePicker Error: ", response.error);
        } else {
          const source = { uri: response.assets[0].uri };
          uploadImage(source.uri);
        }
      }
    );
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const userId = await AsyncStorage.getItem("userId");
      const storage = getStorage();
      const storageRef = ref(storage, `profileImages/${userId}`);

      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      setProfileImage(downloadURL);

      await updateDoc(doc(db, "users", userId), { profileImage: downloadURL });

      setModalVisible(false);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <Image
              source={require("../../assets/user.png")}
              style={styles.profileImage}
            />
          )}
        </TouchableOpacity>
        <Text style={styles.greetingText}>Olá, {userName}</Text>
      </View>

      <View style={styles.subContainer}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceTitle}>Saldo disponível</Text>
          <Text style={styles.balanceAmount}>R$ 3.456,87</Text>
          <View style={styles.separator}></View>
        </View>

        <View style={styles.cardsContainer}>
          <Card
            onPress={() => navigation.navigate("ChavesPixRegistradas")}
            iconSource={require("../../assets/pix.png")}
            description="Pix"
          />
          <Card
            iconSource={require("../../assets/transf.png")}
            description="Transf"
          />
          <Card
            onPress={() => navigation.navigate("StatementScreen")}
            iconSource={require("../../assets/doc.png")}
            description="Extrato"
          />
          <Card
            onPress={() => setShowCreditCardInfo(!showCreditCardInfo)}
            iconSource={require("../../assets/cartao.png")}
            description="Detalhes Cartão"
          />
        </View>

        {showCreditCardInfo ? (
          <View style={styles.creditCardContainer}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoTitle}>Fatura atual</Text>
              <Text style={styles.cardInfoAmount}>R$ 288,00</Text>
              <View style={styles.line}></View>
              <View style={styles.transactionContainer}>
                <Image
                  source={require("../../assets/loja.png")}
                  style={styles.transactionIcon}
                />
                <View style={styles.transactionTextContainer}>
                  <Text style={styles.transactionCategory}>Lazer</Text>
                  <Text style={styles.transactionDescription}>Spotify</Text>
                </View>
                <Text style={styles.transactionAmount}>R$ 8,50</Text>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoText}>Melhor dia para compra</Text>
              <Text style={styles.cardInfoTextValue}>21</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoText}>Limite disponível</Text>
              <Text style={styles.cardInfoTextValue}>R$ 254,00</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.cardInfo}>
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoTitle}>Retiradas</Text>
                <Text style={styles.cardInfoAmount1}>R$ 538,00 </Text>
              </View>
              <View style={styles.line}></View>
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoTitle}>Depósitos</Text>
                <Text style={styles.cardInfoAmount}>R$ 268,00 </Text>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoText}>Rendimentos do mês</Text>
                <Text style={styles.cardInfoText}>R$ 0,75 </Text>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoText}>
                  Rendimento bruto + R$ 1,25
                </Text>
                <Text style={styles.cardInfoText}>+ R$ 1,25 </Text>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoText}>
                  Imposto de renda - R$ 0,50
                </Text>
                <Text style={styles.cardInfoText}>- R$ 0,50 </Text>
              </View>
            </View>
          </>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Escolha uma nova imagem de perfil
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleChooseImage}
            >
              <Text style={styles.modalButtonText}>Escolher imagem</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#45B5E4",
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    backgroundColor: "#45B5E4",
    height: 110,
    position: "relative",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  subContainer: {
    flex: 1,
    width: "100%",
    padding: 16,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    backgroundColor: "#FFF",
    position: "absolute",
    top: 110,
    left: 0,
    right: 0,
    bottom: 0,
  },
  balanceContainer: {
    marginBottom: 16,
    padding: 20,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF",
  },
  separator: {
    height: 2,
    backgroundColor: "#CCCCCC",
    marginVertical: 10,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    alignItems: "center",
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  creditCardContainer: {
    marginBottom: 16,
  },
  cardInfo: {
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardInfoAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  cardInfoAmount1: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff0000",
  },
  cardInfoText: {
    fontSize: 16,
    fontWeight: "500",
  },
  cardInfoTextValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4CAF50",
  },
  line: {
    width: "100%",
    height: 2,
    backgroundColor: "#FEA726",
    marginVertical: 10,
  },
  transactionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  transactionTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    textAlign: "right",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalButton: {
    backgroundColor: "#FEA726",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default HomeScreen;
