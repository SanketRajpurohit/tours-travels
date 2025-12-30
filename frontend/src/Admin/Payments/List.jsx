import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  message,
  Tag,
  Input,
  Select,
  DatePicker,
} from 'antd';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_PAYMENTS);
      const paymentsData = response.data.results || response.data || [];
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      message.error('Failed to load payments');
      // Set dummy data
      setPayments([
        {
          id: 1,
          user: { username: 'john_doe' },
          booking: { id: 1 },
          amount: 48999,
          payment_method: 'net banking',
          transaction_date: '2024-02-08',
          status: 'completed',
        },
        {
          id: 2,
          user: { username: 'jane_smith' },
          booking: { id: 2 },
          amount: 104999,
          payment_method: 'upi',
          transaction_date: '2024-02-10',
          status: 'completed',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'green',
      pending: 'orange',
      failed: 'red',
      refunded: 'purple',
    };
    return colors[status] || 'default';
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.user?.username.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.booking?.id.toString().includes(searchText);
    const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const columns = [
    {
      title: 'Payment ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id}`,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => record.user?.username || 'N/A',
    },
    {
      title: 'Booking ID',
      key: 'booking',
      render: (_, record) => `#${record.booking?.id}` || 'N/A',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount?.toLocaleString()}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => method?.toUpperCase(),
    },
    {
      title: 'Transaction Date',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.transaction_date) - new Date(b.transaction_date),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Payments Management</h2>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search payments..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Filter by method"
            style={{ width: 150 }}
            value={filterMethod}
            onChange={setFilterMethod}
          >
            <Option value="all">All Methods</Option>
            <Option value="upi">UPI</Option>
            <Option value="net banking">Net Banking</Option>
            <Option value="credit card">Credit Card</Option>
            <Option value="debit card">Debit Card</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} payments`,
          }}
        />
      </Card>
    </div>
  );
};

export default PaymentsList;