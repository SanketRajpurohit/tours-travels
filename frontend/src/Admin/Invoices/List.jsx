import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Card,
  message,
  Input,
  Select,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Search } = Input;
const { Option } = Select;

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_INVOICES);
      const invoicesData = response.data?.data || response.data?.results || [];
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      message.error('Failed to load invoices');
      // Set dummy data
      setInvoices([
        {
          id: 1,
          booking: {
            id: 1,
            user: { username: 'john_doe' },
            tour: { title: 'Sikkim Adventure' }
          },
          total_amount: 146997,
          advance_payment: 47000,
          balance_amount: 99997,
          invoice_description: 'Through UPI ID',
          created_at: '2024-02-08',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (invoiceId) => {
    // TODO: Implement invoice download
    message.info('Invoice download feature will be implemented');
  };

  const handleView = (invoiceId) => {
    // TODO: Implement invoice view
    message.info('Invoice view feature will be implemented');
  };

  const filteredInvoices = Array.isArray(invoices) ? invoices.filter((invoice) => {
    const matchesSearch =
      invoice.booking?.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.booking?.tour?.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.id?.toString().includes(searchText);
    return matchesSearch;
  }) : [];

  const columns = [
    {
      title: 'Invoice ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `INV-${id}`,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => record.booking?.user?.username || 'N/A',
    },
    {
      title: 'Tour',
      key: 'tour',
      render: (_, record) => record.booking?.tour?.title || 'N/A',
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `₹${amount?.toLocaleString()}`,
      sorter: (a, b) => a.total_amount - b.total_amount,
    },
    {
      title: 'Advance Payment',
      dataIndex: 'advance_payment',
      key: 'advance_payment',
      render: (amount) => `₹${amount?.toLocaleString()}`,
      sorter: (a, b) => a.advance_payment - b.advance_payment,
    },
    {
      title: 'Balance Amount',
      dataIndex: 'balance_amount',
      key: 'balance_amount',
      render: (amount) => `₹${amount?.toLocaleString()}`,
      sorter: (a, b) => a.balance_amount - b.balance_amount,
    },
    {
      title: 'Created Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id)}
          >
            Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Invoices Management</h2>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search invoices..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} invoices`,
          }}
        />
      </Card>
    </div>
  );
};

export default InvoicesList;