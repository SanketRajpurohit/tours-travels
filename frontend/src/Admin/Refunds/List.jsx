import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  message,
  Tag,
  Input,
  Select,
} from 'antd';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Search } = Input;
const { Option } = Select;

const RefundsList = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_REFUNDS);
      const refundsData = response.data?.data || response.data?.results || [];
      setRefunds(Array.isArray(refundsData) ? refundsData : []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      message.error('Failed to load refunds');
      // Set dummy data
      setRefunds([
        {
          id: 1,
          cancellation: { id: 1, booking: { id: 1, user: { username: 'mike_wilson' } } },
          refunded_payment: 40000,
          cancellation_charges: 8999,
          refund_date: '2024-08-11',
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
    };
    return colors[status] || 'default';
  };

  const filteredRefunds = Array.isArray(refunds) ? refunds.filter((refund) => {
    const matchesSearch =
      refund.cancellation?.booking?.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      refund.cancellation?.booking?.id?.toString().includes(searchText);
    const matchesStatus = filterStatus === 'all' || refund.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  const columns = [
    {
      title: 'Refund ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id}`,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => record.cancellation?.booking?.user?.username || 'N/A',
    },
    {
      title: 'Booking ID',
      key: 'booking',
      render: (_, record) => `#${record.cancellation?.booking?.id}` || 'N/A',
    },
    {
      title: 'Refunded Amount',
      dataIndex: 'refunded_payment',
      key: 'refunded_payment',
      render: (amount) => `₹${amount?.toLocaleString()}`,
      sorter: (a, b) => a.refunded_payment - b.refunded_payment,
    },
    {
      title: 'Cancellation Charges',
      dataIndex: 'cancellation_charges',
      key: 'cancellation_charges',
      render: (amount) => `₹${amount?.toLocaleString()}`,
      sorter: (a, b) => a.cancellation_charges - b.cancellation_charges,
    },
    {
      title: 'Refund Date',
      dataIndex: 'refund_date',
      key: 'refund_date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.refund_date) - new Date(b.refund_date),
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
          <h2 style={{ margin: 0 }}>Refunds Management</h2>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search refunds..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Filter by status"
            style={{ width: 150 }}
            value={filterStatus}
            onChange={setFilterStatus}
          >
            <Option value="all">All Status</Option>
            <Option value="completed">Completed</Option>
            <Option value="pending">Pending</Option>
            <Option value="failed">Failed</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRefunds}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} refunds`,
          }}
        />
      </Card>
    </div>
  );
};

export default RefundsList;