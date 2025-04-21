import React, {useState, useEffect} from "react";
import {
  View,
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
import {
  AppText,
  AppTextInput,
  AppTextBold,
  AppTextSemiBold,
  AppTextMedium,
} from "@/components/FontProvider";
import {LinearGradient} from "expo-linear-gradient";

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
      fontSize: 24,
      fontWeight: "700",
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
      fontSize: 38,
      fontWeight: "bold",
      color: themeColors.text,
      backgroundColor: themeColors.primary + "90",
      borderRadius: 20,
      paddingVertical: 10,
      textAlign: "center",
    },
    ratesTitle: {
      fontSize: 20,
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
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
    },
    averageRate: {
      borderTopWidth: 0,
      backgroundColor: themeColors.primary + "90",
      borderLeftWidth: 4,
      borderLeftColor: themeColors.primary,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 8,
    },
    rateName: {
      fontSize: 16,
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
      fontSize: 14,
      color: themeColors.text,
      opacity: 0.8,
    },
    convertedAmount: {
      fontSize: 18,
      fontWeight: "bold",
      color: themeColors.text,
    },
    disclaimer: {
      marginTop: 24,
      fontSize: 12,
      color: themeColors.text,
      opacity: 0.7,
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
            <AppTextSemiBold style={styles.inputPrompt}>
              Calculadora de Tasas 💵
            </AppTextSemiBold>
          </View>

          <View style={styles.inputContainer}>
            <AppTextInput
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
                sanitized = sanitized.slice(0, 9);
                setAmount(sanitized);
              }}
              placeholder="0"
              textAlign="center"
              textAlignVertical="center"
            />
          </View>

          <AppTextSemiBold style={styles.ratesTitle}>
            Tasas de Cambio 💱
          </AppTextSemiBold>

          {loading ? (
            <ActivityIndicator size="large" color={themeColors.primary} />
          ) : (
            <>
              {exchangeRates.map((rate, index) => {
                // Determine card styling based on rate type
                const getBorderColor = () => {
                  if (rate.name.includes("BCV")) return "#3498db";
                  if (rate.name.includes("Paralelo")) return "#2ecc71";
                  return "rgba(0,0,0,0.05)";
                };

                return (
                  <View
                    key={index}
                    style={[
                      styles.rateCard,
                      {borderLeftWidth: 4, borderLeftColor: getBorderColor()},
                    ]}
                  >
                    <AppTextMedium style={styles.rateName}>
                      {rate.name}
                    </AppTextMedium>
                    <View style={styles.rateValues}>
                      <AppText style={styles.rateText}>
                        1$ = Bs. {formatNumber(rate.rate)}
                      </AppText>
                      <AppTextBold style={styles.convertedAmount}>
                        {amount
                          ? `${formatNumber(
                              parseFloat(amount) * rate.rate
                            )} Bs.`
                          : "0,00 Bs."}
                      </AppTextBold>
                    </View>
                  </View>
                );
              })}

              <View style={[styles.rateCard, styles.averageRate]}>
                <AppTextMedium style={styles.rateName}>
                  {averageRate.name}
                </AppTextMedium>
                <View style={styles.rateValues}>
                  <AppText style={styles.rateText}>
                    1$ = Bs. {formatNumber(averageRate.rate)}
                  </AppText>
                  <AppTextBold style={styles.convertedAmount}>
                    {amount
                      ? `${formatNumber(
                          parseFloat(amount) * averageRate.rate
                        )} Bs.`
                      : "0,00 Bs."}
                  </AppTextBold>
                </View>
              </View>

              <AppText style={styles.disclaimer}>
                * Las tasas son referenciales y pueden variar durante el día ⏰
              </AppText>

              <View style={styles.footerSpace} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
