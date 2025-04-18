import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTheme} from "@/components/ThemeContext";
import {colors} from "@/components/ThemeColors";
import {
  AppText,
  AppTextBold,
  AppTextSemiBold,
  AppTextMedium,
} from "@/components/FontProvider";

export default function About() {
  const {theme} = useTheme();
  const themeColors = colors[theme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      padding: 24,
      paddingTop: 36,
    },
    header: {
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: themeColors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: themeColors.textSecondary,
      lineHeight: 24,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: themeColors.text,
      marginBottom: 16,
    },
    card: {
      backgroundColor: themeColors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: themeColors.text,
      marginBottom: 8,
    },
    cardText: {
      fontSize: 15,
      color: themeColors.textSecondary,
      lineHeight: 22,
    },
    link: {
      color: themeColors.primary,
      textDecorationLine: "underline",
      marginTop: 8,
    },
    footer: {
      marginTop: 24,
      alignItems: "center",
    },
    version: {
      fontSize: 14,
      color: themeColors.textSecondary,
      marginBottom: 8,
    },
    footerSpace: {
      height: 40,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppTextBold style={styles.title}>Acerca de BSRate</AppTextBold>
          <AppText style={styles.subtitle}>
            Una aplicación para consultar tasas de cambio de bolívar a dólar en
            Venezuela.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppTextSemiBold style={styles.sectionTitle}>
            ¿Cómo funciona?
          </AppTextSemiBold>
          <View style={styles.card}>
            <AppText style={styles.cardText}>
              BSRate recopila información de diferentes fuentes para brindarte
              las tasas de cambio más actualizadas. Puedes ingresar un monto en
              dólares y obtener su equivalente en bolívares según diferentes
              proveedores.
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppTextSemiBold style={styles.sectionTitle}>Fuentes</AppTextSemiBold>
          <View style={styles.card}>
            <AppTextMedium style={styles.cardTitle}>
              Información actualizada
            </AppTextMedium>
            <AppText style={styles.cardText}>
              Las tasas mostradas son referenciales y pueden variar a lo largo
              del día. Los datos se actualizan periódicamente para ofrecerte la
              información más precisa.
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppTextSemiBold style={styles.sectionTitle}>
            Contacto
          </AppTextSemiBold>
          <View style={styles.card}>
            <AppText style={styles.cardText}>
              ¿Tienes preguntas, comentarios o sugerencias? Ponte en contacto
              con nosotros:
            </AppText>
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:contact@bsrate.app")}
            >
              <AppText style={styles.link}>contact@bsrate.app</AppText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <AppText style={styles.version}>Versión 1.0.0</AppText>
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}
