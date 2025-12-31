import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Option } = Select;

const PricingsList = () => {
  const [pricings, setPricings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPricings();
    fetchTours();
  }, []);

  const fetchPricings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_PRICINGS);
      const pricingsData = response.data?.data || response.data?.results || [];
      setPricings(Array.isArray(pricingsData) ? pricingsData : []);
    } catch (error) {
      console.error('Error fetching pricings:', error);
      message.error('Failed to load pricings');
      // Set dummy data
      setPricings([
        {
          id: 1,
          tour: { id: 1, title: 'Sikkim Adventure' },
          no_of_person: 2,
          adult_price: 48999,
          child_price: 40999,
          season_month: 'July - September',
          offer: null,
        },
        {
          id: 2,
          tour: { id: 1, title: 'Sikkim Adventure' },
          no_of_person: 3,
          adult_price: 58999,
          child_price: 53999,
          season_month: 'October - January',
          offer: { name: 'Diwali Dhamaka Sale' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_ALL_TOURS);
      const toursData = response.data?.data || response.data?.results || [];
      setTours(Array.isArray(toursData) ? toursData : []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setTours([]);
    }
  };

  const handleAdd = () => {
    setEditingPricing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (pricing) => {
    setEditingPricing(pricing);
    form.setFieldsValue({
      tour: pricing.tour?.id,
      no_of_person: pricing.no_of_person,
      adult_price: pricing.adult_price,
      child_price: pricing.child_price,
      season_month: pricing.season_month,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingPricing) {
        await apiClient.put(endpoints.GET_PRICING_DETAIL(editingPricing.id), values);
        message.success('Pricing updated successfully');
      } else {
        await apiClient.post(endpoints.GET_PRICINGS, values);
        message.success('Pricing created successfully');
      }
      setModalVisible(false);
      fetchPricings();
    } catch (error) {
      console.error('Error saving pricing:', error);
      message.error('Failed to save pricing');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_PRICING_DETAIL(id));
      message.success('Pricing deleted successfully');
      fetchPricings();
    } catch (error) {
      console.error('Error deleting pricing:', error);
      message.error('Failed to delete pricing');
    }
  };

  const columns = [
    {
      title: 'Tour',
      key: 'tour',
      render: (_, record) => record.tour?.title || 'N/A',
    },
    {
      title: 'People',
      dataIndex: 'no_of_person',
      key: 'no_of_person',
      sorter: (a, b) => a.no_of_person - b.no_of_person,
    },
    {
      title: 'Adult Price',
      dataIndex: 'adult_price',
      key: 'adult_price',
      render: (price) => `₹${price?.toLocaleString()}`,
      sorter: (a, b) => a.adult_price - b.adult_price,
    },
    {
      title: 'Child Price',
      dataIndex: 'child_price',
      key: 'child_price',
      render: (price) => `₹${price?.toLocaleString()}`,
      sorter: (a, b) => a.child_price - b.child_price,
    },
    {
      title: 'Season',
      dataIndex: 'season_month',
      key: 'season_month',
    },
    {
      title: 'Offer',
      key: 'offer',
      render: (_, record) => record.offer?.name || 'No Offer',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Are you sure you want to delete this pricing?',
                onOk: () => handleDelete(record.id),
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Pricing Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Pricing
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={pricings}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} pricings`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingPricing ? 'Edit Pricing' : 'Add Pricing'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="tour"
            label="Tour"
            rules={[{ required: true, message: 'Please select a tour' }]}
          >
            <Select placeholder="Select tour">
              {Array.isArray(tours) && tours.map(tour => (
                <Option key={tour.id} value={tour.id}>
                  {tour.title || tour.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="no_of_person"
            label="Number of People"
            rules={[{ required: true, message: 'Please enter number of people' }]}
          >
            <InputNumber
              min={1}
              max={50}
              style={{ width: '100%' }}
              placeholder="Enter number of people"
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="price"
              label=" Price (₹)"
              rules={[{ required: true, message: 'Please enter  price' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Enter adult price"
              />
            </Form.Item>

          </div>

          <Form.Item
            name="season"
            label="Season"
            rules={[{ required: true, message: 'Please enter season' }]}
          >
            <Input placeholder="e.g., July - September" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPricing ? 'Update' : 'Create'} Pricing
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PricingsList;