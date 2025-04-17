import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTheme} from "@/components/ThemeContext";
import {colors} from "@/components/ThemeColors";
import {fetchExchangeRates, ExchangeRate} from "@/services/exchangeRates";
import {fetchExchangeRatesFromFirestore} from "@/services/exchangeRatesFirestore";

export default function ExchangeCalculator() {
  const [amount, setAmount] = useState("");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const {theme} = useTheme();
  const themeColors = colors[theme];

  useEffect(() => {
    const loadRates = async () => {
      try {
        // Attempt to fetch from Firestore first
        const firestoreRates = await fetchExchangeRatesFromFirestore();

        // If Firestore has data, use it
        // Otherwise, fallback to the API
        if (firestoreRates.length > 0) {
          setExchangeRates(firestoreRates);
        } else {
          const apiRates = await fetchExchangeRates();
          setExchangeRates(apiRates);
        }
      } catch (error) {
        console.error("Error loading rates:", error);
        // Fallback to API as a last resort
        try {
          const rates = await fetchExchangeRates();
          setExchangeRates(rates);
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadRates();
  }, []);

  const averageRate = {
    name: "Promedio 📊",
    rate: Number(
      (
        exchangeRates.reduce((acc, curr) => acc + curr.rate, 0) /
        exchangeRates.length
      ).toFixed(2)
    ),
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const styles = StyleSheet.create({
    keyboardView: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 24,
      paddingTop: 36,
    },
    header: {
      alignItems: "center",
      marginBottom: 40,
    },
    inputPrompt: {
      fontSize: 28,
      fontWeight: "600",
      color: themeColors.text,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    inputContainer: {
      backgroundColor: "transparent",
      borderRadius: 20,
      marginBottom: 48,
    },
    input: {
      fontSize: 56,
      fontWeight: "bold",
      color: themeColors.primary,
      borderBottomWidth: 3,
      borderBottomColor: themeColors.primary,
      paddingVertical: 10,
      textAlign: "center",
    },
    ratesTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: themeColors.text,
      marginBottom: 24,
      letterSpacing: 0.5,
    },
    rateCard: {
      backgroundColor: themeColors.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    averageRate: {
      marginTop: 16,
      paddingTop: 24,
      borderTopWidth: 0,
      backgroundColor: themeColors.primary + "15", // Semi-transparent primary
    },
    rateName: {
      fontSize: 18,
      fontWeight: "700",
      color: themeColors.text,
      marginBottom: 12,
    },
    rateValues: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    rateText: {
      fontSize: 16,
      color: themeColors.textSecondary,
    },
    convertedAmount: {
      fontSize: 22,
      fontWeight: "bold",
      color: themeColors.success,
    },
    disclaimer: {
      marginTop: 24,
      fontSize: 14,
      color: themeColors.textSecondary,
      textAlign: "center",
      fontStyle: "italic",
    },
    footerSpace: {
      height: 40,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.inputPrompt}>Calculadora de Tasas 💵</Text>
          </View>

          <View style={styles.inputContainer}>
            {/* Overlayed centered placeholder */}
            {amount === "" && (
              <Text
                style={[
                  styles.input,
                  {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    textAlign: "center",
                    textAlignVertical: "center",
                    color: themeColors.textSecondary,
                    zIndex: 0,
                  },
                ]}
              >
                0
              </Text>
            )}
            <TextInput
              style={[styles.input, {zIndex: 1}]}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(text) => {
                // Replace commas with periods for decimal input
                let sanitized = text.replace(/,/g, ".");
                // Remove any non-numeric and non-decimal characters
                sanitized = sanitized.replace(/[^0-9.,]/g, "");
                // Ensure only one decimal point exists
                const parts = sanitized.split(".");
                if (parts.length > 2) {
                  sanitized = parts[0] + "." + parts.slice(1).join("");
                }
                // Limit to 7 characters
                sanitized = sanitized.slice(0, 7);
                setAmount(sanitized);
              }}
              placeholder=""
              textAlign="center"
              textAlignVertical="center"
            />
          </View>

          <Text style={styles.ratesTitle}>Tasas de Cambio 💱</Text>

          {loading ? (
            <ActivityIndicator size="large" color={themeColors.primary} />
          ) : (
            <>
              {exchangeRates.map((rate, index) => (
                <View key={index} style={styles.rateCard}>
                  <Text style={styles.rateName}>{rate.name}</Text>
                  <View style={styles.rateValues}>
                    <Text style={styles.rateText}>
                      1$ = Bs. {formatNumber(rate.rate)}
                    </Text>
                    <Text style={styles.convertedAmount}>
                      {amount
                        ? `${formatNumber(parseFloat(amount) * rate.rate)} Bs.`
                        : "0,00 Bs."}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={[styles.rateCard, styles.averageRate]}>
                <Text style={styles.rateName}>{averageRate.name}</Text>
                <View style={styles.rateValues}>
                  <Text style={styles.rateText}>
                    1$ = Bs. {formatNumber(averageRate.rate)}
                  </Text>
                  <Text style={styles.convertedAmount}>
                    {amount
                      ? `${formatNumber(
                          parseFloat(amount) * averageRate.rate
                        )} Bs.`
                      : "0,00 Bs."}
                  </Text>
                </View>
              </View>

              <Text style={styles.disclaimer}>
                * Las tasas son referenciales y pueden variar durante el día ⏰
              </Text>

              <View style={styles.footerSpace} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
