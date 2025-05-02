import React, {useState, useEffect, useRef} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTheme} from "@/components/ThemeContext";
import {colors} from "@/components/ThemeColors";
import {ExchangeRate} from "@/services/exchangeRates";
import {getRatesUsingCache} from "@/services/cachedExchangeRates";
import {
  AppText,
  AppTextInput,
  AppTextBold,
  AppTextSemiBold,
} from "@/components/FontProvider";
import {setStringAsync} from "expo-clipboard";

export default function ExchangeCalculator() {
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const [rawInputValue, setRawInputValue] = useState("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputMode, setInputMode] = useState<"USD_TO_BS" | "BS_TO_USD">(
    "USD_TO_BS"
  );
  const [copiedAmount, setCopiedAmount] = useState<null | string>(null);
  const {theme} = useTheme();
  const themeColors = colors[theme];

  useEffect(() => {
    const loadRates = async () => {
      try {
        // Use the new cache-aware function to get exchange rates
        const rates = await getRatesUsingCache();
        setExchangeRates(rates);
      } catch (error) {
        console.error("Error loading rates:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRates();
  }, []);

  // Reset copied amount indicator after 2 seconds
  useEffect(() => {
    if (copiedAmount) {
      const timeout = setTimeout(() => {
        setCopiedAmount(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [copiedAmount]);

  // Cleanup for debounce timer on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const averageRate = {
    name: "Promedio 📊",
    rate:
      exchangeRates.length > 0
        ? Number(
            (
              exchangeRates.reduce((acc, curr) => acc + curr.rate, 0) /
              exchangeRates.length
            ).toFixed(2)
          )
        : 0,
  };

  // Extract BCV and Paralelo rates
  const bcvRate = exchangeRates.find((rate) => rate.name.includes("BCV")) || {
    name: "BCV",
    rate: 0,
  };

  const paraleloRate = exchangeRates.find((rate) =>
    rate.name.includes("Paralelo")
  ) || {
    name: "Paralelo",
    rate: 0,
  };

  // Prepare table data
  const tableData = [
    {
      label: "BCV 🏦",
      ...bcvRate,
      color: "#3498db",
    },
    {
      label: "Promedio 📊",
      ...averageRate,
      color: themeColors.primary,
    },
    {
      label: "Paralelo 💸",
      ...paraleloRate,
      color: "#2ecc71",
    },
  ];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const toggleInputMode = () => {
    setInputMode((prevMode) =>
      prevMode === "USD_TO_BS" ? "BS_TO_USD" : "USD_TO_BS"
    );
    // Reset both input states when changing modes
    setRawInputValue("");
    setDebouncedAmount("");
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  };

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await setStringAsync(value);
      setCopiedAmount(label);

      // Show platform-specific feedback
      if (Platform.OS === "android") {
        ToastAndroid.show("Copiado al portapapeles", ToastAndroid.SHORT);
      } else if (Platform.OS === "ios") {
        // iOS doesn't have a built-in toast, we'll use the copied state for visual feedback
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  // Handler for text input changes with debouncing
  const handleInputChange = (text: string) => {
    // Update raw input immediately for responsive UI
    setRawInputValue(text);

    // Clear any existing debounce timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timer to process the input after a delay
    debounceTimeoutRef.current = setTimeout(() => {
      // Sanitize the input
      let sanitized = text.replace(/,/g, ".");
      sanitized = sanitized.replace(/[^0-9.,]/g, "");

      // Ensure only one decimal point exists
      const parts = sanitized.split(".");
      if (parts.length > 2) {
        sanitized = parts[0] + "." + parts.slice(1).join("");
      }

      // Limit to 9 characters
      sanitized = sanitized.slice(0, 9);

      // Update the debounced amount for calculations
      setDebouncedAmount(sanitized);
    }, 450);
  };

  const styles = StyleSheet.create({
    keyboardView: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: themeColors.background,
      padding: 24,
      paddingTop: 36,
    },
    header: {
      alignItems: "center",
      marginBottom: 20,
    },
    inputPrompt: {
      fontSize: 24,
      fontWeight: "700",
      color: themeColors.text,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    // Toggle styles
    toggleContainer: {
      flexDirection: "row",
      backgroundColor: themeColors.surface,
      borderRadius: 16,
      marginBottom: 10,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    toggleButtonActive: {
      backgroundColor: themeColors.primary,
    },
    toggleText: {
      fontSize: 16,
      color: themeColors.textSecondary,
    },
    toggleTextActive: {
      color: "#fff",
      fontWeight: "600",
    },
    // Table styles
    tableContainer: {
      backgroundColor: themeColors.surface,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 15,
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
      paddingVertical: 8,
    },
    tableRow: {
      flexDirection: "row",
      padding: 16,
      alignItems: "center",
      marginHorizontal: 4,
      marginVertical: 4,
      borderRadius: 16,
      backgroundColor: themeColors.surface,
    },
    leftColumn: {
      flex: 1,
    },
    rightColumn: {
      justifyContent: "center",
      alignItems: "flex-end",
      minWidth: 100,
    },
    tableLabel: {
      fontSize: 17,
      fontWeight: "700",
      color: themeColors.text,
      marginBottom: 2,
    },
    tableRate: {
      fontSize: 14,
      color: themeColors.text,
    },
    tableAmount: {
      fontSize: 17,
      fontWeight: "bold",
      color: themeColors.text,
    },
    copyableAmount: {
      padding: 8,
      borderRadius: 8,
    },
    copiedHighlight: {
      backgroundColor: "rgba(46, 204, 113, 0.2)",
    },
    // Input styles
    inputContainer: {
      backgroundColor: "transparent",
      marginBottom: 20,
    },
    input: {
      fontSize: 38,
      fontWeight: "bold",
      color: themeColors.text,
      backgroundColor: "transparent",
      paddingVertical: 10,
      textAlign: "center",
      borderBottomWidth: 2,
      borderBottomColor: themeColors.primary,
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
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color={themeColors.primary} />
          ) : (
            <>
              {/* Mode Toggle */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    inputMode === "USD_TO_BS" && styles.toggleButtonActive,
                  ]}
                  onPress={() => toggleInputMode()}
                  activeOpacity={0.8}
                >
                  <AppText
                    style={[
                      styles.toggleText,
                      inputMode === "USD_TO_BS" && styles.toggleTextActive,
                    ]}
                  >
                    USD → Bs
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    inputMode === "BS_TO_USD" && styles.toggleButtonActive,
                  ]}
                  onPress={() => toggleInputMode()}
                  activeOpacity={0.8}
                >
                  <AppText
                    style={[
                      styles.toggleText,
                      inputMode === "BS_TO_USD" && styles.toggleTextActive,
                    ]}
                  >
                    Bs → USD
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Table of rates */}
              <View style={styles.tableContainer}>
                {tableData.map((row, index) => {
                  // Calculate the formatted conversion amount using debouncedAmount
                  const convertedAmount =
                    debouncedAmount && row.rate
                      ? inputMode === "USD_TO_BS"
                        ? `${formatNumber(
                            parseFloat(debouncedAmount) * row.rate
                          )} Bs.`
                        : `${formatNumber(
                            parseFloat(debouncedAmount) / row.rate
                          )} $`
                      : inputMode === "USD_TO_BS"
                      ? "0,00 Bs."
                      : "0,00 $";

                  return (
                    <View key={index} style={styles.tableRow}>
                      <View style={styles.leftColumn}>
                        <AppTextSemiBold style={styles.tableLabel}>
                          {row.label}
                        </AppTextSemiBold>
                        <AppText style={styles.tableRate}>
                          1$ = Bs. {formatNumber(row.rate)}
                        </AppText>
                      </View>
                      <View style={styles.rightColumn}>
                        <TouchableOpacity
                          style={[
                            styles.copyableAmount,
                            copiedAmount === row.label &&
                              styles.copiedHighlight,
                          ]}
                          onPress={() =>
                            copyToClipboard(convertedAmount, row.label)
                          }
                          activeOpacity={0.7}
                        >
                          <AppTextBold style={styles.tableAmount}>
                            {convertedAmount}
                          </AppTextBold>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Input for amount */}
              <View style={styles.inputContainer}>
                <AppTextInput
                  key={inputMode}
                  style={styles.input}
                  keyboardType="numeric"
                  autoComplete="additional-name"
                  autoCorrect={false}
                  spellCheck={false}
                  importantForAutofill="noExcludeDescendants"
                  value={rawInputValue}
                  onChangeText={handleInputChange}
                  placeholder={
                    inputMode === "USD_TO_BS" ? "Monto $" : "Monto Bs."
                  }
                  textAlign="center"
                  textAlignVertical="center"
                />
              </View>

              <AppText style={styles.disclaimer}>
                * Las tasas son referenciales y pueden variar durante el día ⏰
              </AppText>

              <AppText style={styles.disclaimer}>
                * Toca un monto convertido para copiarlo al portapapeles 📋
              </AppText>

              <View style={styles.footerSpace} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
