import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Tag,
  Modal,
  Descriptions,
  Input,
  Select,
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Search } = Input;
const { Option } = Select;

const InquiriesList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_INQUIRIES);
      const inquiriesData = response.data.results || response.data || [];
      setInquiries(inquiriesData);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      message.error('Failed to load inquiries');
      // Set dummy data
      setInquiries([
        {
          id: 1,
          tour: { id: 1, title: 'Sikkim Adventure' },
          user: { username: 'devesh_patel', email: 'devesh@gmail.com' },
          name: 'Devesh Patel',
          email: 'devesh@gmail.com',
          contact: '7784561190',
          date: '2024-11-17',
          inquiry_message: 'WHAT IS PRICE OF VIETNAM(2 PERSON PACKAGE)',
          status: 'pending',
        },
        {
          id: 2,
          tour: { id: 2, title: 'Vietnam Discovery' },
          user: { username: 'amit_shah', email: 'amit@example.com' },
          name: 'Amit Shah',
          email: 'amit@example.com',
          contact: '9876543210',
          date: '2024-11-15',
          inquiry_message: 'I want to book a family package for 4 people. Please provide details about accommodation and itinerary.',
          status: 'responded',
        },
        {
          id: 3,
          tour: null,
          user: null,
          name: 'Priya Sharma',
          email: 'priya@example.com',
          contact: '8765432109',
          date: '2024-11-10',
          inquiry_message: 'Looking for honeymoon packages to Goa. What are the best options available?',
          status: 'pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (inquiryId, newStatus) => {
    try {
      await apiClient.patch(endpoints.GET_INQUIRY_DETAIL(inquiryId), {
        status: newStatus,
      });
      message.success(`Inquiry ${newStatus} successfully`);
      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      message.error('Failed to update inquiry status');
    }
  };

  const showInquiryDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setDetailModalVisible(true);
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchText.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchText.toLowerCase()) ||
      inquiry.inquiry_message.toLowerCase().includes(searchText.toLowerCase()) ||
      inquiry.tour?.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      responded: 'green',
      closed: 'gray',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Inquiry ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.contact}</div>
        </div>
      ),
    },
    {
      title: 'Tour',
      key: 'tour',
      render: (_, record) => (
        record.tour ? (
          <Tag color="blue">{record.tour.title}</Tag>
        ) : (
          <Tag color="gray">General Inquiry</Tag>
        )
      ),
    },
    {
      title: 'Message',
      dataIndex: 'inquiry_message',
      key: 'inquiry_message',
      ellipsis: true,
      width: 300,
      render: (message) => (
        <div style={{ maxWidth: 280 }}>
          {message.length > 100 ? `${message.substring(0, 100)}...` : message}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
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
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Responded', value: 'responded' },
        { text: 'Closed', value: 'closed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showInquiryDetails(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, 'responded')}
              >
                Mark Responded
              </Button>
              <Button
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, 'closed')}
              >
                Close
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Inquiries Management</h2>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search inquiries..."
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
            <Option value="pending">Pending</Option>
            <Option value="responded">Responded</Option>
            <Option value="closed">Closed</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredInquiries}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} inquiries`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Inquiry Details Modal */}
      <Modal
        title={`Inquiry Details - #${selectedInquiry?.id}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedInquiry && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Customer Name" span={2}>
              {selectedInquiry.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedInquiry.email}
            </Descriptions.Item>
            <Descriptions.Item label="Contact">
              {selectedInquiry.contact}
            </Descriptions.Item>
            <Descriptions.Item label="Tour" span={2}>
              {selectedInquiry.tour ? (
                <Tag color="blue">{selectedInquiry.tour.title}</Tag>
              ) : (
                <Tag color="gray">General Inquiry</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Inquiry Date">
              {new Date(selectedInquiry.date).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedInquiry.status)}>
                {selectedInquiry.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Message" span={2}>
              <div style={{
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '6px',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedInquiry.inquiry_message}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default InquiriesList;