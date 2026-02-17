"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { ScheduleDay, CustomHeader } from "@/types";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
  },
  header: {
    textAlign: "center",
    marginBottom: 16,
    borderBottom: "2px solid #16A34A",
    paddingBottom: 12,
  },
  mosqueName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 2,
  },
  mosqueAddress: {
    fontSize: 9,
    color: "#4B5563",
    marginBottom: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    color: "#166534",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 9,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 16,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#166534",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 7,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5px solid #E5E7EB",
    fontSize: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "0.5px solid #E5E7EB",
    backgroundColor: "#F0FDF4",
    fontSize: 8,
  },
  cellNo: {
    width: "5%",
    textAlign: "center",
    padding: 4,
  },
  cellDay: {
    width: "7%",
    textAlign: "center",
    padding: 4,
  },
  cellDate: {
    width: "10%",
    textAlign: "center",
    padding: 4,
  },
  cellTime: {
    width: "9.75%",
    textAlign: "center",
    padding: 4,
    fontFamily: "Courier",
  },
  headerCell: {
    padding: 5,
    color: "#FFFFFF",
    fontSize: 7,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#9CA3AF",
    borderTop: "0.5px solid #E5E7EB",
    paddingTop: 8,
  },
});

interface PdfDocumentProps {
  scheduleData: ScheduleDay[];
  cityName: string;
  province: string;
  timezone: string;
  customHeader: CustomHeader;
}

export default function PdfDocumentComponent({
  scheduleData,
  cityName,
  province,
  timezone,
  customHeader,
}: PdfDocumentProps) {
  const headerColumns = [
    { label: "No", style: { ...styles.headerCell, width: "5%" } },
    { label: "Hari", style: { ...styles.headerCell, width: "7%" } },
    { label: "Tgl", style: { ...styles.headerCell, width: "10%" } },
    { label: "Imsak", style: { ...styles.headerCell, width: "9.75%" } },
    { label: "Subuh", style: { ...styles.headerCell, width: "9.75%" } },
    { label: "Terbit", style: { ...styles.headerCell, width: "9.75%" } },
    { label: "Dhuha", style: { ...styles.headerCell, width: "9.75%" } },
    { label: "Dzuhur", style: { ...styles.headerCell, width: "9.75%" } },
    { label: "Ashar", style: { ...styles.headerCell, width: "9.75%" } },
    { label: "Maghrib", style: { ...styles.headerCell, width: "9.75%" } },
    { label: "Isya", style: { ...styles.headerCell, width: "9.75%" } },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Custom Header */}
        <View style={styles.header}>
          {customHeader.mosqueName && (
            <Text style={styles.mosqueName}>{customHeader.mosqueName}</Text>
          )}
          {customHeader.address && (
            <Text style={styles.mosqueAddress}>{customHeader.address}</Text>
          )}
          {customHeader.contact && (
            <Text style={styles.mosqueAddress}>{customHeader.contact}</Text>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>
          JADWAL IMSAKIYAH RAMADAN 1447H / 2026M
        </Text>
        <Text style={styles.subtitle}>
          {cityName}, {province} ({timezone})
        </Text>

        {/* Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            {headerColumns.map((col) => (
              <View key={col.label} style={col.style}>
                <Text>{col.label}</Text>
              </View>
            ))}
          </View>

          {/* Data Rows */}
          {scheduleData.map((day, idx) => {
            const dayName = day.tanggal?.split(",")[0] || "";
            const dateNum = day.date?.split("-")[2] || "";
            const rowStyle = idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt;

            return (
              <View key={day.date} style={rowStyle}>
                <View style={styles.cellNo}>
                  <Text>{idx + 1}</Text>
                </View>
                <View style={styles.cellDay}>
                  <Text>{dayName.substring(0, 3)}</Text>
                </View>
                <View style={styles.cellDate}>
                  <Text>{dateNum}</Text>
                </View>
                <View style={styles.cellTime}>
                  <Text>{day.imsak}</Text>
                </View>
                <View style={styles.cellTime}>
                  <Text>{day.subuh}</Text>
                </View>
                <View style={styles.cellTime}>
                  <Text>{day.terbit}</Text>
                </View>
                <View style={styles.cellTime}>
                  <Text>{day.dhuha}</Text>
                </View>
                <View style={styles.cellTime}>
                  <Text>{day.dzuhur}</Text>
                </View>
                <View style={styles.cellTime}>
                  <Text>{day.ashar}</Text>
                </View>
                <View style={styles.cellTime}>
                  <Text>{day.maghrib}</Text>
                </View>
                <View style={styles.cellTime}>
                  <Text>{day.isya}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Sumber: Bimas Islam Kemenag RI | Si-Imsak - Jadwal Imsakiyah Ramadan 1447H</Text>
        </View>
      </Page>
    </Document>
  );
}
