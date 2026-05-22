import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/SlGVmQWMvBIdm8f4d4m2.woff2',
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  orgInfo: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  documentInfo: {
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: 20,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 4,
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  footer: {
    marginTop: 40,
    fontSize: 9,
    color: '#6b7280',
  },
  watermark: {
    position: 'absolute',
    top: '45%',
    left: '25%',
    fontSize: 60,
    color: '#dcfce7',
    opacity: 0.6,
    transform: 'rotate(-30deg)',
  },
});

interface DocumentPDFProps {
  document: any;
  org: any;
  client: any;
  lineItems: any[];
}

export const DocumentPDF: React.FC<DocumentPDFProps> = ({
  document,
  org,
  client,
  lineItems,
}) => {
  const isPaid = document.status === 'PAID' || document.type === 'RECEIPT';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {isPaid && (
          <Text style={styles.watermark}>PAID</Text>
        )}

        <View style={styles.header}>
          <View style={styles.orgInfo}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              {org?.name || 'Your Company'}
            </Text>
            <Text>{org?.address}</Text>
            <Text>{org?.email} • {org?.phone}</Text>
          </View>

          <View style={styles.documentInfo}>
            <Text style={styles.title}>{document.type}</Text>
            <Text style={{ fontSize: 12, marginTop: 4 }}>{document.number}</Text>
            <Text style={{ marginTop: 8 }}>
              Date: {new Date(document.issueDate).toLocaleDateString()}
            </Text>
            {document.dueDate && (
              <Text>Due: {new Date(document.dueDate).toLocaleDateString()}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Bill To:</Text>
          <Text>{client?.name || 'Client'}</Text>
          {client?.billingAddress && <Text>{client.billingAddress}</Text>}
          {client?.email && <Text>{client.email}</Text>}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 3 }}>Description</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>Qty</Text>
            <Text style={{ flex: 1.5, textAlign: 'right' }}>Unit Price</Text>
            <Text style={{ flex: 1.5, textAlign: 'right' }}>Total</Text>
          </View>

          {lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={{ flex: 3 }}>{item.description}</Text>
              <Text style={{ flex: 1, textAlign: 'right' }}>{item.quantity}</Text>
              <Text style={{ flex: 1.5, textAlign: 'right' }}>
                {(item.unitPriceCents / 100).toFixed(2)}
              </Text>
              <Text style={{ flex: 1.5, textAlign: 'right' }}>
                {((item.quantity * item.unitPriceCents) / 100).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>RM {(document.subtotalCents / 100).toFixed(2)}</Text>
          </View>
          {document.discountCents > 0 && (
            <View style={styles.totalRow}>
              <Text>Discount</Text>
              <Text>- RM {(document.discountCents / 100).toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text>Tax</Text>
            <Text>RM {(document.taxCents / 100).toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total</Text>
            <Text>RM {(document.totalCents / 100).toFixed(2)}</Text>
          </View>
        </View>

        {(document.notes || document.terms) && (
          <View style={{ marginTop: 30 }}>
            {document.notes && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold' }}>Notes</Text>
                <Text>{document.notes}</Text>
              </View>
            )}
            {document.terms && (
              <View>
                <Text style={{ fontWeight: 'bold' }}>Terms</Text>
                <Text>{document.terms}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text>Thank you for your business.</Text>
          <Text style={{ marginTop: 4 }}>
            This is a computer generated document from DocsFlow.
          </Text>
        </View>
      </Page>
    </Document>
  );
};