import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../Service/firebaseConfig"; // Importe o db da sua configuração do Firebase
import { useNavigation } from "@react-navigation/native";

const RegistroChavePIX = () => {
  const navigation = useNavigation();
  const [tipoRegistro, setTipoRegistro] = useState(null);
  const [valorChavePIX, setValorChavePIX] = useState("");
  const [userId, setUserId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [chavesPix, setChavesPix] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("Usuário não autenticado");
          return;
        }
        
        setUserId(userId);

        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          throw new Error("Usuário não encontrado no banco de dados.");
        }

        setUser(userDoc.data());
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarUsuario();
  }, []);

  useEffect(() => {
    const carregarChavesPix = async () => {
      try {
        if (!user) {
          console.error("Usuário não encontrado");
          return;
        }
  
        const chavesPix = user.usuario?.conta?.chavePix || [];
        setChavesPix(chavesPix);
      } catch (error) {
        console.error("Erro ao carregar chaves PIX:", error);
      }
    };
  
    if (user) {
      carregarChavesPix();
    }
  }, [user]);

  const gerarChavePIXAleatoria = () => {
    const caracteresValidos =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const comprimentoChave = 32;
    let chavePIX = "";
    for (let i = 0; i < comprimentoChave; i++) {
      const indiceCaractere = Math.floor(
        Math.random() * caracteresValidos.length
      );
      chavePIX += caracteresValidos.charAt(indiceCaractere);
    }
    return chavePIX;
  };

  const handleTipoRegistroChange = (itemValue) => {
    setTipoRegistro(itemValue);
    if (itemValue === "aleatoria") {
      setValorChavePIX(gerarChavePIXAleatoria());
    } else if (itemValue === "cpf" && user && user.usuario.cpf) {
      setValorChavePIX(user.usuario.cpf);
    } else {
      setValorChavePIX("");
    }
  };

  const validarChavePix = (tipo, chave) => {
    switch (tipo) {
      case "cpf":
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(chave);
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave);
      case "telefone":
        return /^\(\d{2}\) \d{5}-\d{4}$/.test(chave);
      case "aleatoria":
        return true;
      default:
        return false;
    }
  };

  const adicionarChavePix = async (tipo, chave) => {
    try {

      if (!user.usuario) {
        Alert.alert("Erro", "Usuário não encontrado!");
        return;
      }

      if (!user.usuario.conta) {
        Alert.alert("Erro", "O usuário não possui conta!");
        return;
      }

      if (!user.usuario.conta.chavesPix) {
        user.usuario.conta.chavesPix = [];
      }

      if (
        user.usuario.conta.chavesPix.some(
          (chaveExistente) =>
            chaveExistente.tipo === tipo && chaveExistente.valor === chave
        )
      ) {
        Alert.alert(
          "Erro",
          `A chave ${tipo} já está cadastrada nesta conta.`
        );
        return;
      }

      if (!validarChavePix(tipo, chave)) {
        Alert.alert("Erro", `Chave Pix inválida para o tipo ${tipo}.`);
        return;
      }

      const updatedConta = {
        ...user.usuario
      };

      updatedConta.conta.chavePix = { tipo: tipo, valor: chave };

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        usuario: updatedConta,
      });

      setValorChavePIX("");
      setModalVisible(false);

      await AsyncStorage.setItem("chavePix", chave);

      Alert.alert("Sucesso", "Chave PIX registrada com sucesso!");
      console.log("Chave PIX registrada com sucesso na conta do usuário!");
    } catch (error) {
      console.error("Erro ao registrar chave PIX:", error);
      Alert.alert("Erro", "Ocorreu um erro ao registrar a chave PIX.");
    }
  };

  const handleRegistrarChavePIX = async () => {
    const chavePIX = valorChavePIX;

    try {
      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado!");
        return;
      }

      if (!tipoRegistro) {
        Alert.alert("Erro", "Selecione um tipo de chave PIX!");
        return;
      }

      await adicionarChavePix(tipoRegistro, chavePIX);
    } catch (error) {
      console.error("Erro ao registrar chave PIX:", error);
      Alert.alert("Erro", "Ocorreu um erro ao registrar a chave PIX.");
    }
  };

  const formatarCPF = (cpf) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarTelefone = (telefone) => {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  return (
    <View style={styles.container}>
      {user && (
        <View>
          <TouchableOpacity
            style={styles.cadastrarButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.cadastrarButtonText}>Cadastrar Chave</Text>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Cadastrar Chave PIX</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.tipoRegistroContainer}>
                    <Text style={styles.tipoRegistroLabel}>Tipo de Chave:</Text>
                    <View style={styles.tipoRegistroButtons}>
                      <TouchableOpacity
                        onPress={() => handleTipoRegistroChange("cpf")}
                        style={[
                          styles.tipoRegistroButton,
                          tipoRegistro === "cpf" &&
                            styles.tipoRegistroButtonSelected,
                        ]}
                      >
                        <Text style={styles.tipoRegistroButtonText}>CPF</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleTipoRegistroChange("email")}
                        style={[
                          styles.tipoRegistroButton,
                          tipoRegistro === "email" &&
                            styles.tipoRegistroButtonSelected,
                        ]}
                      >
                        <Text style={styles.tipoRegistroButtonText}>E-mail</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleTipoRegistroChange("telefone")}
                        style={[
                          styles.tipoRegistroButton,
                          tipoRegistro === "telefone" &&
                            styles.tipoRegistroButtonSelected,
                        ]}
                      >
                        <Text style={styles.tipoRegistroButtonText}>
                          Telefone
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleTipoRegistroChange("aleatoria")}
                        style={[
                          styles.tipoRegistroButton,
                          tipoRegistro === "aleatoria" &&
                            styles.tipoRegistroButtonSelected,
                        ]}
                      >
                        <Text style={styles.tipoRegistroButtonText}>
                          Chave Aleatória
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {tipoRegistro && tipoRegistro !== "aleatoria" && (
                    <View style={styles.inputContainer}>
                      <TextInput
                        value={
                          tipoRegistro === "cpf"
                            ? formatarCPF(valorChavePIX)
                            : tipoRegistro === "telefone"
                            ? formatarTelefone(valorChavePIX)
                            : valorChavePIX
                        }
                        onChangeText={setValorChavePIX}
                        placeholder={`Digite sua chave ${tipoRegistro}`}
                        keyboardType={
                          tipoRegistro === "telefone"
                            ? "phone-pad"
                            : "default"
                        }
                        editable={tipoRegistro !== "cpf"}
                        style={styles.input}
                      />
                    </View>
                  )}

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.registrarButton}
                      onPress={handleRegistrarChavePIX}
                    >
                      <Text style={styles.registrarButtonText}>
                        Cadastrar Chave
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  cadastrarButton: {
    width: "100%",
    backgroundColor: "#45B5E4",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  cadastrarButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  tipoRegistroContainer: {
    marginBottom: 20,
  },
  tipoRegistroLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tipoRegistroButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tipoRegistroButton: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tipoRegistroButtonSelected: {
    backgroundColor: "#45B5E4",
    borderColor: "#45B5E4",
  },
  tipoRegistroButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    height: 50
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  registrarButton: {
    backgroundColor: "#45B5E4",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  registrarButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default RegistroChavePIX;